import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { exams } from '../../lib/exams';
import { supabase } from '../../lib/supabase/server';
import { AnswerForm } from './answer-form';

export const dynamic = 'force-dynamic';

const pageSize = 10;
const difficultyOptions = ['easy', 'medium', 'hard'];
const origins = {
  verified_pyq: 'Verified previous-year question',
  editorial: 'Editorial practice',
  ai: 'AI-generated practice',
};
const originOptions = Object.entries(origins);
const examOptions = exams.filter((exam) => exam.available).map(({ id, name }) => [id, name]);

function Filter({ name, label, value, choices }: {
  name: string;
  label: string;
  value: string;
  choices: string[][];
}) {
  return (
    <label className="grid min-w-0 gap-1">{label}
      <select name={name} defaultValue={value} className="min-w-0 rounded border p-2">
        <option value="">All</option>
        {choices.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
      </select>
    </label>
  );
}

export default async function Practice({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  const [params, subjects, topics] = await Promise.all([
    searchParams,
    client.from('practice_subjects').select('slug,name').order('name'),
    client.from('practice_topics').select('id,name,subject_slug').order('name').limit(200),
  ]);
  const subjectOptions = (subjects.data ?? []).map(({ slug, name }) => [slug, name]);
  const topicOptions = (topics.data ?? []).map(({ id, name, subject_slug }) => [
    id, `${subjects.data?.find(({ slug }) => slug === subject_slug)?.name ?? subject_slug} · ${name}`,
  ]);
  const filters = {
    exam: examOptions.find(([id]) => id === params.exam)?.[0] ?? '',
    subject: subjectOptions.find(([id]) => id === params.subject)?.[0] ?? '',
    topic: topicOptions.find(([id]) => id === params.topic)?.[0] ?? '',
    origin: originOptions.find(([id]) => id === params.origin)?.[0] ?? '',
    difficulty: difficultyOptions.find((value) => value === params.difficulty) ?? '',
    year: typeof params.year === 'string' && /^(19|20)\d{2}$|^2100$/.test(params.year) ? params.year : '',
  };
  const page = typeof params.page === 'string' && /^[1-9]\d{0,3}$/.test(params.page) ? Number(params.page) : 1;
  const start = (page - 1) * pageSize;
  let query = client.from('practice_questions').select(
    'id, prompt, options, source_kind, source_reference, exam_year, exam_id, difficulty',
  ).order('created_at', { ascending: false }).order('id').range(start, start + pageSize);
  if (filters.exam) query = query.eq('exam_id', filters.exam);
  if (filters.subject) query = query.eq('subject_slug', filters.subject);
  if (filters.topic) query = query.eq('topic_id', filters.topic);
  if (filters.origin) query = query.eq('source_kind', filters.origin);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.year) query = query.eq('exam_year', Number(filters.year));
  const { data, error } = await query;
  const pageLink = (number: number) => '/practice?' + new URLSearchParams({
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
    page: String(number),
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <nav aria-label="Study" className="flex flex-wrap gap-4">
        <Link href="/" className="underline">Home</Link>
        <Link href="/current-affairs" className="underline">Current affairs</Link>
        {user && <Link href="/dashboard" className="underline">Dashboard</Link>}
      </nav>
      <h1 className="my-6 text-4xl font-bold">Practice questions</h1>
      {!user && <p className="mb-4"><Link className="underline" href="/login">Sign in</Link> to save your practice history.</p>}
      <form action="/practice" className="grid gap-4 rounded-xl bg-white p-5 sm:grid-cols-3">
        <Filter name="exam" label="Exam" value={filters.exam} choices={examOptions} />
        <Filter name="subject" label="Subject" value={filters.subject} choices={subjectOptions} />
        <Filter name="topic" label="Topic" value={filters.topic} choices={topicOptions} />
        <Filter name="origin" label="Question source" value={filters.origin} choices={originOptions} />
        <Filter name="difficulty" label="Difficulty" value={filters.difficulty}
          choices={difficultyOptions.map((value) => [value, value])} />
        <label className="grid gap-1">Year
          <input name="year" type="number" min={1900} max={2100} defaultValue={filters.year}
            className="min-w-0 rounded border p-2" />
        </label>
        <button className="w-fit rounded bg-[#101D3A] px-4 py-2 text-white">Apply filters</button>
      </form>
      {(error || subjects.error || topics.error) && <p className="mt-6" role="alert">Unable to load practice questions.</p>}
      {!error && !data?.length && <p className="mt-6">No published questions match these filters.</p>}
      <div className="my-6 grid gap-4">
        {data?.slice(0, pageSize).map((item) => (
          <article key={item.id} className="rounded-xl bg-white p-5">
            <p className="text-sm text-slate-600">
              {origins[item.source_kind as keyof typeof origins]} · {item.difficulty}
              {item.exam_year && ` · ${item.exam_year}`}
            </p>
            <h2 className="my-3 font-semibold">{item.prompt}</h2>
            {item.source_reference && <p className="break-words text-sm">{item.source_reference}</p>}
            <AnswerForm question={item.id} attempt={randomUUID()} options={item.options} />
          </article>
        ))}
      </div>
      <nav aria-label="Practice pages" className="flex gap-4">
        {page > 1 && <Link className="underline" href={pageLink(page - 1)}>Previous page</Link>}
        {(data?.length ?? 0) > pageSize && page < 9999 &&
          <Link className="underline" href={pageLink(page + 1)}>Next page</Link>}
      </nav>
    </main>
  );
}
