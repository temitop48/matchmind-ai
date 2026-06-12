import Link from "next/link";
import type { WorldCupMatch } from "../data/worldCupMatches";

type MatchCardProps = {
  match: WorldCupMatch;
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
          {match.competition}
        </p>

        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
          {match.confidence}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold">{match.homeTeam}</p>
          <p className="text-sm text-slate-500">Home</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500">{match.date}</p>
          <p className="text-sm font-bold">{match.time}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold">{match.awayTeam}</p>
          <p className="text-sm text-slate-500">Away</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-900 p-3">
        <p className="text-sm text-slate-300">{match.insight}</p>
        <p className="mt-2 text-xs text-slate-500">Venue: {match.venue}</p>
      </div>

      <Link
        href={`/matches/${match.id}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
      >
        View match analysis
      </Link>
    </article>
  );
}