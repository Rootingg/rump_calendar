import { slotKindLabel } from "@/lib/constants";

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
  kind?: string;
  talk: TimelineTalk | null;
};

export function TalkTimeline({
  slots,
  showEmpty = true,
}: {
  slots: TimelineSlot[];
  showEmpty?: boolean;
}) {
  const visible = slots.filter((slot) => slot.talk || showEmpty);
  let lastKind = "";

  return (
    <ol className="divide-y divide-line">
      {visible.map((slot) => {
        const kind = slot.kind ?? "TECHNIQUE";
        const showHeading = kind !== lastKind;
        lastKind = kind;

        return (
          <li key={`${slot.startTime}-${slot.endTime}`}>
            {showHeading ? (
              <p className="pt-5 pb-1 text-[11px] uppercase tracking-[0.2em] text-gold">
                {slotKindLabel(kind)}
              </p>
            ) : null}
            <div className="grid grid-cols-[5.5rem_1fr] gap-4 py-4">
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
                <p className="self-center text-sm text-muted">
                  {kind === "WTF" ? "WTF libre" : "Technique"}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
