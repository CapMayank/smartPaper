/** @format */

import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");
	const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
	return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
	const email = "admin@example.com";
	const password = "admin123456";

	console.log("🗑️  Deleting existing admin user...");

	await prisma.user.deleteMany({
		where: { email },
	});

	console.log("✅ Deleted");
	console.log("📝 Creating new admin user...");

	const hashedPassword = await hashPassword(password);

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

	await prisma.account.create({
		data: {
			id: crypto.randomUUID(),
			userId: user.id,
			accountId: user.id,
			providerId: "credential",
			password: hashedPassword,
		},
	});

	console.log("\n🎉 SUCCESS!");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("Email:    ", email);
	console.log("Password: ", password);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
	.catch((error) => {
		console.error("❌ Error:", error);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
