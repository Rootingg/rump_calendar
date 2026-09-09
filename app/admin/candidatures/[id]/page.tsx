import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproveButton, RejectForm } from "@/components/admin-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatFrenchLong } from "@/lib/dates";
import { getApplicationDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplicationDetail(id);

  if (!application) notFound();

  const canModerate = application.status === "PENDING";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/candidatures"
        className="text-[11px] uppercase tracking-[0.16em] text-muted"
      >
        ← Candidatures
      </Link>

      <header className="space-y-3">
        <StatusBadge status={application.status} />
        <h1 className="font-display text-4xl italic">{application.title}</h1>
      </header>

      <dl className="space-y-4 border border-line px-5 py-5 text-sm">
        <Row label="Présentateur" value={`${application.speakerName} · ${application.speakerEmail}`} />
        <Row label="Description" value={application.description} />
        <Row label="Discipline" value={application.discipline} />
        <Row label="Niveau" value={application.level} />
        <Row label="Durée" value="8 minutes" />
        <Row label="Jeudi demandé" value={formatFrenchLong(application.date)} />
        <Row
          label="Créneau demandé"
          value={`${application.startTime} → ${application.endTime}`}
        />
      </dl>

      {canModerate ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-line px-5 py-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted">
              Valider
            </p>
            <p className="mb-4 text-sm text-muted">
              Le créneau devient officiel. Les autres PENDING du même slot passent en
              « créneau indisponible ».
            </p>
            <ApproveButton id={application.id} />
          </div>
          <div className="border border-line px-5 py-5">
            <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted">
              Refuser
            </p>
            <RejectForm id={application.id} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Cette candidature a déjà été traitée.</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
