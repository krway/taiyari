import Link from 'next/link';
import { authenticate } from './actions';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string;notice?:string}>}){
 const {error,notice}=await searchParams;
 const messages:Record<string,string>={invalid:'Enter an email and a password of at least eight characters.',config:'Authentication has not been configured yet.',signup:'Could not create account. Try again.',credentials:'Unable to sign in. Check your credentials.'};
 return <main className="mx-auto max-w-md px-6 py-12"><Link href="/">← TAIYARI</Link><h1 className="my-8 text-3xl font-bold">Your study journey starts here</h1><form action={authenticate} className="grid gap-4 rounded-2xl bg-white p-6"><label>Email<input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border p-3"/></label><label>Password<input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-lg border p-3"/></label>{error&&<p role="alert">{messages[error]??'Please try again.'}</p>}{notice==='confirm'&&<p>Check your email to confirm your account, then sign in.</p>}<button name="intent" value="login" className="rounded-lg bg-[#101d3a] p-3 text-white">Sign in</button><button name="intent" value="signup" className="rounded-lg border p-3">Create account</button></form></main>;
}
