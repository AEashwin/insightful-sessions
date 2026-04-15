import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routeTitles: Record<string, string> = {
  "/": "Projects",
  "/workflow": "Workflow",
  "/classification": "Variable Classification",
  "/model-output": "Model Output",
};

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || "";

  return (
    <header className="h-14 bg-navy text-navy-foreground flex items-center px-6 shrink-0 z-50">
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity mr-8"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">DD</span>
        </div>
        <span className="text-base font-semibold tracking-tight">DD 3.0</span>
      </button>

      {/* Page title */}
      <span className="text-sm text-white/60 font-medium">{pageTitle}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors relative">
          <Bell size={16} className="text-white/70" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-white/10 rounded-md px-2 py-1 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white/90 hidden sm:inline">J. Davies</span>
              <ChevronDown size={14} className="text-white/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Settings size={14} className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut size={14} className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
