import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatFrenchLong } from "@/lib/dates";
import { getPendingApplications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const pending = await getPendingApplications();

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin" className="text-[11px] uppercase tracking-[0.16em] text-muted">
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-4xl italic">Candidatures</h1>
        <p className="mt-2 text-sm text-muted">
          {pending.length} en attente. Plusieurs personnes peuvent viser le même créneau.
        </p>
      </header>

      {pending.length === 0 ? (
        <p className="text-muted">File vide.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <article key={item.id} className="border border-line px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl italic">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted">{item.speakerName}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {formatFrenchLong(item.date)} — {item.startTime} → {item.endTime}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/candidatures/${item.id}`} className="btn btn-ghost">
                  Voir
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
