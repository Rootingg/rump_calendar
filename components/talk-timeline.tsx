import { MARGIN_SLOT } from "@/lib/constants";

export type TimelineTalk = {
  title: string;
  speakerName: string;
  discipline?: string;
  startTime: string;
  endTime: string;
};

export type TimelineSlot = {
  startTime: string;
  endTime: string;
  talk: TimelineTalk | null;
};

export function TalkTimeline({
  slots,
  showEmpty = true,
  showMargin = true,
}: {
  slots: TimelineSlot[];
  showEmpty?: boolean;
  showMargin?: boolean;
}) {
  return (
    <ol className="divide-y divide-line">
      {slots.map((slot) => {
        if (!slot.talk && !showEmpty) return null;

        return (
          <li key={`${slot.startTime}-${slot.endTime}`} className="grid grid-cols-[5.5rem_1fr] gap-4 py-4">
            <div className="font-mono text-sm text-gold">
              {slot.startTime}
              <div className="text-[10px] text-muted">{slot.endTime}</div>
            </div>
            {slot.talk ? (
              <div>
                <p className="font-display text-xl leading-tight text-ink italic">
                  {slot.talk.title}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {slot.talk.speakerName}
                  {slot.talk.discipline ? ` · ${slot.talk.discipline}` : null}
                </p>
              </div>
            ) : (
              <p className="self-center text-sm text-muted">Créneau libre</p>
            )}
          </li>
        );
      })}
      {showMargin ? (
        <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 text-muted">
          <div className="font-mono text-sm">
            {MARGIN_SLOT.start}
            <div className="text-[10px]">{MARGIN_SLOT.end}</div>
          </div>
          <p className="self-center text-sm">Marge / transition</p>
        </li>
      ) : null}
    </ol>
  );
}
