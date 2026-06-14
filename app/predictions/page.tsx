import Link from "next/link";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

type PredictionRow = {
  id: string;
  match_id: string;
  market_name: string;
  pick: string;
  probability: number;
  confidence: string;
  model_version: string;
  result_status: string;
  quality_score: number | null;
  quality_label: string | null;
  created_at: string;
};

async function getSavedPredictions() {
  const { data, error } = await supabase
    .from("prediction_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return {
      success: false,
      error: error.message,
      predictions: [],
    };
  }

  return {
    success: true,
    error: null,
    predictions: data ?? [],
  };
}

export default async function PredictionsPage() {
  const data = await getSavedPredictions();
  const predictions = data.predictions as PredictionRow[];

  const grouped = predictions.reduce<Record<string, PredictionRow[]>>(
    (acc, prediction) => {
      if (!acc[prediction.match_id]) {
        acc[prediction.match_id] = [];
      }

      acc[prediction.match_id].push(prediction);
      return acc;
    },
    {}
  );

  const groupedEntries = Object.entries(grouped);

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
            A daily view of saved prediction markets, confidence, quality score,
            and model version.
          </p>
        </div>

        {!data.success && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {data.error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {groupedEntries.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="font-semibold">No saved predictions yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Go back to the dashboard and click Generate daily predictions.
              </p>
            </div>
          ) : (
            groupedEntries.map(([matchId, markets]) => {
              const firstMarket = markets[0];

              return (
                <article
                  key={matchId}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-emerald-300">
                        Match ID
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">{matchId}</h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Model: {firstMarket.model_version} • Quality:{" "}
                        {firstMarket.quality_score ?? 0}% •{" "}
                        {firstMarket.quality_label ?? "Not scored"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">Markets</p>
                        <p className="mt-1 font-bold">{markets.length}</p>
                      </div>

                      <div className="rounded-2xl bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">Reviewed</p>
                        <p className="mt-1 font-bold">
                          {
                            markets.filter(
                              (market) => market.result_status === "Reviewed"
                            ).length
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-950 p-3">
                        <p className="text-xs text-slate-500">Pending</p>
                        <p className="mt-1 font-bold">
                          {
                            markets.filter(
                              (market) => market.result_status !== "Reviewed"
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {markets.slice(0, 6).map((market) => (
                      <span
                        key={market.id}
                        className="rounded-full bg-slate-950 px-3 py-2 text-xs text-slate-300"
                      >
                        {market.market_name}: {market.pick}{" "}
                        {market.probability}%
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/matches/${matchId}`}
                    className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300"
                  >
                    Open full analysis
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}