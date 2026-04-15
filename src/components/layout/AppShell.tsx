import { AppHeader } from "./AppHeader";

interface AppShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className={fullWidth ? "flex-1 flex" : "flex-1"}>
        {fullWidth ? children : (
          <div className="w-full max-w-6xl mx-auto px-6 py-8">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
