const STYLES = {
  PENDING: "text-warn border-warn/40",
  APPROVED: "text-ok border-ok/40",
  REJECTED: "text-bad border-bad/40",
  SLOT_UNAVAILABLE: "text-idle border-line",
  COMPLETED: "text-muted border-line",
  OPEN: "text-ok border-ok/40",
  CLOSED: "text-idle border-line",
  DONE: "text-muted border-line",
} as const;

const LABELS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
  SLOT_UNAVAILABLE: "Créneau indisponible",
  COMPLETED: "Réalisée",
  OPEN: "Ouverte",
  CLOSED: "Fermée",
  DONE: "Terminée",
};

export function StatusBadge({
  status,
}: {
  status: keyof typeof STYLES | string;
}) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${STYLES[status as keyof typeof STYLES] ?? "text-muted border-line"}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}

export function SessionTone({ approvedCount }: { approvedCount: number }) {
  if (approvedCount >= 5) {
    return <span className="text-ok">●</span>;
  }
  if (approvedCount >= 1) {
    return <span className="text-warn">●</span>;
  }
  return <span className="text-idle">●</span>;
}
