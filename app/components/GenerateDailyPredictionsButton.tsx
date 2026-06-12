"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateDailyPredictionsButton() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function generateDailyPredictions() {
    setStatus("Generating predictions...");

    const response = await fetch("/api/predictions/generate-daily");
    const data = await response.json();

    if (!data.success) {
      setStatus(data.error ?? "Failed to generate predictions.");
      return;
    }

    setStatus(
      `Generated ${data.savedPredictions} predictions from ${data.matchesProcessed} matches.`
    );

    router.refresh();
  }

  return (
    <div>
      <button
        onClick={generateDailyPredictions}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
      >
        Generate daily predictions
      </button>

      {status && <p className="mt-3 text-sm text-slate-400">{status}</p>}
    </div>
  );
}