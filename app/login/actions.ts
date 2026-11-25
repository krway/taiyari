'use server';
import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabase/server';
export async function authenticate(form:FormData){
 const email=String(form.get('email')??'').trim(), password=String(form.get('password')??'');
 if(!email||password.length<8) redirect('/login?error=invalid');
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/login?error=config');
 const client=await supabase();
 if(form.get('intent')==='signup'){
 const {data,error}=await client.auth.signUp({email,password});
 if(error) redirect('/login?error=signup');
 if(!data.session) redirect('/login?notice=confirm');
 }else{
 const {error}=await client.auth.signInWithPassword({email,password});
 if(error) redirect('/login?error=credentials');
 }
 redirect('/dashboard');
}
export async function logout(){const client=await supabase();await client.auth.signOut();redirect('/');}

export async function signInWithGoogle(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect('/login?error=config');
 const origin=process.env.APP_URL ?? 'http://localhost:3000';
 const client=await supabase();
 const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('/auth/callback',origin).toString()}});
 if(error||!data.url) redirect('/login?error=google');
 redirect(data.url);
}
