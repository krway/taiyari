grant select on public.practice_subjects, public.practice_topics, public.practice_questions to anon;

alter policy "Read practice subjects" on public.practice_subjects to anon, authenticated;
alter policy "Read practice topics" on public.practice_topics to anon, authenticated;
alter policy "Read published practice questions" on public.practice_questions to anon, authenticated;

create or replace function public.check_guest_practice_answer(question uuid, selected smallint)
returns table (correct boolean, correct_option smallint, explanation text)
language sql stable security definer
set search_path = ''
as $$
  select s.correct_option = selected, s.correct_option, s.explanation
  from public.practice_questions q
  join public.practice_question_solutions s on s.question_id = q.id
  join public.exams e on e.id = q.exam_id and e.available
  where q.id = question and q.status = 'published' and selected between 1 and 4;
$$;

revoke all on function public.check_guest_practice_answer(uuid,smallint) from public, authenticated;
grant execute on function public.check_guest_practice_answer(uuid,smallint) to anon;
