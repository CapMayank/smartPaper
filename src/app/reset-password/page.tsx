/** @format */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";

function ResetPasswordForm() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		const error = searchParams.get("error");

		if (error === "INVALID_TOKEN") {
			toast.error("This reset link is invalid or has expired");
			setTimeout(() => router.push("/forgot-password"), 2000);
			return;
		}

		if (tokenParam) {
			setToken(tokenParam);
		} else {
			toast.error("Invalid reset link");
			setTimeout(() => router.push("/forgot-password"), 2000);
		}
	}, [searchParams, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		if (!token) {
			toast.error("Reset token is missing");
			return;
		}

		setIsLoading(true);

		try {
			const response = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (response.error) {
				toast.error(response.error.message || "Failed to reset password");
				return;
			}

			toast.success("Password reset successfully");
			setTimeout(() => router.push("/login"), 1500);
		} catch (error) {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>Enter your new password below</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
								disabled={isLoading || !token}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								minLength={8}
								disabled={isLoading || !token}
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !token}
						>
							{isLoading ? "Resetting..." : "Reset Password"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ResetPasswordForm />
		</Suspense>
	);
}
