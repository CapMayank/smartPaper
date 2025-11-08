/** @format */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Circle } from "lucide-react";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return null;
	}

	const displayName = session.user.name || session.user.email;

	return (
		<div className="space-y-8">
			{/* Enhanced Header */}
			<div className="space-y-3">
				<div>
					<h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
						Dashboard
					</h1>
				</div>
				<p className="text-lg text-slate-600 font-medium">
					Welcome back, {displayName}
				</p>
			</div>

			{/* Enhanced Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-max">
				{/* Role Card */}
				<Card className="border-0 bg-linear-to-br from-blue-50 via-blue-50 to-transparent shadow-sm hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600">
							Your Role
						</CardTitle>
						<Shield className="h-5 w-5 text-blue-500/60" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<Badge
							variant="default"
							className="text-base font-semibold capitalize"
						>
							{session.user.role}
						</Badge>
					</CardContent>
				</Card>

				{/* Email Card */}
				<Card className="border-0 bg-linear-to-br from-purple-50 via-purple-50 to-transparent shadow-sm hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600">
							Email Address
						</CardTitle>
						<Mail className="h-5 w-5 text-purple-500/60" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<p className="text-base font-semibold text-slate-900 truncate">
							{session.user.email}
						</p>
					</CardContent>
				</Card>

				{/* Status Card */}
				<Card className="border-0 bg-linear-to-br from-emerald-50 via-emerald-50 to-transparent shadow-sm hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600">
							Account Status
						</CardTitle>
						<Circle
							className="h-5 w-5 text-emerald-500 fill-emerald-500"
							aria-hidden="true"
						/>
					</CardHeader>
					<CardContent>
						<Badge
							variant="secondary"
							className="text-base font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
						>
							Active
						</Badge>
					</CardContent>
				</Card>
			</div>

			{/* Admin Actions - Unchanged Functionality */}
			{session.user.role === "admin" && (
				<Card>
					<CardHeader>
						<CardTitle>Admin Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							You have admin privileges. You can manage users from the Users
							page.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
