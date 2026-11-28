import Link from 'next/link';
import { exams } from '../lib/exams';
export default function Home() {
 return <main className="mx-auto max-w-6xl px-6 py-8">
 <header className="flex flex-wrap items-center justify-between gap-4">
  <strong className="text-2xl tracking-widest">TAIYARI</strong>
  <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-4 gap-y-2">
   <Link href="/exams">Exams</Link>
   <Link href="/current-affairs">Current affairs</Link>
   <Link href="/practice">Practice</Link>
   <Link href="/login" className="rounded-lg border px-4 py-2">Sign in</Link>
   <Link href="/dashboard" className="rounded-xl bg-[#101d3a] px-4 py-2 text-white">Dashboard</Link>
  </nav>
 </header>
 <section className="my-12 rounded-3xl bg-[#101d3a] px-8 py-16 text-white md:px-16">
 <p className="font-semibold text-[#f5c542]">YOUR PREPARATION. YOUR FUTURE.</p>
 <h1 className="mt-5 max-w-3xl text-4xl font-bold md:text-6xl">Prepare smarter. Move closer to your dream job.</h1>
 <p className="mt-6 max-w-xl text-lg text-slate-200">A dedicated learning platform for Indian competitive exams, starting with Railways.</p>
 <Link href="/exams" className="mt-8 inline-block rounded-xl bg-[#f5c542] px-6 py-3 font-bold text-[#101d3a]">Choose your exam</Link>
 </section>
 <h2 className="text-2xl font-bold">Start with your target exam</h2>
 <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{exams.map(exam=><article key={exam.id} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{exam.category}</p><h3 className="mt-2 text-xl font-bold">{exam.name}</h3><p className="mt-3 text-sm">{exam.available?'Initial exam track':'Coming later'}</p></article>)}</div>
 <section className="my-12" aria-label="Public study tools">
  <div className="grid gap-4 sm:grid-cols-2">
   <Link href="/current-affairs" className="rounded-2xl bg-white p-6">
    <h2 className="font-bold underline">Daily current affairs</h2>
    <p className="mt-2 text-sm text-slate-600">Read official headlines and follow the original sources.</p>
   </Link>
   <Link href="/practice" className="rounded-2xl bg-white p-6">
    <h2 className="font-bold underline">Practice questions</h2>
    <p className="mt-2 text-sm text-slate-600">Browse questions and check your answers. Sign in to save your history.</p>
   </Link>
  </div>
 </section>
 </main>;
}
