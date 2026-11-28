import {
  type DraftProvider,
  GeminiDraftProvider,
  generateNewsDraft,
} from "./news-drafts.ts";

const input = {
  headline: "Test source headline",
  sourceUrl: "https://example.com/article",
  excerpt: "The fixture article says the test train has four carriages.",
};
const english = { title: "Test train", summary: input.excerpt, takeaways: [] };
const question = {
  question: "How many carriages does the test train have?",
  options: ["Two", "Three", "Four", "Five"],
  correctIndex: 2,
  explanation: "The excerpt states there are four carriages.",
  evidence: "the test train has four carriages",
};
const output = {
  english,
  hindi: {
    title: "परीक्षण रेलगाड़ी",
    summary: "परीक्षण रेलगाड़ी में चार डिब्बे हैं।",
    takeaways: [],
  },
  relevant: true,
  topics: ["Railways"],
  questions: [question],
};
const mock = (value: unknown): DraftProvider => ({
  model: "mock",
  generate: () =>
    Promise.resolve({
      output: value,
      usage: { promptTokens: 12, outputTokens: 40 },
    }),
});

Deno.test("records validated mock draft provenance and usage", async () => {
  const result = await generateNewsDraft(mock(output), input);
  if (
    result.model !== "mock" || result.sourceUrl !== input.sourceUrl ||
    result.draft.questions[0].correctIndex !== 2 ||
    result.usage.outputTokens !== 40
  ) throw new Error("Draft provenance or usage missing");
});

Deno.test("rejects unsupported evidence, duplicate questions and invalid answer keys", async () => {
  for (
    const questions of [
      [{ ...question, evidence: "the moon is made of cheese" }],
      [question, question],
      [{ ...question, correctIndex: 5 }],
      [{ ...question, options: ["Two", "two", "Four", "Five"] }],
    ]
  ) {
    let rejected = false;
    try {
      await generateNewsDraft(mock({ ...output, questions }), input);
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error("Invalid draft passed validation");
  }
});

Deno.test("Gemini integration sends a structured schema and preserves returned usage", async () => {
  const request: typeof fetch = (_url, init) => {
    const body = JSON.parse(String(init?.body));
    if (
      body.generationConfig.responseJsonSchema.type !== "object" ||
      new Headers(init?.headers).get("x-goog-api-key") !== "test-key"
    ) throw new Error("Invalid provider request");
    return Promise.resolve(Response.json({
      candidates: [{
        finishReason: "STOP",
        content: { parts: [{ text: JSON.stringify(output) }] },
      }],
      usageMetadata: { promptTokenCount: 25, candidatesTokenCount: 48 },
    }));
  };
  const provider = new GeminiDraftProvider(
    "test-key",
    "gemini-test",
    1024,
    request,
  );
  const result = await generateNewsDraft(provider, input);
  if (result.usage.promptTokens !== 25 || result.usage.outputTokens !== 48) {
    throw new Error("Invalid usage");
  }
});
