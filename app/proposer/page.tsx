import { redirect } from "next/navigation";
import { ProposeForm } from "@/components/propose-form";
import { auth } from "@/auth";
import { getProposeOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProposePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/proposer");
  }

  const options = await getProposeOptions();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Candidature</p>
        <h1 className="mt-2 font-display text-4xl italic">Proposer un talk</h1>
        <p className="mt-2 text-sm text-muted">
          Tu choisis un jeudi et un créneau. Rien n’est officiel tant que l’admin n’a pas validé.
        </p>
      </header>
      <ProposeForm speakerName={session.user.name ?? ""} options={options} />
    </div>
  );
}
