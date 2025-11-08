/** @format */

"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateAdminPage() {
	const [email, setEmail] = useState("admin@example.com");
	const [password, setPassword] = useState("admin123456");
	const [name, setName] = useState("Admin User");
	const [isLoading, setIsLoading] = useState(false);

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			console.log("Creating user via Better Auth...");

			const response = await authClient.signUp.email({
				email,
				password,
				name,
			});

			console.log("Response:", response);

			if (response.error) {
				toast.error(response.error.message || "Failed to create user");
				console.error("Error:", response.error);
				return;
			}

			toast.success("✅ User created! Now set role to admin in database:");
			toast.info("Run: npx prisma studio");
			toast.info("Find the user, change role to 'admin'");

			console.log("User created successfully:", response);
		} catch (error) {
			console.error("Exception:", error);
			toast.error("An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create Admin Account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignup} className="space-y-4">
						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<div>
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								minLength={8}
								disabled={isLoading}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create User"}
						</Button>
					</form>

					<div className="mt-6 p-4 bg-blue-50 rounded-md text-sm">
						<p className="font-semibold mb-2">After creation:</p>
						<ol className="list-decimal list-inside space-y-1 text-xs">
							<li>
								Run: <code className="bg-white px-1">npx prisma studio</code>
							</li>
							<li>
								Find user{" "}
								<code className="bg-white px-1">admin@example.com</code>
							</li>
							<li>
								Change <code className="bg-white px-1">role</code> to{" "}
								<code className="bg-white px-1">admin</code>
							</li>
							<li>
								Restore middleware:{" "}
								<code className="bg-white px-1">
									mv src/middleware.ts.bak src/middleware.ts
								</code>
							</li>
							<li>Restart dev server</li>
							<li>
								Login at <code className="bg-white px-1">/login</code>
							</li>
						</ol>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
