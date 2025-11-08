/** @format */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import UsersTable from "@/components/users-table";
import CreateUserDialog from "@/components/create-user-dialog";
import { Users } from "lucide-react";

const prisma = new PrismaClient();

export default async function UsersPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || session.user.role !== "admin") {
		redirect("/dashboard");
	}

	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			createdAt: true,
			banned: true,
		},
	});

	const totalUsers = users.length;
	const activeUsers = users.filter((u) => !u.banned).length;
	const adminUsers = users.filter((u) => u.role === "admin").length;

	return (
		<div className="space-y-8">
			{/* Enhanced Header */}
			<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div className="space-y-3 flex-1">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 shadow-sm">
							<Users className="h-6 w-6 text-white" aria-hidden="true" />
						</div>
						<div>
							<h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
								User Management
							</h1>
						</div>
					</div>
					<p className="text-base text-slate-600">
						Manage and create user accounts across the system
					</p>
				</div>
				<CreateUserDialog />
			</div>

			{/* Stats Summary */}
			<div className="grid gap-3 grid-cols-3 w-full">
				<div className="rounded-lg bg-linear-to-br from-blue-50 to-blue-50/50 px-4 py-3 border border-blue-100/50">
					<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
						Total Users
					</p>
					<p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
				</div>
				<div className="rounded-lg bg-linear-to-br from-emerald-50 to-emerald-50/50 px-4 py-3 border border-emerald-100/50">
					<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
						Active
					</p>
					<p className="text-2xl font-bold text-slate-900">{activeUsers}</p>
				</div>
				<div className="rounded-lg bg-linear-to-br from-purple-50 to-purple-50/50 px-4 py-3 border border-purple-100/50">
					<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
						Admins
					</p>
					<p className="text-2xl font-bold text-slate-900">{adminUsers}</p>
				</div>
			</div>

			{/* Users Table */}
			<UsersTable users={users} currentUserId={session.user.id} />
		</div>
	);
}
