import Link from "next/link";
import { SessionTone } from "@/components/status-badge";
import { formatFrenchLong, formatMonthYear, padRumpNumber } from "@/lib/dates";
import { getPlanningSessions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const sessions = await getPlanningSessions();
  const grouped = new Map<string, typeof sessions>();

  for (const session of sessions) {
    const key = formatMonthYear(session.date);
    const list = grouped.get(key) ?? [];
    list.push(session);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Calendrier</p>
        <h1 className="mt-2 font-display text-4xl italic">Toutes les RUMPs</h1>
        <p className="mt-2 text-sm text-muted">
          Clique sur un jeudi pour voir ses créneaux officiels.
        </p>
      </header>

      {Array.from(grouped.entries()).map(([month, monthSessions]) => (
        <section key={month} className="space-y-3">
          <h2 className="text-[12px] uppercase tracking-[0.2em] text-muted">{month}</h2>
          <div className="divide-y divide-line border border-line">
            {monthSessions.map((session) => (
              <Link
                key={session.id}
                href={`/rump/${session.id}`}
                className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-bg-hover"
              >
                <div>
                  <p className="flex items-center gap-2 font-display text-xl italic">
                    <SessionTone approvedCount={session.approvedCount} />
                    {formatFrenchLong(session.date)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    RUMP #{padRumpNumber(session.number)}
                  </p>
                </div>
                <div className="text-right text-sm text-muted">
                  {session.approvedCount === 0 ? (
                    <p>Aucun talk</p>
                  ) : (
                    <p>
                      {session.approvedCount} talk{session.approvedCount > 1 ? "s" : ""}{" "}
                      confirmé{session.approvedCount > 1 ? "s" : ""}
                    </p>
                  )}
                  {session.status !== "DONE" ? (
                    <p className="mt-1 text-xs">
                      {session.availableCount} créneau
                      {session.availableCount > 1 ? "x" : ""} disponible
                      {session.availableCount > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs uppercase tracking-[0.14em]">Terminée</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
