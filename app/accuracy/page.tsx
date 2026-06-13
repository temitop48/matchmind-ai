import Link from "next/link";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PredictionHistoryRow = {
  market_name: string;
  was_correct: boolean | null;
};

export default async function AccuracyPage() {
  const { data, error } = await supabase
    .from("prediction_history")
    .select("market_name, was_correct")
    .not("was_correct", "is", null);

  const rows = (data ?? []) as PredictionHistoryRow[];

  const total = rows.length;
  const correct = rows.filter((row) => row.was_correct === true).length;

  const byMarket: Record<
    string,
    { total: number; correct: number; accuracy: number }
  > = {};

  for (const row of rows) {
    if (!byMarket[row.market_name]) {
      byMarket[row.market_name] = { total: 0, correct: 0, accuracy: 0 };
    }

    byMarket[row.market_name].total += 1;

    if (row.was_correct) {
      byMarket[row.market_name].correct += 1;
    }
  }

  for (const market of Object.keys(byMarket)) {
    const item = byMarket[market];
    item.accuracy = Math.round((item.correct / item.total) * 100);
  }

  const markets = Object.entries(byMarket);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-emerald-300">
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
            Track how predictions perform across markets as match results are reviewed.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error.message}
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Reviewed Predictions</p>
            <p className="mt-2 text-3xl font-bold">{total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Correct Predictions</p>
            <p className="mt-2 text-3xl font-bold">{correct}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Overall Accuracy</p>
            <p className="mt-2 text-3xl font-bold">{accuracy}%</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-bold">Market Performance</h2>

          {markets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No reviewed predictions yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {markets.map(([market, item]) => (
                <div
                  key={market}
                  className="grid gap-3 rounded-2xl bg-slate-950 p-4 md:grid-cols-[1fr_120px_120px_120px]"
                >
                  <p className="font-semibold">{market}</p>
                  <p className="text-sm text-slate-400">Total: {item.total}</p>
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