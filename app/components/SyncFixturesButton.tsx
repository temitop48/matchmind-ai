"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncFixturesButton() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function syncFixtures() {
    setStatus("Syncing fixtures...");

    const response = await fetch("/api/fixtures/sync");
    const data = await response.json();

    if (!data.success) {
      setStatus(data.error ?? "Fixture sync failed.");
      return;
    }

    setStatus(`Synced ${data.imported} fixtures.`);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={syncFixtures}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
      >
        Sync fixtures
      </button>

      {status && <p className="mt-3 text-sm text-slate-400">{status}</p>}
    </div>
  );
}