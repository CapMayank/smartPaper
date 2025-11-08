/** @format */

"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface User {
	id: string;
	email: string;
	name: string | null;
	role?: string | null | undefined;
}

interface Session {
	session: {
		userId: string;
		expiresAt: Date;
	};
	user: User;
}

interface DashboardNavProps {
	session: Session;
}

export default function DashboardNav({ session }: DashboardNavProps) {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			toast.success("Logged out successfully");
			router.push("/login");
			router.refresh();
		} catch (error) {
			toast.error("Failed to logout");
		}
	};

	const isAdmin = session.user.role === "ADMIN" || session.user.role === "admin";

	return (
		<nav className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center space-x-8">
						<h1 className="text-xl font-bold">smartPaper</h1>
						<div className="hidden md:flex space-x-2">
							<Link href="/dashboard">
								<Button variant="ghost" size="sm">Dashboard</Button>
							</Link>
							<Link href="/dashboard/sessions">
								<Button variant="ghost" size="sm">Sessions</Button>
							</Link>
							<Link href="/dashboard/exam-groups">
								<Button variant="ghost" size="sm">Exams</Button>
							</Link>
							<Link href="/dashboard/classes">
								<Button variant="ghost" size="sm">Classes</Button>
							</Link>
							<Link href="/dashboard/subjects">
								<Button variant="ghost" size="sm">Subjects</Button>
							</Link>
							<Link href="/dashboard/books">
								<Button variant="ghost" size="sm">Books</Button>
							</Link>
							<Link href="/dashboard/questions">
								<Button variant="ghost" size="sm">Questions</Button>
							</Link>
							<Link href="/dashboard/blueprints">
								<Button variant="ghost" size="sm">Blueprints</Button>
							</Link>
							<Link href="/dashboard/papers">
								<Button variant="ghost" size="sm">Papers</Button>
							</Link>
							{isAdmin && (
								<Link href="/dashboard/users">
									<Button variant="ghost" size="sm">Users</Button>
								</Link>
							)}
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="flex items-center gap-2">
									<Avatar className="h-8 w-8">
										<AvatarFallback className="text-xs">
											{session.user.name?.[0]?.toUpperCase() ||
												session.user.email[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="hidden md:flex flex-col items-start">
										<span className="text-sm font-medium">
											{session.user.name || session.user.email}
										</span>
										<Badge variant="secondary" className="text-xs">
											{session.user.role}
										</Badge>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem disabled>
									{session.user.email}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</nav>
	);
}
