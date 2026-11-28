create table if not exists public.practice_subjects (
  slug text primary key,
  name text not null
);

create table if not exists public.practice_topics (
  id uuid primary key default gen_random_uuid(),
  subject_slug text not null references public.practice_subjects(slug),
  parent_id uuid,
  name text not null,
  unique (id, subject_slug),
  unique nulls not distinct (subject_slug, parent_id, name),
  foreign key (parent_id, subject_slug) references public.practice_topics(id, subject_slug),
  check (id is distinct from parent_id)
);

insert into public.practice_subjects (slug, name) values
  ('mathematics', 'Mathematics'),
  ('reasoning', 'Reasoning'),
  ('general-awareness', 'General Awareness'),
  ('general-science', 'General Science')
on conflict (slug) do nothing;

create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id text not null references public.exams(id),
  subject_slug text not null references public.practice_subjects(slug),
  topic_id uuid,
  source_kind text not null check (source_kind in ('verified_pyq', 'editorial', 'ai')),
  source_reference text check (length(source_reference) between 1 and 1000),
  exam_year integer check (exam_year between 1900 and 2100),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  prompt text not null check (length(btrim(prompt)) between 1 and 2000),
  options text[] not null check (
    array_ndims(options)=1 and array_lower(options, 1)=1 and cardinality(options)=4
    and array_position(options, null) is null
    and array_position(options, '') is null
  ),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  foreign key (topic_id, subject_slug) references public.practice_topics(id, subject_slug),
  check (source_kind <> 'verified_pyq' or (source_reference is not null and exam_year is not null))
);

create table if not exists public.practice_question_solutions (
  question_id uuid primary key references public.practice_questions(id) on delete cascade,
  correct_option smallint not null check (correct_option between 1 and 4),
  explanation text not null check (length(btrim(explanation)) between 1 and 3000)
);

create table if not exists public.practice_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.practice_questions(id),
  selected_option smallint not null check (selected_option between 1 and 4),
  correct_option smallint not null check (correct_option between 1 and 4),
  explanation text not null,
  submitted_at timestamptz not null default now()
);

create index if not exists practice_questions_catalog_idx
  on public.practice_questions (exam_id, subject_slug, topic_id, exam_year, difficulty) where status='published';
create index if not exists practice_questions_exam_idx on public.practice_questions (exam_id);
create index if not exists practice_questions_subject_idx on public.practice_questions (subject_slug, topic_id);
create index if not exists practice_questions_topic_idx on public.practice_questions (topic_id, subject_slug);
create index if not exists practice_topics_parent_idx on public.practice_topics (parent_id, subject_slug);
create index if not exists practice_attempts_question_idx on public.practice_attempts (question_id);
create index if not exists practice_attempts_user_idx on public.practice_attempts (user_id, submitted_at desc);

alter table public.practice_subjects enable row level security;
alter table public.practice_topics enable row level security;
alter table public.practice_questions enable row level security;
alter table public.practice_question_solutions enable row level security;
alter table public.practice_attempts enable row level security;

revoke all on public.practice_subjects, public.practice_topics, public.practice_questions,
  public.practice_question_solutions, public.practice_attempts from public, anon, authenticated;
grant select on public.practice_subjects, public.practice_topics to authenticated;
grant select on public.practice_questions, public.practice_attempts to authenticated;

create policy "Read practice subjects" on public.practice_subjects for select to authenticated using (true);
create policy "Read practice topics" on public.practice_topics for select to authenticated using (true);
create policy "Read published practice questions" on public.practice_questions for select to authenticated
  using (status = 'published' and exists (select 1 from public.exams e where e.id=exam_id and e.available));
create policy "Read own practice attempts" on public.practice_attempts for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.submit_practice_answer(attempt_id uuid, question uuid, selected smallint)
returns table (correct boolean, correct_option smallint, explanation text)
language plpgsql security definer
set search_path = ''
as $$
declare
  student uuid := auth.uid();
  recorded public.practice_attempts;
begin
  if student is null then raise exception 'Sign-in required' using errcode='42501'; end if;
  if attempt_id is null or question is null or selected is null or selected not between 1 and 4 then
    raise exception 'Invalid answer submission' using errcode='22023';
  end if;

  insert into public.practice_attempts (id,user_id,question_id,selected_option,correct_option,explanation)
    select attempt_id,student,q.id,selected,s.correct_option,s.explanation
    from public.practice_questions q
    join public.practice_question_solutions s on s.question_id=q.id
    join public.exams e on e.id=q.exam_id and e.available
    where q.id=question and q.status='published'
    on conflict (id) do nothing;

  select * into recorded from public.practice_attempts a
    where a.id=attempt_id and a.user_id=student and a.question_id=question and a.selected_option=selected;
  if not found then raise exception 'Answer could not be submitted' using errcode='22023'; end if;
  return query select recorded.correct_option=recorded.selected_option, recorded.correct_option, recorded.explanation;
end;
$$;

revoke all on function public.submit_practice_answer(uuid, uuid, smallint) from public, anon;
grant execute on function public.submit_practice_answer(uuid, uuid, smallint) to authenticated;
