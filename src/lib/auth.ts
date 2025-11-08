/** @format */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
		requireEmailVerification: false,
		sendResetPassword: async ({ user, url }) => {
			const Resend = (await import("resend")).Resend;
			const resend = new Resend(process.env.RESEND_API_KEY);

			await resend.emails.send({
				from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
				to: user.email,
				subject: "Reset Your Password",
				html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name || user.email},</p>
            <p>You requested to reset your password. Click the button below to continue:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
			});
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	plugins: [
		admin({
			defaultRole: "user",
		}),
	],
});

export type Session = typeof auth.$Infer.Session;
