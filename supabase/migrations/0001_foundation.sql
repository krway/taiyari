create table public.exams (
 id text primary key,
 name text not null,
 category text not null,
 available boolean not null default false
);
insert into public.exams values ('rrb-ntpc','RRB NTPC','Railway',true),('rrb-group-d','RRB Group D','Railway',true),('ssc-cgl','SSC CGL','SSC',false),('ibps-po','IBPS PO','Banking',false);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 selected_exam_id text references public.exams(id),
 created_at timestamptz not null default now()
);
alter table public.exams enable row level security;
alter table public.profiles enable row level security;
create policy "Read exam catalog" on public.exams for select to anon, authenticated using (true);
create policy "Read own profile" on public.profiles for select to authenticated using (auth.uid()=id);
create policy "Insert own profile" on public.profiles for insert to authenticated with check (auth.uid()=id and (selected_exam_id is null or exists(select 1 from public.exams e where e.id=selected_exam_id and e.available)));
create policy "Update own profile" on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id and (selected_exam_id is null or exists(select 1 from public.exams e where e.id=selected_exam_id and e.available)));
grant select on public.exams to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
