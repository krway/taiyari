export type SourceItem = {
 sourceUrl: string;
 sourceName: string;
 publishedDate: string;
 title: string;
 category: string;
};
export interface NewsSource {
 readonly name: string;
 collect(): Promise<SourceItem[]>;
}
export function normalizeSourceItem(item: SourceItem): SourceItem {
 const url = new URL(item.sourceUrl);
 if(url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid source URL');
 url.hash = '';
 for(const key of [...url.searchParams.keys()]) if(key.startsWith('utm_')) url.searchParams.delete(key);
 const date = new Date(item.publishedDate);
 if(!Number.isFinite(date.getTime())) throw new Error('Invalid publication date');
 const title = item.title.trim();
 const sourceName = item.sourceName.trim();
 const category = item.category.trim();
 if(!title || !sourceName || !category) throw new Error('Missing source metadata');
 return {sourceUrl:url.toString(),sourceName,publishedDate:date.toISOString().slice(0,10),title,category};
}
export async function collectSources(sources: NewsSource[]) {
 const items = new Map<string, SourceItem>();
 const errors: {source:string; message:string}[] = [];
 for(const source of sources){
  try {
   for(const raw of await source.collect()){
    try { const item=normalizeSourceItem(raw); if(!items.has(item.sourceUrl)) items.set(item.sourceUrl,item); }
    catch { errors.push({source:source.name,message:'Invalid source item'}); }
   }
  } catch { errors.push({source:source.name,message:'Source collection failed'}); }
 }
 return {items:[...items.values()],errors};
}
