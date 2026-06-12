"use client";

import { useState } from "react";

type SavePredictionButtonProps = {
  matchId: string;
};

export function SavePredictionButton({ matchId }: SavePredictionButtonProps) {
  const [status, setStatus] = useState("");

  async function savePrediction() {
    setStatus("Saving...");

    const response = await fetch("/api/predictions/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matchId }),
    });

    const data = await response.json();

    if (!data.success) {
      setStatus(data.error ?? "Failed to save prediction.");
      return;
    }

    setStatus(`Saved ${data.saved} markets.`);
  }

  return (
    <div>
      <button
        onClick={savePrediction}
        className="mt-5 w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300"
      >
        Save prediction history
      </button>

      {status && <p className="mt-3 text-sm text-slate-400">{status}</p>}
    </div>
  );
}