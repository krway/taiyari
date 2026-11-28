'use server';

import { redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabase/server';

const path = '/admin/current-affairs';
const fields = [
  'published_date', 'category', 'title_en', 'summary_en', 'relevance_en',
  'title_hi', 'summary_hi', 'relevance_hi',
] as const;

export async function editArticle(form: FormData) {
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');

  const queueId = form.get('queueId');
  const action = form.get('action');
  if (typeof queueId !== 'string' || typeof action !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(queueId) || !['save', 'publish', 'unpublish', 'reject'].includes(action)) {
    redirect(path + '?result=error');
  }
  const { error } = await client.rpc('edit_news_article', {
    queue_id: queueId,
    action,
    fields: Object.fromEntries(fields.map((field) => [field, form.get(field)])),
  });
  redirect(path + (error ? '?result=error' : '?result=saved'));
}
