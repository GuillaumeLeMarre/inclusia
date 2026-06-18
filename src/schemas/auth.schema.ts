import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const studentSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  className: z.string().optional(),
  gradeLevel: z.string().optional(),
  profiles: z.array(z.string()).min(1, "Sélectionnez au moins un profil"),
  needs: z.string().optional(),
  notes: z.string().optional(),
  preferences: z.object({
    audioEnabled: z.boolean(),
    diagramsEnabled: z.boolean(),
    quizEnabled: z.boolean(),
    simplifiedVocab: z.boolean(),
    adaptedFont: z.boolean(),
    simplifiedText: z.boolean(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
