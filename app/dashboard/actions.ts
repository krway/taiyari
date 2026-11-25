'use server';
import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabase/server';
import { exams } from '../../lib/exams';
export async function selectExam(form:FormData){
 const examId=String(form.get('exam')??'');
 if(!exams.some(e=>e.id===examId&&e.available)) redirect('/dashboard?error=exam');
 const client=await supabase();
 const {data:{user}}=await client.auth.getUser();
 if(!user) redirect('/login');
 const {error}=await client.from('profiles').upsert({id:user.id,selected_exam_id:examId});
 if(error) redirect('/dashboard?error=save');
 redirect('/dashboard');
}
