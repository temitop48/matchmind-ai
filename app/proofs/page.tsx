import Link from "next/link";

type PredictionProof = {
  id: string;
  match_id: string;
  model_version: string;
  prediction_hash: string;
  proof_status: string;
  chain: string | null;
  transaction_hash: string | null;
  created_at: string;
};

async function getProofs() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/proofs`, {
    cache: "no-store",
  });

  return response.json();
}

export default async function ProofsPage() {
  const data = await getProofs();
  const proofs = (data.proofs ?? []) as PredictionProof[];

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-6 text-white md:px-10">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-emerald-300">
          Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-wide text-emerald-300">
            Prediction Proofs
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Verifiable prediction history
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Off-chain prediction hashes are stored here before we move to Base
            Sepolia proof anchoring.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {proofs.length === 0 ? (
            <p className="text-slate-400">No prediction proofs yet.</p>
          ) : (
            proofs.map((proof) => (
              <article
                key={proof.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-xs text-slate-500">
                      Match ID: {proof.match_id}
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      {proof.model_version} • {proof.proof_status}
                    </h2>

                    <p className="mt-3 break-all rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
                      {proof.prediction_hash}
                    </p>

                    {proof.transaction_hash && (
                      <p className="mt-3 break-all text-xs text-emerald-300">
                        Tx: {proof.transaction_hash}
                      </p>
                    )}
                  </div>

                  <span className="h-fit rounded-full bg-slate-950 px-4 py-2 text-xs text-slate-300">
                    {new Date(proof.created_at).toLocaleString()}
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