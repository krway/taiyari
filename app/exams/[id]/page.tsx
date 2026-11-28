import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exams } from '../../../lib/exams';
export default async function Exam({params}: {params: Promise<{id:string}>}) {
 const {id}=await params;
 const exam=exams.find(e=>e.id===id && e.available);
 if(!exam) notFound();
 return (
  <main className="mx-auto max-w-4xl px-6 py-12">
   <Link href="/exams" className="underline">All exams</Link>
   <h1 className="my-8 text-4xl font-bold">{exam.name}</h1>
   <div className="grid gap-4 sm:grid-cols-2">
    <Link href="/current-affairs" className="rounded-xl border bg-white p-5 font-bold underline">Current affairs</Link>
    <Link href={`/practice?exam=${exam.id}`} className="rounded-xl border bg-white p-5 font-bold underline">
     Practice questions
    </Link>
   </div>
  </main>
 );
}
