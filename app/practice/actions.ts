'use server';

import { supabase } from '../../lib/supabase/server';

export type AnswerResult = {
  correct: boolean;
  correct_option: number;
  explanation: string;
} | { error: string } | null;

export async function submitAnswer(_previous: AnswerResult, form: FormData): Promise<AnswerResult> {
  const attempt = form.get('attempt');
  const question = form.get('question');
  const choice = form.get('choice');
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof attempt !== 'string' || typeof question !== 'string' || typeof choice !== 'string' ||
      !uuid.test(attempt) || !uuid.test(question) || !['1', '2', '3', '4'].includes(choice)) {
    return { error: 'Choose one of the four answers.' };
  }
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  const answer = { question, selected: Number(choice) };
  const request = user
    ? client.rpc('submit_practice_answer', { attempt_id: attempt, ...answer })
    : client.rpc('check_guest_practice_answer', answer);
  const { data, error } = await request.single();
  if (error || !data) return { error: 'Unable to submit this answer. Please try again.' };
  return data as Exclude<AnswerResult, null | { error: string }>;
}
