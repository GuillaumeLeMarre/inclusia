import type { AuthError } from "@supabase/supabase-js";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  email_not_confirmed:
    "Votre email n'est pas encore confirmé. Cliquez sur le lien reçu par email, ou renvoyez un email de confirmation.",
  invalid_credentials: "Email ou mot de passe incorrect.",
  user_not_found: "Aucun compte trouvé avec cet email.",
  invalid_grant: "Email ou mot de passe incorrect.",
  over_request_rate_limit: "Trop de tentatives. Réessayez dans quelques minutes.",
  user_already_registered: "Un compte existe déjà avec cet email.",
  weak_password: "Mot de passe trop faible (minimum 8 caractères).",
};

export function getAuthErrorMessage(error: AuthError): string {
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }

  const message = error.message.toLowerCase();

  if (message.includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }
  if (message.includes("invalid login credentials")) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  return error.message || "Une erreur est survenue. Réessayez.";
}

export function isEmailNotConfirmedError(error: AuthError): boolean {
  return (
    error.code === "email_not_confirmed" ||
    error.message.toLowerCase().includes("email not confirmed")
  );
}
