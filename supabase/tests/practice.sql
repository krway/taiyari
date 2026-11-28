insert into auth.users (id) values ('10000000-0000-0000-0000-000000000002');
insert into public.practice_questions (id,exam_id,subject_slug,source_kind,difficulty,prompt,options,status)
values ('20000000-0000-0000-0000-000000000002','rrb-ntpc','mathematics','editorial','easy','Fixture',array['1','2','3','4'],'published');
insert into public.practice_question_solutions values ('20000000-0000-0000-0000-000000000002',2,'Fixture solution');

do $$
begin
  if has_table_privilege('authenticated','public.practice_question_solutions','SELECT') then
    raise exception 'Answer key exposed';
  end if;
  if has_function_privilege('anon','public.submit_practice_answer(uuid,uuid,smallint)','EXECUTE') then
    raise exception 'Anonymous answer submission allowed';
  end if;
  begin
    insert into public.practice_questions (exam_id,subject_slug,source_kind,difficulty,prompt,options)
    values ('rrb-ntpc','mathematics','verified_pyq','easy','Unsourced',array['1','2','3','4']);
    raise exception 'Unverified previous-year question accepted';
  exception when check_violation then null;
  end;
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', false);
do $$
declare
  question uuid := '20000000-0000-0000-0000-000000000002';
  attempt uuid := '30000000-0000-0000-0000-000000000002';
begin
  if (select count(*) from public.practice_questions) <> 1 then raise exception 'Published question missing'; end if;
  if (select correct from public.submit_practice_answer(attempt,question,1::smallint)) is distinct from false then
    raise exception 'Incorrect answer scored incorrectly';
  end if;
  if (select correct_option from public.submit_practice_answer(attempt,question,1::smallint)) <> 2 then
    raise exception 'Retry did not return the original result';
  end if;
  if (select count(*) from public.practice_attempts) <> 1 then raise exception 'Duplicate attempt'; end if;
  perform set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
  if exists (select from public.practice_attempts) then raise exception 'Other student saw a private attempt'; end if;
end;
$$;
reset role;
