"use client";

import { useActionState, useMemo, useState } from "react";
import { DISCIPLINES, LEVELS, durationLabel, slotKindLabel } from "@/lib/constants";
import { formatFrenchLong, padRumpNumber } from "@/lib/dates";
import { proposeTalkAction, type ProposeState } from "@/lib/actions/talks";

type Option = {
  id: string;
  date: string;
  number: number;
  slots: {
    id: string;
    startTime: string;
    endTime: string;
    kind: string;
    taken: boolean;
  }[];
};

export function ProposeForm({
  speakerName,
  options,
}: {
  speakerName: string;
  options: Option[];
}) {
  const [sessionId, setSessionId] = useState(options[0]?.id ?? "");
  const [state, action, pending] = useActionState<ProposeState | undefined, FormData>(
    proposeTalkAction,
    undefined,
  );

  const selected = useMemo(
    () => options.find((option) => option.id === sessionId) ?? options[0],
    [options, sessionId],
  );

  if (options.length === 0) {
    return <p className="text-muted">Aucune RUMP ouverte pour le moment.</p>;
  }

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Nom / Prénom
        </span>
        <input className="field" value={speakerName} readOnly />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Titre du talk
        </span>
        <input className="field" name="title" required minLength={3} />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Description
        </span>
        <textarea className="field min-h-28" name="description" required minLength={10} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
            Discipline
          </span>
          <select className="field" name="discipline" defaultValue="Web">
            {DISCIPLINES.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
            Niveau
          </span>
          <select className="field" name="level" defaultValue="Débutant">
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Durée
        </span>
        <input className="field" value={durationLabel()} readOnly />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Jeudi souhaité
        </span>
        <select
          className="field"
          name="sessionId"
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {formatFrenchLong(option.date)} · RUMP #{padRumpNumber(option.number)}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">
          Créneau souhaité
        </legend>
        {selected?.slots.map((slot) => (
          <label
            key={slot.id}
            className={`flex items-center justify-between border px-3 py-2 ${
              slot.taken ? "border-line text-muted" : "border-line hover:border-gold"
            }`}
          >
            <span className="flex items-center gap-3 font-mono text-sm">
              <input
                type="radio"
                name="slotId"
                value={slot.id}
                required
                disabled={slot.taken}
              />
              {slot.startTime} — {slot.endTime}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em]">
              {slotKindLabel(slot.kind)}
              {slot.taken ? " · Occupé" : ""}
            </span>
          </label>
        ))}
      </fieldset>

      {state?.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-ok">{state.success}</p> : null}

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer la candidature"}
      </button>
      <p className="text-xs text-muted">
        Le créneau reste une préférence tant que l’admin n’a pas validé.
      </p>
    </form>
  );
}
