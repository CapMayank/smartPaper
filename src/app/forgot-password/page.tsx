/** @format */

"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password",
			});

			if (response.error) {
				toast.error(response.error.message || "Failed to send reset email");
				return;
			}

			setEmailSent(true);
			toast.success("Password reset email sent");
		} catch (error) {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
							<CheckCircle2 className="h-6 w-6 text-green-600" />
						</div>
						<CardTitle>Check Your Email</CardTitle>
						<CardDescription>
							We&apos;ve sent password reset instructions to {email}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground text-center">
							Click the link in the email to reset your password. The link will
							expire in 15 minutes.
						</p>
						<Link href="/login">
							<Button variant="outline" className="w-full">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Login
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Forgot Password</CardTitle>
					<CardDescription>
						Enter your email to receive reset instructions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Sending..." : "Send Reset Link"}
						</Button>
						<Link href="/login">
							<Button variant="ghost" className="w-full" type="button">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Login
							</Button>
						</Link>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
