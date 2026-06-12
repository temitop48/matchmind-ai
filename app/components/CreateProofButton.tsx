"use client";

import { useState } from "react";

type CreateProofButtonProps = {
  matchId: string;
};

export function CreateProofButton({ matchId }: CreateProofButtonProps) {
  const [status, setStatus] = useState("");

  async function createProof() {
    setStatus("Creating proof hash...");

    const response = await fetch("/api/proofs/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matchId }),
    });

    const data = await response.json();

    if (!data.success) {
      setStatus(data.error ?? "Failed to create proof.");
      return;
    }

    setStatus(`Proof created: ${data.predictionHash.slice(0, 16)}...`);
  }

  return (
    <div>
      <button
        onClick={createProof}
        className="mt-3 w-full rounded-xl border border-emerald-400/40 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-400/10"
      >
        Create prediction proof
      </button>

      {status && <p className="mt-3 text-sm text-slate-400">{status}</p>}
    </div>
  );
}