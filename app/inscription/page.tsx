import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-form";
import { auth } from "@/auth";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/profil");

  return (
    <div className="mx-auto max-w-md space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Compte</p>
        <h1 className="mt-2 font-display text-4xl italic">Inscription</h1>
      </header>
      <RegisterForm />
    </div>
  );
}
