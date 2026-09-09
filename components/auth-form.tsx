"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/lib/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState<AuthState | undefined, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl || "/profil"} />
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Email
        </span>
        <input className="field" type="email" name="email" required autoComplete="email" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Mot de passe
        </span>
        <input
          className="field"
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>
      {state?.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className="btn w-full" type="submit" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-muted">
        Pas de compte ?{" "}
        <Link href="/inscription" className="text-gold">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState | undefined, FormData>(
    registerAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Nom / Prénom
        </span>
        <input className="field" name="name" required autoComplete="name" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Email
        </span>
        <input className="field" type="email" name="email" required autoComplete="email" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-muted">
          Mot de passe
        </span>
        <input
          className="field"
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      {state?.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className="btn w-full" type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </button>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-gold">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
