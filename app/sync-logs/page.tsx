import Link from "next/link";

type SyncLog = {
  id: string;
  provider: string;
  success: boolean;
  imported_count: number;
  error_message: string | null;
  created_at: string;
};

async function getSyncLogs() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/fixtures/logs`, {
    cache: "no-store",
  });

  return response.json();
}

export default async function SyncLogsPage() {
  const data = await getSyncLogs();
  const logs = (data.logs ?? []) as SyncLog[];

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-emerald-300">
          Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            Fixture Sync Logs
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Data import history
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Track fixture sync attempts from football-data.org.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {logs.length === 0 ? (
            <p className="text-slate-400">No sync logs yet.</p>
          ) : (
            logs.map((log) => (
              <article
                key={log.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {log.provider}
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      {log.success ? "Successful sync" : "Failed sync"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Imported: {log.imported_count} fixtures
                    </p>

                    {log.error_message && (
                      <p className="mt-2 text-sm text-red-300">
                        {log.error_message}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-slate-950 px-4 py-2 text-xs text-slate-300">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}