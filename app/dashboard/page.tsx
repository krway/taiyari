import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabase/server';
import { exams } from '../../lib/exams';
import { logout } from '../login/actions';
import { selectExam } from './actions';
export default async function Dashboard({searchParams}:{searchParams:Promise<{error?:string}>}){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/login?error=config');
 const client=await supabase();
 const {data:{user}}=await client.auth.getUser();
 if(!user) redirect('/login');
 const [{data:profile,error:profileError},{data:isEditor}]=await Promise.all([
  client.from('profiles').select('selected_exam_id').eq('id',user.id).maybeSingle(),
  client.rpc('is_news_editor'),
 ]);
 const {error}=await searchParams;
 return <main className="mx-auto max-w-5xl px-6 py-10"><header className="flex justify-between"><Link href="/" className="font-bold">TAIYARI</Link><form action={logout}><button className="underline">Sign out</button></form></header><h1 className="my-8 text-4xl font-bold">Your study dashboard</h1><p>{user.email}</p>{isEditor===true&&<Link className="underline" href="/admin/current-affairs">Review current affairs</Link>}<form action={selectExam} className="my-6 grid gap-3 rounded-xl bg-white p-6"><label htmlFor="exam">Target exam</label><select id="exam" name="exam" defaultValue={profile?.selected_exam_id??''} required className="rounded-lg border p-3"><option value="" disabled>Choose an exam</option>{exams.filter(e=>e.available).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><button className="rounded-lg bg-[#101d3a] p-3 text-white">Save target</button>{(error||profileError)&&<p role="alert">Unable to load or save your profile. Check database setup and try again.</p>}</form>{profile?.selected_exam_id&&<Link href={'/exams/'+profile.selected_exam_id}>Open your exam track</Link>}<div className="mt-8 grid gap-4 sm:grid-cols-3">{['Current affairs','Practice questions','Revision'].map(t=><article key={t} className="rounded-xl bg-white p-5"><h2 className="font-bold">{t}</h2>{t==='Current affairs'?<Link className="underline" href="/current-affairs">Open daily briefing</Link>:t==='Practice questions'?<Link className="underline" href="/practice">Open practice</Link>:<p>Coming soon</p>}</article>)}</div></main>;
}
