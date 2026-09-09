import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-gold">
            OteriHack
          </span>
          <span className="font-display text-2xl italic leading-none">RUMP</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-muted">
          <Link href="/planning" className="hover:text-ink">
            Planning
          </Link>
          <Link href="/proposer" className="hover:text-ink">
            Proposer
          </Link>
          {session ? (
            <Link href="/profil" className="hover:text-ink">
              Mes talks
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/admin" className="text-gold hover:text-ink">
              Admin
            </Link>
          ) : null}
          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="uppercase tracking-[0.14em] hover:text-ink">
                Déconnexion
              </button>
            </form>
          ) : (
            <Link href="/connexion" className="text-ink hover:text-gold">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
