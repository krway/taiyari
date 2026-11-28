import Link from 'next/link';
import { supabase } from '../../lib/supabase/server';
import { OfficialHeadlines } from './official-headlines';
export const dynamic = 'force-dynamic';
export default async function CurrentAffairs({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const {lang}=await searchParams;
 const hi=lang==='hi';
 const client=await supabase();
 const [{data,error}, official]=await Promise.all([
  client.from('current_affairs_articles').select('id,source_url,source_name,published_date,category,title_en,summary_en,relevance_en,title_hi,summary_hi,relevance_hi').eq('status','published').order('published_date',{ascending:false}).limit(50),
  client.rpc('official_current_affairs_headlines'),
 ]);
 return <main lang={hi?'hi':'en'} className="mx-auto max-w-5xl px-6 py-10">
 <header className="flex flex-wrap justify-between gap-4"><Link href="/" className="font-bold">TAIYARI</Link><Link href="/practice">{hi?'अभ्यास प्रश्न':'Practice questions'}</Link></header>
 <h1 className="mt-8 text-4xl font-bold">{hi?'दैनिक करेंट अफेयर्स':'Daily current affairs'}</h1>
 <p className="my-3">{hi?'परीक्षा की तैयारी के लिए समाचार, स्रोत और मुख्य बिंदु।':'Exam-focused news, source links and key takeaways.'}</p>
 <nav aria-label={hi?'भाषा':'Language'} className="my-6 flex gap-4"><Link href="/current-affairs?lang=en" aria-current={!hi?'page':undefined} lang="en">English</Link><Link href="/current-affairs?lang=hi" aria-current={hi?'page':undefined} lang="hi">हिन्दी</Link></nav>
 <OfficialHeadlines headlines={official.data ?? []} unavailable={!!official.error} hindi={hi} />
 {error?<p role="alert">{hi?'करेंट अफेयर्स लोड नहीं हो सके। कृपया बाद में फिर कोशिश करें।':'Unable to load current affairs. Please try again later.'}</p>:!data?.length?<p className="rounded-xl bg-white p-6">{hi?'अभी कोई समाचार सारांश प्रकाशित नहीं हुआ है। कृपया जल्द फिर देखें।':'No published briefings yet. Check back soon.'}</p>:<div className="grid gap-4">{data.map(a=><article key={a.id} className="rounded-xl bg-white p-6"><p className="text-sm text-slate-600">{a.published_date} · {a.category}</p><h2 className="my-3 text-xl font-bold">{hi?a.title_hi||a.title_en:a.title_en}</h2><p>{hi?a.summary_hi||a.summary_en:a.summary_en}</p><h3 className="mt-4 font-bold">{hi?'परीक्षा के लिए महत्त्व':'Exam relevance'}</h3><p>{hi?a.relevance_hi||a.relevance_en:a.relevance_en}</p><a className="mt-4 inline-block underline" href={a.source_url} target="_blank" rel="noopener noreferrer">{hi?'स्रोत':'Source'}: {a.source_name}</a></article>)}</div>}
 </main>;
}
