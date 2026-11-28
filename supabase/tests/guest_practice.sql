insert into public.practice_questions (id,exam_id,subject_slug,source_kind,difficulty,prompt,options)
values ('20000000-0000-0000-0000-000000000003','rrb-ntpc','mathematics','editorial','easy','Draft fixture',array['1','2','3','4']);
insert into public.practice_question_solutions values ('20000000-0000-0000-0000-000000000003',2,'Draft solution');
set role anon;
do $$
begin
  if (select count(*) from public.practice_questions) <> 1 then
    raise exception 'Guest catalog must contain only published questions';
  end if;
  if (select correct from public.check_guest_practice_answer('20000000-0000-0000-0000-000000000002',2::smallint)) is distinct from true then
    raise exception 'Guest answer check failed';
  end if;
  if exists (select from public.check_guest_practice_answer('20000000-0000-0000-0000-000000000003',2::smallint))
     or exists (select from public.check_guest_practice_answer('20000000-0000-0000-0000-000000000002',5::smallint)) then
    raise exception 'Guest check returned a result for a draft or invalid answer';
  end if;
  if has_table_privilege('public.practice_question_solutions','SELECT')
     or has_table_privilege('public.practice_attempts','SELECT')
     or has_table_privilege('public.practice_attempts','INSERT') then
    raise exception 'Guest can access private tables';
  end if;
end;
$$;
reset role;
do $$
begin
  if (select count(*) from public.practice_attempts) <> 1 then
    raise exception 'Guest practice wrote a tracked attempt';
  end if;
end;
$$;
