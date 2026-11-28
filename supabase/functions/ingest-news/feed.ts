import { XMLParser, XMLValidator } from "npm:fast-xml-parser@5.12.1";

const hosts: Record<string, string[]> = {
  pib: ["pib.gov.in", "www.pib.gov.in"],
  rbi: ["rbi.org.in", "www.rbi.org.in", "website.rbi.org.in"],
  isro: ["isro.gov.in", "www.isro.gov.in"],
};
const redirectStatuses = [301, 302, 303, 307, 308];
const maxBytes = 2_000_000;

function officialUrl(value: string, source: string, base?: URL): URL {
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    throw new Error("Invalid URL");
  }
  if (
    url.protocol !== "https:" || url.username || url.password || url.port ||
    !Object.hasOwn(hosts, source) || !hosts[source].includes(url.hostname)
  ) {
    throw new Error("Unapproved URL");
  }
  url.hash = "";
  return url;
}

export async function fetchFeed(
  value: string,
  source: string,
  request = fetch,
) {
  let url = officialUrl(value, source);
  const signal = AbortSignal.timeout(7000);
  for (let hop = 0; hop <= 3; hop++) {
    const response = await request(url, { redirect: "manual", signal });
    if (redirectStatuses.includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location || hop === 3) throw new Error("Invalid feed redirect");
      url = officialUrl(location, source, url);
      continue;
    }
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new Error(`Feed HTTP ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let xml = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) throw new Error("Feed too large");
        xml += decoder.decode(value, { stream: true });
      }
      return { url, xml: xml + decoder.decode() };
    } finally {
      await reader.cancel().catch(() => {});
    }
  }
  throw new Error("Invalid feed redirect");
}

type Entry = {
  title?: unknown;
  link?: unknown;
  pubDate?: string;
  published?: string;
  updated?: string;
};

function list<T>(value?: T | T[]): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function content(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (
    value && typeof value === "object" && "#text" in value &&
    typeof value["#text"] === "string"
  ) {
    return value["#text"].trim();
  }
  return "";
}

export function parseFeed(xml: string, url: URL, source: string) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) {
    throw new Error("Invalid or unsupported XML");
  }
  const parsed = new XMLParser({
    processEntities: true,
    ignoreAttributes: false,
    parseTagValue: false,
    removeNSPrefix: true,
  }).parse(xml);
  const channel = parsed.rss?.channel;
  const atom = parsed.feed;
  if (channel === undefined && atom === undefined) {
    throw new Error("Unsupported feed format");
  }
  const entries = list<Entry>(channel?.item ?? atom?.entry);
  const rows = new Map<string, {
    source_id: string;
    source_url: string;
    headline: string;
    source_published_at: string | null;
  }>();
  for (const entry of entries.slice(0, 50)) {
    if (!entry || typeof entry !== "object") continue;
    const title = content(entry.title).replace(/\s+/g, " ").slice(0, 500);
    const links = list(entry.link);
    const alternate = links.find((link): link is { "@_href": string } =>
      !!link && typeof link === "object" && "@_href" in link &&
      typeof link["@_href"] === "string" &&
      (!("@_rel" in link) || link["@_rel"] === "alternate")
    );
    const link = alternate?.["@_href"] ?? content(links[0]);
    if (!title || !link) continue;
    let article: URL;
    try {
      article = officialUrl(link, source, url);
    } catch {
      continue;
    }
    for (const name of [...article.searchParams.keys()]) {
      if (/^utm_|^(fbclid|gclid)$/i.test(name)) {
        article.searchParams.delete(name);
      }
    }
    article.searchParams.sort();
    const date = Date.parse(
      entry.pubDate ?? entry.published ?? entry.updated ?? "",
    );
    if (!rows.has(article.href)) {
      rows.set(article.href, {
        source_id: source,
        source_url: article.href,
        headline: title,
        source_published_at: Number.isFinite(date)
          ? new Date(date).toISOString()
          : null,
      });
    }
  }
  if (entries.length && !rows.size) {
    throw new Error("Feed has no valid articles");
  }
  return [...rows.values()];
}
