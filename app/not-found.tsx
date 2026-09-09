import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="font-display text-4xl italic">Page introuvable</h1>
      <Link href="/" className="btn">
        Retour à l’accueil
      </Link>
    </div>
  );
}
