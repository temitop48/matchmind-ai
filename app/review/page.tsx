import Link from "next/link";
import { ReviewButtons } from "../components/ReviewButtons";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PredictionRow = {
  id: string;
  match_id: string;
  market_name: string;
  pick: string;
  probability: number;
  confidence: string;
  result_status: string;
  was_correct: boolean | null;
  quality_score: number | null;
  quality_label: string | null;
  recommendation_tier: string | null;
};

async function getPredictionHistory() {
  const { data, error } = await supabase
    .from("prediction_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      predictions: [],
      error: error.message,
    };
  }

  return {
    success: true,
    predictions: data ?? [],
    error: null,
  };
}

type ReviewPageProps = {
  searchParams?: Promise<{
    tier?: string;
  }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const selectedTier = params?.tier ?? "All";

  const data = await getPredictionHistory();
  const allPredictions = data.predictions as PredictionRow[];

  const predictions =
    selectedTier === "All"
      ? allPredictions
      : allPredictions.filter(
          (prediction) => prediction.recommendation_tier === selectedTier,
        );

  const stats = {
    total: allPredictions.length,
    strong: allPredictions.filter(
      (item) => item.recommendation_tier === "Strong",
    ).length,
    watchlist: allPredictions.filter(
      (item) => item.recommendation_tier === "Watchlist",
    ).length,
    avoid: allPredictions.filter(
      (item) => item.recommendation_tier === "Avoid" || !item.recommendation_tier,
    ).length,
    reviewed: allPredictions.filter((item) => item.result_status === "Reviewed")
      .length,
    pending: allPredictions.filter((item) => item.result_status !== "Reviewed")
      .length,
  };

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-emerald-300">
          Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            Prediction Review
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Review prediction history
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Use this page to review saved prediction outcomes after matches are
            completed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {["All", "Strong", "Watchlist", "Avoid"].map((tier) => (
              <Link
                key={tier}
                href={tier === "All" ? "/review" : `/review?tier=${tier}`}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  selectedTier === tier
                    ? "bg-emerald-400 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {tier}
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["Total", stats.total],
              ["Strong", stats.strong],
              ["Watchlist", stats.watchlist],
              ["Avoid", stats.avoid],
              ["Reviewed", stats.reviewed],
              ["Pending", stats.pending],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {!data.success && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {data.error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {predictions.length === 0 ? (
            <p className="text-slate-400">No prediction history found.</p>
          ) : (
            predictions.map((prediction) => (
              <article
                key={prediction.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-xs text-slate-500">
                      Match ID: {prediction.match_id}
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      {prediction.market_name}
                    </h2>

                    <p className="mt-2 text-emerald-300">
                      Pick: {prediction.pick}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      Recommendation:{" "}
                      {prediction.recommendation_tier ?? "Avoid"}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      Probability: {prediction.probability}% • Confidence:{" "}
                      {prediction.confidence}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      Quality: {prediction.quality_score ?? 0}% •{" "}
                      {prediction.quality_label ?? "Not scored"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Status</p>

                    <p className="mt-1 font-bold">{prediction.result_status}</p>

                    <p className="mt-2 text-sm text-slate-400">
                      Correct:{" "}
                      {prediction.was_correct === null
                        ? "Not reviewed"
                        : prediction.was_correct
                          ? "Yes"
                          : "No"}
                    </p>

                    <ReviewButtons predictionId={prediction.id} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}