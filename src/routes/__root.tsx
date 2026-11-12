import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI CCTV Monitoring Platform" },
      { name: "description", content: "AI-powered CCTV monitoring: smoke detection, people counting, and floor-plan occupancy heatmap." },
      { name: "author", content: "AI CCTV Monitoring Platform" },
      { property: "og:title", content: "AI CCTV Monitoring Platform" },
      { property: "og:description", content: "AI-powered CCTV monitoring: smoke detection, people counting, and floor-plan occupancy heatmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Restore preference from localStorage on client, default open, don't change on window resize
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cctv_sidebar_open");
      if (saved !== null) {
        setSidebarOpen(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cctv_sidebar_open", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar open={sidebarOpen} onToggle={handleToggleSidebar} />
        <div
          className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
            sidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-[68px]"
          }`}
        >
          <AppHeader
            sidebarOpen={sidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
          <main className="w-full flex-1 px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
