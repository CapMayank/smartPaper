/** @format */

"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TestSignup() {
	const handleSignup = async () => {
		try {
			const response = await authClient.signUp.email({
				email: "admin@example.com",
				password: "admin123456",
				name: "Admin User",
			});

			console.log("Response:", response);

			if (response.error) {
				toast.error(response.error.message);
			} else {
				toast.success("User created via Better Auth!");
			}
		} catch (error) {
			console.error(error);
			toast.error("Error creating user");
		}
	};

	return (
		<div className="p-8">
			<h1 className="text-2xl mb-4">Test Better Auth Signup</h1>
			<Button onClick={handleSignup}>Create Admin via Better Auth</Button>
		</div>
	);
}
