import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Ongeldig e-mailadres'),
    password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens bevatten'),
});

export const profileSchema = z.object({
    username: z.string().min(3, 'Gebruikersnaam moet minimaal 3 tekens bevatten').max(20, 'Gebruikersnaam mag maximaal 20 tekens bevatten').optional(),
    full_name: z.string().max(50, 'Naam mag maximaal 50 tekens bevatten').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
