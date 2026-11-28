import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabase/server';
import { editArticle } from './actions';

export const dynamic = 'force-dynamic';

type QueueEntry = {
  id: string;
  headline: string;
  source_url: string;
  source_day: string | null;
  queue_status: string;
  draft: Record<string, string> | null;
};

const editorialFields = [
  { name: 'title_en', label: 'English title', length: 200 },
  { name: 'summary_en', label: 'English summary', length: 2000 },
  { name: 'relevance_en', label: 'English exam relevance', length: 1000 },
  { name: 'title_hi', label: 'Hindi title', length: 200 },
  { name: 'summary_hi', label: 'Hindi summary', length: 2000 },
  { name: 'relevance_hi', label: 'Hindi exam relevance', length: 1000 },
];

export default async function NewsEditorialPage({ searchParams }: {
  searchParams: Promise<{ result?: string }>;
}) {
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const { data: editor } = await client.rpc('is_news_editor');
  if (!editor) notFound();

  const { result } = await searchParams;
  const { data, error } = await client.rpc('news_editor_queue');
  const queue = (data ?? []) as QueueEntry[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard" className="underline">Dashboard</Link>
      <h1 className="my-6 text-4xl font-bold">Current affairs review</h1>
      {result === 'saved' && <p role="status">Editorial change saved.</p>}
      {result === 'error' && <p role="alert">Unable to save the change. Check the article status and form fields.</p>}
      {error && <p role="alert">Unable to load the review queue.</p>}
      {!error && !queue.length && <p>The review queue is empty.</p>}
      <div className="grid gap-4">
        {queue.map((entry) => (
          <details key={entry.id} className="rounded-xl bg-white p-5">
            <summary className="cursor-pointer font-semibold">{entry.headline} · {entry.queue_status}</summary>
            <a href={entry.source_url} target="_blank" rel="noreferrer" className="my-4 inline-block underline">Read official source</a>
            <form action={editArticle} className="grid gap-4">
              <input type="hidden" name="queueId" value={entry.id} />
              <label className="grid gap-1">Source publication date
                <input type="date" name="published_date" className="rounded border p-2"
                  required defaultValue={entry.draft?.published_date ?? entry.source_day ?? ''} />
              </label>
              <label className="grid gap-1">Category
                <input name="category" required maxLength={200} className="rounded border p-2"
                  defaultValue={entry.draft?.category} />
              </label>
              {editorialFields.map(({ name, label, length }) => (
                <label key={name} className="grid gap-1">{label}
                  <textarea name={name} required maxLength={length} rows={length > 200 ? 4 : 2}
                    className="rounded border p-2" defaultValue={entry.draft?.[name]} />
                </label>
              ))}
              <div className="flex flex-wrap gap-3">
                {entry.queue_status !== 'processed' &&
                  <button name="action" value="save" className="rounded border px-3 py-2">Save draft</button>}
                <button name="action" value="publish" className="rounded bg-[#101D3A] px-3 py-2 text-white">
                  {entry.queue_status === 'processed' ? 'Update published briefing' : 'Publish briefing'}
                </button>
                {entry.queue_status === 'processed' &&
                  <button formNoValidate name="action" value="unpublish" className="rounded border px-3 py-2">Unpublish</button>}
                {entry.queue_status !== 'rejected' &&
                  <button formNoValidate name="action" value="reject" className="rounded border px-3 py-2">Reject</button>}
              </div>
            </form>
          </details>
        ))}
      </div>
    </main>
  );
}
