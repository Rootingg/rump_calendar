import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { auth } from "@/auth";
import { formatFrenchLong, padRumpNumber } from "@/lib/dates";
import { getMyApplications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion?callbackUrl=/profil");
  }

  const applications = await getMyApplications(session.user.id);
  const pending = applications.filter((item) => item.status === "PENDING");
  const approved = applications.filter((item) => item.status === "APPROVED");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Profil</p>
        <h1 className="mt-2 font-display text-4xl italic">{session.user.name}</h1>
        <p className="mt-2 text-sm text-muted">{session.user.email}</p>
        <div className="mt-4 flex gap-3">
          <Link href="/proposer" className="btn">
            Proposer un talk
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Propositions" value={applications.length} />
        <Stat label="En attente" value={pending.length} />
        <Stat label="Validées" value={approved.length} />
      </section>

      <section className="space-y-3">
        <h2 className="text-[12px] uppercase tracking-[0.18em] text-muted">Mes talks</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-muted">Aucune candidature pour le moment.</p>
        ) : (
          <div className="divide-y divide-line border border-line">
            {applications.map((item) => (
              <article key={item.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl italic">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {formatFrenchLong(item.date)} · {item.startTime} — {item.endTime}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      RUMP #{padRumpNumber(item.number)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.adminComment && item.status !== "APPROVED" ? (
                  <p className="mt-3 border-l border-gold pl-3 text-sm text-muted">
                    {item.adminComment}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line px-4 py-4">
      <p className="font-mono text-2xl text-gold">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}
