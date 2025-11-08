/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface User {
	id: string;
	email: string;
	name: string | null;
	role: string;
	createdAt: Date;
	banned: boolean;
}

interface UsersTableProps {
	users: User[];
	currentUserId: string;
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
	const router = useRouter();
	const [loading, setLoading] = useState<string | null>(null);

	const handleRoleChange = async (userId: string, newRole: string) => {
		setLoading(userId);
		try {
			const response = await authClient.admin.setRole({
				userId,
				role: newRole,
			});

			if (response.error) {
				toast.error(response.error.message || "Failed to update role");
				return;
			}

			toast.success("User role updated successfully");
			router.refresh();
		} catch (error) {
			toast.error("An error occurred");
		} finally {
			setLoading(null);
		}
	};

	const handleBanUser = async (userId: string) => {
		setLoading(userId);
		try {
			const response = await authClient.admin.banUser({
				userId,
			});

			if (response.error) {
				toast.error(response.error.message || "Failed to ban user");
				return;
			}

			toast.success("User banned successfully");
			router.refresh();
		} catch (error) {
			toast.error("An error occurred");
		} finally {
			setLoading(null);
		}
	};

	const handleUnbanUser = async (userId: string) => {
		setLoading(userId);
		try {
			const response = await authClient.admin.unbanUser({
				userId,
			});

			if (response.error) {
				toast.error(response.error.message || "Failed to unban user");
				return;
			}

			toast.success("User unbanned successfully");
			router.refresh();
		} catch (error) {
			toast.error("An error occurred");
		} finally {
			setLoading(null);
		}
	};

	return (
		<div className="rounded-md border bg-white">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Email</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="text-center py-8">
								No users found
							</TableCell>
						</TableRow>
					) : (
						users.map((user) => (
							<TableRow key={user.id}>
								<TableCell className="font-medium">{user.email}</TableCell>
								<TableCell>{user.name || "-"}</TableCell>
								<TableCell>
									<Badge
										variant={user.role === "admin" ? "default" : "secondary"}
									>
										{user.role}
									</Badge>
								</TableCell>
								<TableCell>
									{user.banned ? (
										<Badge variant="destructive">Banned</Badge>
									) : (
										<Badge variant="outline">Active</Badge>
									)}
								</TableCell>
								<TableCell>
									{new Date(user.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									{user.id !== currentUserId && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0"
													disabled={loading === user.id}
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() =>
														handleRoleChange(
															user.id,
															user.role === "admin" ? "user" : "admin"
														)
													}
												>
													{user.role === "admin"
														? "Demote to User"
														: "Promote to Admin"}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{user.banned ? (
													<DropdownMenuItem
														onClick={() => handleUnbanUser(user.id)}
													>
														Unban User
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleBanUser(user.id)}
													>
														Ban User
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
