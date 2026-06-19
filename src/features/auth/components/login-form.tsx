"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAuthErrorMessage, isEmailNotConfirmedError } from "@/lib/auth/errors";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [infoMessage, setInfoMessage] = useState(
    searchParams.get("message") === "confirm_email"
      ? "Compte créé ! Confirmez votre email avant de vous connecter."
      : "",
  );
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleResendConfirmation() {
    if (!form.email) {
      setGlobalError("Saisissez votre email pour renvoyer la confirmation.");
      return;
    }
    setResending(true);
    setGlobalError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: form.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResending(false);
    if (error) {
      setGlobalError(getAuthErrorMessage(error));
      return;
    }
    setInfoMessage("Email de confirmation renvoyé. Vérifiez votre boîte de réception.");
    setNeedsEmailConfirmation(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setInfoMessage("");
    setNeedsEmailConfirmation(false);
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LoginInput;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!isSupabaseConfigured()) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (error) {
      setGlobalError(getAuthErrorMessage(error));
      setNeedsEmailConfirmation(isEmailNotConfirmedError(error));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Accédez à votre espace enseignant Inclusia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {infoMessage && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {infoMessage}
            </p>
          )}
          {globalError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {globalError}
            </p>
          )}
          {needsEmailConfirmation && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={resending}
              onClick={handleResendConfirmation}
            >
              {resending ? "Envoi..." : "Renvoyer l'email de confirmation"}
            </Button>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@ecole.fr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between text-base">
            <Link href="/forgot-password" className="text-primary hover:underline min-h-[44px] flex items-center">
              Mot de passe oublié ?
            </Link>
            <Link href="/register" className="text-primary hover:underline min-h-[44px] flex items-center">
              Créer un compte
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
