import Link from "next/link";
import { getMarketLearningWeights } from "../lib/learningWeights";
import { UpdateLearningButton } from "../components/UpdateLearningButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LearningPage() {
  const weights = await getMarketLearningWeights();
  const markets = Object.values(weights).sort(
    (a, b) => b.accuracy - a.accuracy
  );

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-emerald-300">
          ← Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            Self-Learning System
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Market Learning Weights
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            MatchMind continuously tracks prediction performance and adjusts
            trust levels for each market based on historical accuracy.
          </p>

          <div className="mt-6">
            <UpdateLearningButton />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Tracked Markets</p>
            <p className="mt-2 text-3xl font-bold">{markets.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Highest Accuracy</p>
            <p className="mt-2 text-3xl font-bold">
              {markets.length > 0
                ? `${Math.max(...markets.map((m) => m.accuracy))}%`
                : "0%"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Average Accuracy</p>
            <p className="mt-2 text-3xl font-bold">
              {markets.length > 0
                ? `${Math.round(
                    markets.reduce((sum, market) => sum + market.accuracy, 0) /
                      markets.length
                  )}%`
                : "0%"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Learning Status</p>
            <p className="mt-2 text-xl font-bold text-emerald-300">
              Active
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          {markets.length === 0 ? (
            <div className="rounded-2xl bg-slate-950 p-6">
              <p className="font-semibold">
                No learning weights available yet
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Review predictions and run the learning update process to begin
                building market confidence scores.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {markets.map((market) => (
                <div
                  key={market.market_name}
                  className="grid gap-3 rounded-2xl bg-slate-950 p-4 md:grid-cols-[1.5fr_120px_120px_120px_120px]"
                >
                  <div>
                    <p className="font-semibold">{market.market_name}</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Historical market performance
                    </p>
                  </div>

                  <p className="text-sm text-slate-400">
                    Reviewed: {market.total_reviewed}
                  </p>

                  <p className="text-sm text-slate-400">
                    Correct: {market.correct_count}
                  </p>

                  <p className="text-sm font-semibold text-emerald-300">
                    {market.accuracy}%
                  </p>

                  <p className="text-sm text-slate-300">
                    Weight: {market.trust_weight.toFixed(2)}
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