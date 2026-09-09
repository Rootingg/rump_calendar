"use client";

import { useActionState } from "react";
import {
  setFirstSessionDateAction,
  type FirstSessionState,
} from "@/lib/actions/admin";
import { formatFrenchLong } from "@/lib/dates";

export function FirstSessionForm({ currentDate }: { currentDate: string }) {
  const [state, action, pending] = useActionState<
    FirstSessionState | undefined,
    FormData
  >(setFirstSessionDateAction, undefined);

  return (
    <form action={action} className="space-y-4 border border-line px-5 py-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">
          Première session
        </p>
        <h2 className="mt-2 font-display text-2xl italic">Date de la RUMP #01</h2>
        <p className="mt-2 text-sm text-muted">
          Actuellement {formatFrenchLong(currentDate)}. Les jeudis avant cette
          date sont retirés du planning. Les candidatures liées à ces jeudis
          sont supprimées.
        </p>
      </div>
      <label className="block max-w-xs">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Jeudi de démarrage
        </span>
        <input
          className="field"
          type="date"
          name="firstSessionDate"
          defaultValue={currentDate}
          required
        />
      </label>
      {state?.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-ok">{state.success}</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Mise à jour…" : "Enregistrer et régénérer"}
      </button>
    </form>
  );
}
