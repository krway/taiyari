'use client';

import { useActionState } from 'react';
import { submitAnswer } from './actions';

export function AnswerForm({ question, attempt, options }: {
  question: string;
  attempt: string;
  options: string[];
}) {
  const [result, submit, pending] = useActionState(submitAnswer, null);
  const answer = result && !('error' in result) ? result : null;
  return (
    <form action={submit} className="mt-4 grid gap-3">
      <input name="attempt" type="hidden" value={attempt} />
      <input name="question" type="hidden" value={question} />
      <fieldset disabled={pending || !!answer} className="grid gap-2">
        <legend className="mb-2 font-medium">Choose one answer</legend>
        {options.map((option, index) => (
          <label key={index} className="flex items-start gap-3 rounded border p-2">
            <input name="choice" type="radio" value={index + 1} required className="mt-1" />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <button disabled={pending || !!answer} className="w-fit rounded bg-[#101D3A] px-4 py-2 text-white disabled:opacity-60">
        {pending ? 'Checking…' : answer ? 'Submitted' : 'Check answer'}
      </button>
      {result && 'error' in result && <p role="alert">{result.error}</p>}
      {answer && (
        <div role="status" className="rounded bg-slate-100 p-3">
          <p className="font-semibold">{answer.correct ? 'Correct' : 'Incorrect'}</p>
          <p>Answer: {options[answer.correct_option - 1]}</p>
          <p>{answer.explanation}</p>
        </div>
      )}
    </form>
  );
}
