import { z } from "zod";

export const CredentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
	name: z.string().min(5),
	email: z.string().email(),
	password: z.string().min(6),
});

export const UserSettingsSchema = z
	.object({
		name: z.optional(z.string().min(5)),
		email: z.optional(z.string().email()),
		password: z.optional(z.string().min(6)),
		newPassword: z.optional(z.string().min(6)),
		isTwoFactorAuthEnabled: z.optional(z.boolean()),
	})
	.refine(
		(values) => {
			if (values.password && !values.newPassword) return false;
			return true;
		},
		{
			message: "Nova senha requerida",
			path: ["newPassword"],
		},
	)
	.refine(
		(values) => {
			if (values.newPassword && !values.password) return false;
			return true;
		},
		{
			message: "Senha requerida",
			path: ["password"],
		},
	);


export const ResetPasswordSchema = z.object({
	email: z.string().email(),
});

export const NewPasswordSchema = z.object({
	password: z.string().min(6),
});

export const MagicLinkSignInSchema = z.object({
	email: z.string().email(),
});
