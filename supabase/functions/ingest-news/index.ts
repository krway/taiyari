import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { fetchFeed, parseFeed } from "./feed.ts";

const staleRunMs = 120_000;

async function collect(feedUrl: string, source: string) {
  for (let attempt = 0;; attempt++) {
    try {
      const { xml, url } = await fetchFeed(feedUrl, source);
      return {
        rows: parseFeed(xml, url, source),
        attempts: attempt + 1,
      } as const;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Feed request failed";
      const transient = error instanceof TypeError ||
        (error instanceof DOMException &&
          ["AbortError", "TimeoutError"].includes(error.name)) ||
        /^Feed HTTP (408|429|5\d\d)$/.test(message);
      if (!transient || attempt === 1) {
        return {
          error: transient && !message.startsWith("Feed HTTP ")
            ? "Feed connection failed"
            : message,
          attempts: attempt + 1,
        } as const;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  if (!key || !url) {
    return new Response("Ingestion unavailable", { status: 503 });
  }
  const db = createClient(url, key, {
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(5000) }),
    },
  });
  if (req.headers.get("Authorization") !== `Bearer ${key}`) {
    const token = req.headers.get("X-Ingestion-Dispatch");
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { data, error } = await db.rpc("consume_news_ingestion_dispatch", {
      token,
    });
    if (error) {
      return new Response("Dispatch verification unavailable", { status: 503 });
    }
    if (data !== true) return new Response("Unauthorized", { status: 401 });
  }

  const { error: recoveryError } = await db.from("news_ingestion_runs")
    .update({ status: "interrupted", finished_at: new Date().toISOString() })
    .eq("status", "running").lt(
      "started_at",
      new Date(Date.now() - staleRunMs).toISOString(),
    );
  if (recoveryError) {
    return new Response("Run recovery failed", { status: 500 });
  }

  const { data: run, error: startError } = await db.from("news_ingestion_runs")
    .insert({ status: "running" }).select("id").single();
  if (startError?.code === "23505") {
    return new Response("Ingestion already running", { status: 409 });
  }
  if (!run || startError) {
    return new Response("Run creation failed", { status: 500 });
  }

  const { data: sources, error: lookupError } = await db.from("news_sources")
    .select("id,feed_url")
    .eq("enabled", true).order("id").limit(3);
  const results = [];
  if (lookupError) results.push({ ok: false, error: "Source lookup failed" });
  for (const source of sources ?? []) {
    const result = await collect(source.feed_url ?? "", source.id);
    if (!result.rows) {
      results.push({
        source: source.id,
        ok: false,
        error: result.error,
        attempts: result.attempts,
      });
    } else {
      const { count, error } = result.rows.length
        ? await db.from("news_ingestion_queue").upsert(result.rows, {
          onConflict: "source_url",
          ignoreDuplicates: true,
          count: "exact",
        })
        : { count: 0, error: null };
      results.push({
        source: source.id,
        candidates: result.rows.length,
        inserted: count,
        ok: !error,
        attempts: result.attempts,
        ...(error && { error: "Queue write failed" }),
      });
    }
    const { error: checkpointError } = await db.from("news_ingestion_runs")
      .update({ results }).eq("id", run.id).eq("status", "running");
    if (checkpointError) {
      return new Response("Run checkpoint failed", { status: 500 });
    }
  }
  const failed = results.some((result) => !result.ok);
  const { error: finishError } = await db.from("news_ingestion_runs")
    .update({
      status: failed ? "failed" : "succeeded",
      finished_at: new Date().toISOString(),
      results,
    })
    .eq("id", run.id).eq("status", "running");
  if (finishError) {
    return new Response("Run finalization failed", { status: 500 });
  }
  return Response.json({ runId: run.id, results }, {
    status: failed ? 502 : 200,
  });
});
