import Link from "next/link";
import { TalkTimeline } from "@/components/talk-timeline";
import { formatFrenchLong, padRumpNumber, talkLabel } from "@/lib/dates";
import { getNextPublicSession, getSessionDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const nextSession = await getNextPublicSession();
  const detail = nextSession ? await getSessionDetail(nextSession.id) : null;

  return (
    <div className="space-y-12">
      <section className="text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-gold">
          OteriHack
        </p>
        <h1 className="mt-3 font-display text-6xl italic leading-none sm:text-7xl">RUMP</h1>
        <p className="mt-5 text-sm uppercase tracking-[0.18em] text-muted">
          Tous les jeudis — 18:00 → 19:00
        </p>
      </section>

      <section className="border border-line bg-bg-raise px-6 py-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Prochaine RUMP</p>
        {detail ? (
          <>
            <h2 className="mt-3 font-display text-3xl italic">
              {formatFrenchLong(detail.session.date)}
            </h2>
            <p className="mt-1 font-mono text-sm text-muted">
              RUMP #{padRumpNumber(detail.session.number)} · {talkLabel(detail.approvedCount)}
            </p>
            <div className="mt-6">
              <TalkTimeline slots={detail.slots} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-muted">Aucune session à venir pour le moment.</p>
        )}
      </section>

      <section className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/proposer" className="btn">
          Proposer un talk
        </Link>
        <Link href="/planning" className="btn btn-ghost">
          Voir toutes les RUMPs
        </Link>
      </section>

      {detail && detail.approvedCount === 0 ? (
        <p className="text-center text-sm text-muted">
          Les talks officiels apparaîtront ici dès qu’un admin les aura validés.
        </p>
      ) : null}
    </div>
  );
}
