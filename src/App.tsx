import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FullResultsDashboard } from "@/components/chat/cards/ModelResultsCard";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/model-results-dashboard" element={<ModelResultsDashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const ModelResultsDashboardPage = () => (
  <main className="min-h-screen bg-background p-4 md:p-6">
    <div className="mx-auto max-w-6xl rounded-xl border border-border bg-card shadow-sm">
      <FullResultsDashboard showPopout={false} variant="page" />
    </div>
  </main>
);

export default App;
