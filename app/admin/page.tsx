import Link from "next/link";
import { generateSessionsAction } from "@/lib/actions/admin";
import { formatFrenchLong, occupancyLabel, padRumpNumber } from "@/lib/dates";
import { getAdminOverview } from "@/lib/queries";
import { SLOTS_PER_SESSION } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { upcoming, pending } = await getAdminOverview();

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Espace admin</p>
          <h1 className="mt-2 font-display text-4xl italic">Admin RUMP</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/candidatures" className="btn">
            Candidatures
          </Link>
          <form action={generateSessionsAction}>
            <button className="btn btn-ghost" type="submit">
              Générer 12 jeudis
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-line px-4 py-4">
          <p className="font-mono text-2xl text-gold">{upcoming.length}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
            RUMPs à venir
          </p>
        </div>
        <div className="border border-line px-4 py-4">
          <p className="font-mono text-2xl text-warn">{pending.length}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
            Candidatures en attente
          </p>
        </div>
        <div className="border border-line px-4 py-4">
          <p className="font-mono text-2xl text-ink">
            {upcoming[0] ? `${upcoming[0].approvedCount}/${SLOTS_PER_SESSION}` : "—"}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
            Prochaine session
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[12px] uppercase tracking-[0.18em] text-muted">
          Prochaines RUMPs
        </h2>
        <div className="divide-y divide-line border border-line">
          {upcoming.slice(0, 6).map((session) => (
            <div key={session.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-display text-xl italic">{formatFrenchLong(session.date)}</p>
                <p className="font-mono text-xs text-muted">
                  RUMP #{padRumpNumber(session.number)}
                </p>
              </div>
              <p className="text-sm text-muted">
                {SLOTS_PER_SESSION} créneaux ·{" "}
                {occupancyLabel(session.approvedCount, session.availableCount)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] uppercase tracking-[0.18em] text-muted">
            File d’attente
          </h2>
          <Link href="/admin/candidatures" className="text-[11px] uppercase tracking-[0.14em] text-gold">
            Tout voir
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Aucune candidature en attente.</p>
        ) : (
          <div className="divide-y divide-line border border-line">
            {pending.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/admin/candidatures/${item.id}`}
                className="block px-5 py-4 hover:bg-bg-hover"
              >
                <p className="font-display text-xl italic">{item.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.speakerName} · {formatFrenchLong(item.date)} — {item.startTime}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
