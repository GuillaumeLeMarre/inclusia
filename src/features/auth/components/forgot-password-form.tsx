"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth.schema";

export function ForgotPasswordForm() {
  const [form, setForm] = useState<ForgotPasswordInput>({ email: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordInput, string>>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ForgotPasswordInput;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/login`,
    });
    setLoading(false);
    setSuccess(true);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Recevez un lien de réinitialisation par email
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600">
              Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">Retour à la connexion</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@ecole.fr"
                value={form.email}
                onChange={(e) => setForm({ email: e.target.value })}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>
            <p className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
