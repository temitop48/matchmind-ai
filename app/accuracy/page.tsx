import Link from "next/link";

type AccuracyResponse = {
  success: boolean;
  total: number;
  correct: number;
  accuracy: number;
  byMarket: Record<
    string,
    {
      total: number;
      correct: number;
      accuracy: number;
    }
  >;
};

async function getAccuracy(): Promise<AccuracyResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/accuracy`, {
    cache: "no-store",
  });

  return response.json();
}

export default async function AccuracyPage() {
  const data = await getAccuracy();
  const markets = Object.entries(data.byMarket);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-emerald-300 hover:text-emerald-200"
        >
          Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            MatchMind Learning System
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Accuracy Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Track how predictions perform across markets as match results are
            reviewed.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Reviewed Predictions</p>
            <p className="mt-2 text-3xl font-bold">{data.total}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Correct Predictions</p>
            <p className="mt-2 text-3xl font-bold">{data.correct}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Overall Accuracy</p>
            <p className="mt-2 text-3xl font-bold">{data.accuracy}%</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-bold">Market Performance</h2>

          {markets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No reviewed predictions yet. Once match results are checked,
              accuracy by market will appear here.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {markets.map(([market, item]) => (
                <div
                  key={market}
                  className="grid gap-3 rounded-2xl bg-slate-950 p-4 md:grid-cols-[1fr_120px_120px_120px]"
                >
                  <p className="font-semibold">{market}</p>
                  <p className="text-sm text-slate-400">
                    Total: {item.total}
                  </p>
                  <p className="text-sm text-slate-400">
                    Correct: {item.correct}
                  </p>
                  <p className="text-sm font-bold text-emerald-300">
                    {item.accuracy}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}