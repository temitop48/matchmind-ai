import Link from "next/link";
import { getUpcomingWorldCupMatches } from "../lib/fixtures";
import { generatePrediction } from "../lib/predictionEngine";
import { calculatePredictionQuality } from "../lib/predictionQuality";
import { getMarketLearningWeights } from "../lib/learningWeights";
export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const matches = await getUpcomingWorldCupMatches();
  const weights = await getMarketLearningWeights();

  const predictions = await Promise.all(
  matches.map(async (match) => {
    const prediction = await generatePrediction(match);
    const quality = calculatePredictionQuality(prediction, weights);

    return {
      match,
      prediction,
      quality,
    };
  })
);

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
            Daily World Cup Predictions
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Prediction board
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            A daily view of upcoming World Cup matches, prediction confidence,
            risk level, quality score, and covered markets.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {predictions.map(({ match, prediction, quality }) => (
            <article
              key={match.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-300">
                    {match.competition}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {match.homeTeam} vs {match.awayTeam}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {match.date} • {match.time} • {match.venue}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                  <div className="rounded-2xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Risk</p>
                    <p className="mt-1 font-bold">{prediction.riskLevel}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Model</p>
                    <p className="mt-1 font-bold">{prediction.modelVersion}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Markets</p>
                    <p className="mt-1 font-bold">
                      {prediction.markets.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Quality</p>
                    <p className="mt-1 font-bold">{quality.score}%</p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                {prediction.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {prediction.markets.slice(0, 5).map((market) => (
                  <span
                    key={market.name}
                    className="rounded-full bg-slate-950 px-3 py-2 text-xs text-slate-300"
                  >
                    {market.name}: {market.pick}
                  </span>
                ))}
              </div>

              <Link
                href={`/matches/${match.id}`}
                className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300"
              >
                Open full analysis
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}