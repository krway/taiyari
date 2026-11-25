import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase/server';
export async function GET(request:NextRequest){
 const origin=process.env.APP_URL ?? 'http://localhost:3000';
 const code=request.nextUrl.searchParams.get('code');
 if(code && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){
  const client=await supabase();
  const {error}=await client.auth.exchangeCodeForSession(code);
  if(!error) return NextResponse.redirect(new URL('/dashboard',origin));
 }
 return NextResponse.redirect(new URL('/login?error=google',origin));
}
