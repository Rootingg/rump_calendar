"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { approveApplication, rejectApplication } from "@/lib/actions/admin";

export function ApproveButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="btn btn-ok"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await approveApplication(id);
          setPending(false);
          if (result.error) {
            setError(result.error);
            return;
          }
          router.refresh();
        }}
      >
        {pending ? "Validation…" : "Valider"}
      </button>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </div>
  );
}

export function RejectForm({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await rejectApplication(new FormData(event.currentTarget));
        setPending(false);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Commentaire admin
        </span>
        <textarea
          className="field min-h-24"
          name="adminComment"
          placeholder="Créneau déjà trop chargé, proposer pour la prochaine RUMP."
        />
      </label>
      <button className="btn btn-danger" type="submit" disabled={pending}>
        {pending ? "Refus…" : "Refuser"}
      </button>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </form>
  );
}
