import Link from "next/link";
import { MatchCard } from "./components/MatchCard";
import { getUpcomingWorldCupMatches } from "./lib/fixtures";
import { SyncFixturesButton } from "./components/SyncFixturesButton";
import { GenerateDailyPredictionsButton } from "./components/GenerateDailyPredictionsButton";

export default async function Home() {
  const matches = await getUpcomingWorldCupMatches();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop')",
          }}
        />

        <div className="absolute inset-0 bg-slate-950/85" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-emerald-950/40" />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 md:px-10">
          <nav className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                MatchMind AI
              </h1>
              <p className="text-sm text-slate-400">
                World Cup match intelligence
              </p>
            </div>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">
              Off-chain proof active
            </span>
          </nav>

          <section className="grid flex-1 items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                ⚽ FIFA World Cup 2026 Prediction System
              </p>

              <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-6xl">
                AI-powered football analysis with off-chain prediction proof.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                MatchMind AI analyzes World Cup fixtures using team form, news,
                injuries, availability, match context, and self-learning
                prediction history. No correct score guessing. Just
                probability-based match intelligence.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/predictions"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  View daily predictions
                </Link>

                <Link
                  href="/accuracy"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-900"
                >
                  View accuracy
                </Link>

                <Link
                  href="/review"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-900"
                >
                  Review predictions
                </Link>

                <Link
                  href="/#matches"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-900"
                >
                  Browse matches
                </Link>

                <Link
                  href="/sync-logs"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-900"
                >
                  View sync logs
                </Link>

                <Link
                  href="/learning"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-900"
                >
                  View learning
                </Link>

                <Link
                  href="/proofs"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 backdrop-blur transition hover:bg-slate-900"
                >
                  View proofs
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">104</p>
                  <p className="text-sm text-slate-400">World Cup matches</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-slate-400">National teams</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{matches.length}</p>
                  <p className="text-sm text-slate-400">Synced fixtures</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <SyncFixturesButton />
                <GenerateDailyPredictionsButton />
              </div>
            </div>

            <div
              id="matches"
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Upcoming Matches</h3>
                  <p className="text-sm text-slate-400">
                    Synced from football-data.org
                  </p>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  MVP Ready
                </span>
              </div>

              <div className="space-y-4">
                {matches.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5">
                    <p className="font-semibold">No fixtures found yet</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Run the fixture sync endpoint to import available matches
                      from football-data.org.
                    </p>
                  </div>
                ) : (
                  matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}