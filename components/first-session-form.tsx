"use client";

import { useActionState } from "react";
import {
  setSeasonDatesAction,
  type FirstSessionState,
} from "@/lib/actions/admin";
import { formatFrenchLong } from "@/lib/dates";

export function FirstSessionForm({
  firstDate,
  lastDate,
}: {
  firstDate: string;
  lastDate: string;
}) {
  const [state, action, pending] = useActionState<
    FirstSessionState | undefined,
    FormData
  >(setSeasonDatesAction, undefined);

  return (
    <form action={action} className="space-y-4 border border-line px-5 py-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          Saison
        </p>
        <h2 className="mt-2 font-display text-2xl italic">Début et fin des RUMPs</h2>
        <p className="mt-2 text-sm text-muted">
          Du {formatFrenchLong(firstDate)} au {formatFrenchLong(lastDate)}. Les
          jeudis hors de cette période sont retirés du planning, ainsi que leurs
          candidatures.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
            Jeudi de démarrage
          </span>
          <input
            className="field"
            type="date"
            name="firstSessionDate"
            defaultValue={firstDate}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
            Jeudi de fin
          </span>
          <input
            className="field"
            type="date"
            name="lastSessionDate"
            defaultValue={lastDate}
            required
          />
        </label>
      </div>
      {state?.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-ok">{state.success}</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Mise à jour…" : "Enregistrer et régénérer"}
      </button>
    </form>
  );
}