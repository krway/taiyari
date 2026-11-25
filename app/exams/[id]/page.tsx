import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exams } from '../../../lib/exams';
export default async function Exam({params}: {params: Promise<{id:string}>}) {
 const {id}=await params;
 const exam=exams.find(e=>e.id===id && e.available);
 if(!exam) notFound();
 return <main className="mx-auto max-w-4xl px-6 py-12"><Link href="/exams">← All exams</Link><h1 className="my-8 text-4xl font-bold">{exam.name}</h1><p>This track is under development.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{['Current affairs','Mathematics','Reasoning','General awareness'].map(topic=><article key={topic} className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">{topic}</h2><p className="mt-2 text-sm text-slate-500">Content coming soon</p></article>)}</div></main>;
}
