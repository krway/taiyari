import Link from 'next/link';
import { exams } from '../../lib/exams';
export default function Exams() {
 return <main className="mx-auto max-w-4xl px-6 py-12"><Link href="/">← TAIYARI</Link><h1 className="my-8 text-4xl font-bold">Choose your exam</h1><div className="grid gap-4 sm:grid-cols-2">{exams.map(exam=><article key={exam.id} className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-500">{exam.category}</p><h2 className="my-2 text-xl font-bold">{exam.name}</h2>{exam.available?<Link className="mt-3 inline-block rounded-lg bg-[#101d3a] px-4 py-2 text-white" href={'/exams/'+exam.id}>View track</Link>:<p>Coming later</p>}</article>)}</div></main>;
}
