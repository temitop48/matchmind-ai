"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdateLearningButton() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function updateLearning() {
    setStatus("Updating learning weights...");

    const response = await fetch("/api/learning/update");
    const data = await response.json();

    if (!data.success) {
      setStatus(data.error ?? "Failed to update learning weights.");
      return;
    }

    setStatus(`Updated ${data.updated} market weights.`);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={updateLearning}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
      >
        Update learning weights
      </button>

      {status && <p className="mt-3 text-sm text-slate-400">{status}</p>}
    </div>
  );
}