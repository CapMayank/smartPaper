/** @format */

import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

// Better Auth's password hashing implementation
async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");
	const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
	return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
	const email = "admin@example.com";
	const password = "admin123456";

	console.log("🔍 Checking database...");

	// Check if user exists
	const existingUser = await prisma.user.findUnique({
		where: { email },
		include: { accounts: true },
	});

	if (existingUser) {
		console.log("⚠️  User already exists");
		console.log("User ID:", existingUser.id);
		console.log("Email:", existingUser.email);

		// Update or create account with correct scrypt hash
		console.log("🔄 Updating password with scrypt...");
		const hashedPassword = await hashPassword(password);

		const existingAccount = await prisma.account.findFirst({
			where: {
				userId: existingUser.id,
				providerId: "credential",
			},
		});

		if (existingAccount) {
			await prisma.account.update({
				where: { id: existingAccount.id },
				data: { password: hashedPassword },
			});
			console.log("✅ Password updated!");
		} else {
			await prisma.account.create({
				data: {
					id: crypto.randomUUID(),
					userId: existingUser.id,
					accountId: existingUser.id,
					providerId: "credential",
					password: hashedPassword,
				},
			});
			console.log("✅ Account created!");
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("Email:    ", email);
		console.log("Password: ", password);
		console.log("Hash:     ", hashedPassword);
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
		return;
	}

	console.log("📝 Creating new admin user...");

	// Hash password using scrypt (Better Auth's method)
	const hashedPassword = await hashPassword(password);

	// Create user
	const user = await prisma.user.create({
		data: {
			id: crypto.randomUUID(),
			email,
			name: "Admin User",
			role: "admin",
			emailVerified: true,
			banned: false,
		},
	});

	console.log("✅ User created:", user.id);

	// Create account with credential provider
	await prisma.account.create({
		data: {
			id: crypto.randomUUID(),
			userId: user.id,
			accountId: user.id,
			providerId: "credential",
			password: hashedPassword,
		},
	});

	console.log("✅ Account created with scrypt hash!");
	console.log("\n🎉 Admin user created successfully!");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("Email:    ", email);
	console.log("Password: ", password);
	console.log("Hash:     ", hashedPassword);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
	.catch((error) => {
		console.error("❌ Error:", error);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
