/** @format */

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "SmartPaper - Exam Paper Management",
	description: "Create and manage exam papers for schools",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="font-sans antialiased">
				{children}
				<Toaster />
			</body>
		</html>
	);
}
