"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewButtonsProps = {
  predictionId: string;
};

export function ReviewButtons({ predictionId }: ReviewButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function review(wasCorrect: boolean) {
    setLoading(true);

    await fetch("/api/predictions/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        predictionId,
        wasCorrect,
      }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => review(true)}
        disabled={loading}
        className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
      >
        Correct
      </button>

      <button
        onClick={() => review(false)}
        disabled={loading}
        className="rounded-xl bg-red-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-red-300 disabled:opacity-50"
      >
        Incorrect
      </button>
    </div>
  );
}