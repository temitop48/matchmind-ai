import Link from "next/link";
import { notFound } from "next/navigation";
import { modelInfo } from "../../lib/modelInfo";
import { getMatchById } from "../../lib/fixtures";
import { generatePrediction } from "../../lib/predictionEngine";
import { getMatchContext } from "../../lib/matchContext";
import { SavePredictionButton } from "../../components/SavePredictionButton";
import { calculatePredictionQuality } from "../../lib/predictionQuality";
import { generateAnalystExplanation } from "../../lib/analystExplanation";
import { getMarketLearningWeights } from "../../lib/learningWeights";
import { CreateProofButton } from "../../components/CreateProofButton";
export const dynamic = "force-dynamic";

type MatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const prediction = await generatePrediction(match);
  const weights = await getMarketLearningWeights();
  const quality = calculatePredictionQuality(prediction, weights);
  const analystExplanation = generateAnalystExplanation(
    match,
    prediction,
    quality,
  );
  const context = getMatchContext(match);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-emerald-300 hover:text-emerald-200"
        >
          Back to dashboard
        </Link>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            {match.competition}
          </p>

          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            {match.homeTeam} vs {match.awayTeam}
          </h1>

          <p className="mt-3 text-slate-400">
            {match.date} • {match.time} • {match.venue}
          </p>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Prediction Status</p>
            <p className="mt-2 text-2xl font-bold">{match.confidence}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Model Version</p>
            <p className="mt-2 text-2xl font-bold">{modelInfo.version}</p>
            <p className="mt-1 text-xs text-slate-500">{modelInfo.name}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Risk Level</p>
            <p className="mt-2 text-2xl font-bold">{prediction.riskLevel}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Markets Covered</p>
            <p className="mt-2 text-2xl font-bold">
              {prediction.markets.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Quality Score</p>
            <p className="mt-2 text-2xl font-bold">{quality.score}%</p>
            <p className="mt-1 text-xs text-slate-500">{quality.label}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Match Intelligence</h2>
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-300">
                Analyst Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {analystExplanation}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-950 p-4">
             <p className="text-sm font-semibold text-slate-200">Model Inputs</p>

             <div className="mt-3 flex flex-wrap gap-2">
               {modelInfo.inputs.map((input) => (
               <span
               key={input}
               className="rounded-full bg-slate-900 px-3 py-2 text-xs text-slate-300"
                >
               {input}
               </span>
                ))}
             </div>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              Last updated: {context.lastUpdated}
            </p>

            <div className="mt-5 space-y-4">
              {context.items.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.title}</p>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Prediction Markets</h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {prediction.summary}
            </p>
            <SavePredictionButton matchId={match.id} />
            <CreateProofButton matchId={match.id} />

            <div className="mt-5 space-y-3">
              {prediction.markets.map((market) => (
                <div key={market.name} className="rounded-xl bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-200">
                      {market.name}
                    </p>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {market.confidence}
                    </span>
                  </div>

                  <p className="mt-3 text-lg font-bold text-emerald-300">
                    {market.pick}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Probability: {market.probability}%
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {market.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
