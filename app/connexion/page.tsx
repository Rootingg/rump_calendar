import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-form";
import { auth } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/profil");

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/profil";

  return (
    <div className="mx-auto max-w-md space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Compte</p>
        <h1 className="mt-2 font-display text-4xl italic">Connexion</h1>
      </header>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
