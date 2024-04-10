import { WhopThemeProvider } from "@whop-apps/sdk";
import { Theme } from "frosted-ui";
import "frosted-ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./layout.client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Whop Code",
	description: "Build your custom app right on whop",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ClientLayout>
					<WhopThemeProvider>
						<Theme>{children}</Theme>
					</WhopThemeProvider>
				</ClientLayout>
			</body>
		</html>
	);
}
