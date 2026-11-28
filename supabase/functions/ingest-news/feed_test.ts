import { fetchFeed, parseFeed } from "./feed.ts";

const endpoint = new URL("https://www.pib.gov.in/rss/");
function equal(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

Deno.test("empty RSS is valid", () => {
  equal(
    parseFeed(
      "<rss><channel><title>PIB</title></channel></rss>",
      endpoint,
      "pib",
    ),
    [],
  );
});

Deno.test("RSS normalizes official links and removes duplicates", () => {
  const [row, duplicate] = parseFeed(
    `<rss><channel>
    <item><title>One &amp; two</title><link>/news?b=2&amp;a=1&amp;utm_source=rss#top</link></item>
    <item><title>Repeated</title><link>https://www.pib.gov.in/news?a=1&amp;b=2</link></item>
    <item><title>External</title><link>https://example.org/news</link></item>
  </channel></rss>`,
    endpoint,
    "pib",
  );
  equal(row?.source_url, "https://www.pib.gov.in/news?a=1&b=2");
  equal(row?.headline, "One & two");
  equal(duplicate, undefined);
});

Deno.test("Atom uses the alternate link and publication date", () => {
  const [row] = parseFeed(
    `<feed xmlns="http://www.w3.org/2005/Atom"><entry>
    <title>Update</title><link rel="self" href="/api"/><link rel="alternate" href="../story"/>
    <published>2026-11-28T08:30:00+05:30</published></entry></feed>`,
    endpoint,
    "pib",
  );
  equal(row?.source_url, "https://www.pib.gov.in/story");
  equal(row?.source_published_at, "2026-11-28T03:00:00.000Z");
});

Deno.test("follow an official redirect and reject a different host before fetching", async () => {
  const requested: string[] = [];
  const mock: typeof fetch = (url, options) => {
    requested.push(String(url));
    equal(options?.redirect, "manual");
    const location = requested.length === 1
      ? "/feed.xml"
      : "https://example.org";
    return Promise.resolve(
      new Response(null, { status: 302, headers: { location } }),
    );
  };
  let message = "";
  try {
    await fetchFeed(endpoint.href, "pib", mock);
  } catch (error) {
    message = (error as Error).message;
  }
  equal(message, "Unapproved URL");
  equal(requested, [endpoint.href, "https://www.pib.gov.in/feed.xml"]);
});

Deno.test("reject oversize feeds and a redirect loop", async () => {
  for (
    const [mock, expected] of [
      [
        () => Promise.resolve(new Response("x".repeat(2_000_001))),
        "Feed too large",
      ],
      [() =>
        Promise.resolve(
          new Response(null, { status: 302, headers: { location: "/loop" } }),
        ), "Invalid feed redirect"],
    ] as const
  ) {
    let message = "";
    try {
      await fetchFeed(endpoint.href, "pib", mock);
    } catch (error) {
      message = (error as Error).message;
    }
    equal(message, expected);
  }
});

Deno.test("reject DTD declarations and malformed XML", () => {
  for (const xml of ["<!DOCTYPE rss><rss/>", "<rss><channel></rss>"]) {
    let message = "";
    try {
      parseFeed(xml, endpoint, "pib");
    } catch (error) {
      message = (error as Error).message;
    }
    equal(message, "Invalid or unsupported XML");
  }
});
