"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppIframeSDK } from "@whop-apps/sdk";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";

createAppIframeSDK({});

const queryClient = new QueryClient({});

export function ClientLayout({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<Toaster />
			{children}
		</QueryClientProvider>
	);
}
