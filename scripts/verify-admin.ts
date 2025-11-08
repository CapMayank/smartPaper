/** @format */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const email = "admin@example.com";

	const user = await prisma.user.findUnique({
		where: { email },
		include: {
			accounts: true,
		},
	});

	if (!user) {
		console.log("❌ User not found");
		return;
	}

	console.log("\n👤 USER");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("ID:              ", user.id);
	console.log("Email:           ", user.email);
	console.log("Name:            ", user.name);
	console.log("Role:            ", user.role);
	console.log("Email Verified:  ", user.emailVerified);
	console.log("Banned:          ", user.banned);

	console.log("\n🔐 ACCOUNTS");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("Total accounts:  ", user.accounts.length);

	user.accounts.forEach((account, i) => {
		console.log(`\nAccount ${i + 1}:`);
		console.log("  Provider ID:   ", account.providerId);
		console.log("  Account ID:    ", account.accountId);
		console.log("  Has Password:  ", account.password ? "Yes" : "No");

		if (account.password) {
			const parts = account.password.split(":");
			console.log(
				"  Hash Format:   ",
				parts.length === 2 ? "scrypt (correct)" : "unknown (wrong!)"
			);
			console.log("  Salt Length:   ", parts[0]?.length || 0, "(should be 32)");
			console.log("  Key Length:    ", parts[1]?.length || 0, "(should be 64)");
			console.log(
				"  Hash Preview:  ",
				account.password.substring(0, 50) + "..."
			);
		}
	});

	console.log("\n");
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
