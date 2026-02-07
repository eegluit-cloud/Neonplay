import { z } from 'zod';

// Username rules: 3-20 chars, alphanumeric + underscores, must start with letter
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Must start with a letter, only letters, numbers, underscores');

// Password with granular checks for the strength indicator
export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'One uppercase letter')
  .regex(/[a-z]/, 'One lowercase letter')
  .regex(/[0-9]/, 'One number');

// Helper: compute password strength score (0-4) for the indicator
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  checks: { label: string; met: boolean }[];
} {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score], checks };
}

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export const registerStepEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const registerStepUsernameSchema = z.object({
  username: usernameSchema,
});

export const registerStepPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
    }),
    ageVerified: z.literal(true, {
      errorMap: () => ({ message: 'You must confirm you are 18 or older' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
