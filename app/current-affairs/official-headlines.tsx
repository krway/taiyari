type Headline = {
  source_name: string;
  source_url: string;
  headline: string;
  published_at: string;
};

export function OfficialHeadlines({ headlines, unavailable, hindi }: {
  headlines: Headline[];
  unavailable: boolean;
  hindi: boolean;
}) {
  const date = new Intl.DateTimeFormat(hindi ? 'hi-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  return (
    <section className="my-8" aria-labelledby="official-updates">
      <h2 id="official-updates" className="text-2xl font-semibold">
        {hindi ? 'आधिकारिक समाचार' : 'Official updates'}
      </h2>
      <p className="mt-2 text-slate-700">
        {hindi ? 'प्रकाशक की मूल सुर्खियाँ और स्रोत लिंक।' : 'Original publisher headlines and links.'}
      </p>
      {unavailable && <p role="alert" className="mt-4">
        {hindi ? 'आधिकारिक समाचार अभी उपलब्ध नहीं हैं।' : 'Official updates are temporarily unavailable.'}
      </p>}
      {!unavailable && headlines.length === 0 && <p className="mt-4">
        {hindi ? 'अभी कोई आधिकारिक समाचार उपलब्ध नहीं है।' : 'No official updates are available yet.'}
      </p>}
      {headlines.length > 0 && (
        <ul className="mt-4 grid gap-3">
          {headlines.map((item) => (
            <li key={item.source_url} className="rounded-xl bg-white p-4">
              <p className="text-sm text-slate-600">
                {item.source_name} · <time dateTime={item.published_at}>{date.format(new Date(item.published_at))}</time>
              </p>
              <a href={item.source_url} className="mt-1 block break-words font-semibold underline">
                {item.headline}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
