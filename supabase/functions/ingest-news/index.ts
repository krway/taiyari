import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { XMLParser } from "npm:fast-xml-parser@5.3.6";
const hosts:Record<string,string[]>={pib:["pib.gov.in","www.pib.gov.in"],rbi:["rbi.org.in","www.rbi.org.in"],isro:["isro.gov.in","www.isro.gov.in"]};
function allowed(value:string,id:string){try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&hosts[id]?.includes(u.hostname)}catch{return false}}
Deno.serve(async(req)=>{
 const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 if(!key||req.headers.get("Authorization")!=="Bearer "+key)return new Response("Unauthorized",{status:401});
 const db=createClient(Deno.env.get("SUPABASE_URL")!,key);
 const {data:sources,error}=await db.from("news_sources").select("id,feed_url").eq("enabled",true).limit(3);
 if(error)return Response.json({error:"Source lookup failed"},{status:500});
 const results=[];
 for(const s of sources??[]){
 try{
 if(!s.feed_url||!allowed(s.feed_url,s.id))throw Error("Unapproved feed");
 const res=await fetch(s.feed_url,{redirect:"error",signal:AbortSignal.timeout(10000)});
 if(!res.ok||!res.body)throw Error("Feed unavailable");
 const reader=res.body.getReader();let size=0;const decoder=new TextDecoder();let xml="";
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2000000)throw Error("Feed too large");xml+=decoder.decode(value,{stream:true});}xml+=decoder.decode();}finally{await reader.cancel();}
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error("Unsupported XML");
 const parsed=new XMLParser({processEntities:false,ignoreAttributes:false,parseTagValue:false}).parse(xml);
 const items=parsed?.rss?.channel?.item;
 if(!items)throw Error("Unsupported or empty RSS");
 const rows=[];const seen=new Set<string>();
 for(const item of (Array.isArray(items)?items:[items]).slice(0,50)){
 const url=typeof item.link==="string"?item.link.trim():"";
 const title=typeof item.title==="string"?item.title.trim().slice(0,500):"";
 if(!title||!allowed(url,s.id)||seen.has(url))continue;
 seen.add(url);const date=Date.parse(item.pubDate??"");
 rows.push({source_id:s.id,source_url:url,headline:title,source_published_at:Number.isFinite(date)?new Date(date).toISOString():null});
 }
 if(rows.length){const {error}=await db.from("news_ingestion_queue").upsert(rows,{onConflict:"source_url",ignoreDuplicates:true});if(error)throw Error("Queue write failed");}
 results.push({source:s.id,candidates:rows.length,ok:true});
 }catch{results.push({source:s.id,ok:false});}
 }
 return Response.json({results},{status:results.some(r=>!r.ok)?502:200});
});
