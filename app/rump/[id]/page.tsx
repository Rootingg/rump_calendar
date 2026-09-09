import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { TalkTimeline } from "@/components/talk-timeline";
import { formatFrenchLong, padRumpNumber, slotLabel, talkLabel } from "@/lib/dates";
import { getSessionDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RumpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSessionDetail(id);

  if (!detail) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/planning" className="text-[11px] uppercase tracking-[0.16em] text-muted">
          ← Planning
        </Link>
        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gold">
          RUMP #{padRumpNumber(detail.session.number)}
        </p>
        <h1 className="mt-2 font-display text-4xl italic">
          {formatFrenchLong(detail.session.date)}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>18:00 → 19:00</span>
          <StatusBadge status={detail.session.status} />
          <span>
            {talkLabel(detail.approvedCount)} · {slotLabel(detail.availableCount)}
          </span>
        </div>
      </div>

      <section className="border border-line bg-bg-raise px-6 py-6">
        <TalkTimeline slots={detail.slots} />
      </section>

      {detail.session.status === "OPEN" ? (
        <Link href="/proposer" className="btn">
          Proposer un talk
        </Link>
      ) : null}
    </div>
  );
}
