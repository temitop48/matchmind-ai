import Link from "next/link";
import { ReviewButtons } from "../components/ReviewButtons";

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
};

type PredictionHistoryResponse = {
  success: boolean;
  predictions: PredictionRow[];
  error?: string;
};

async function getPredictionHistory(): Promise<PredictionHistoryResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/predictions/history`, {
      cache: "no-store",
    });

    const text = await response.text();

    if (!text) {
      return {
        success: false,
        predictions: [],
        error: "Empty API response.",
      };
    }

    return JSON.parse(text) as PredictionHistoryResponse;
  } catch (error) {
    return {
      success: false,
      predictions: [],
      error:
        error instanceof Error
          ? error.message
          : "Unknown prediction history error.",
    };
  }
}

export default async function ReviewPage() {
  const data = await getPredictionHistory();
  const predictions = data.predictions ?? [];

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
        </div>

        {!data.success && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {data.error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {predictions.length === 0 ? (
            <p className="text-slate-400">No prediction history yet.</p>
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
