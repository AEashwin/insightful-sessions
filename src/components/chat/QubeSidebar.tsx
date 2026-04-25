import { useState } from "react";
import { Plus, Search, MessageSquare, Folder, TrendingUp, Tag, BarChart3, Sparkles, ChevronsLeft, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface ChatThread {
  id: string;
  title: string;
  projectId: string;
  updatedAgo: string;
}

export interface Project {
  id: string;
  name: string;
  brand: string;
  market: string;
}

interface Tool {
  id: string;
  name: string;
  short: string;
  icon: typeof TrendingUp;
  enabled: boolean;
}

const tools: Tool[] = [
  { id: "dd", name: "Demand Drivers", short: "DD", icon: TrendingUp, enabled: true },
  { id: "ps", name: "PriceSense", short: "PS", icon: Tag, enabled: false },
  { id: "fc", name: "Forecaster", short: "FC", icon: BarChart3, enabled: false },
];

interface ToolRailProps {
  activeToolId: string;
  onSelectTool: (id: string) => void;
}

export function ToolRail({ activeToolId, onSelectTool }: ToolRailProps) {
  return (
    <div className="w-12 bg-navy flex flex-col items-center py-3 gap-1 border-r border-sidebar-border shrink-0 h-screen">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center mb-2">
          <Sparkles size={14} className="text-primary-foreground" />
        </div>
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === activeToolId;
          return (
            <Tooltip key={t.id} delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => t.enabled && onSelectTool(t.id)}
                  disabled={!t.enabled}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all relative",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : t.enabled
                      ? "text-navy-foreground/60 hover:text-navy-foreground hover:bg-white/10"
                      : "text-navy-foreground/25 cursor-not-allowed",
                  )}
                >
                  <Icon size={16} />
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[3px] h-5 w-[3px] rounded-r bg-primary-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {t.name}
                {!t.enabled && <span className="ml-1 opacity-60">· coming soon</span>}
              </TooltipContent>
            </Tooltip>
          );
      })}
    </div>
  );
}

interface QubeSidebarProps {
  projects: Project[];
  threads: ChatThread[];
  activeThreadId: string;
  activeProjectId: string;
  activeToolId: string;
  onSelectThread: (id: string) => void;
  onSelectProject: (id: string) => void;
  onNewChat: () => void;
  onNewProject: () => void;
}

export function QubeSidebar({
  projects,
  threads,
  activeThreadId,
  activeProjectId,
  activeToolId,
  onSelectThread,
  onSelectProject,
  onNewChat,
  onNewProject,
}: QubeSidebarProps) {
  const [projectSearch, setProjectSearch] = useState("");
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeTool = tools.find((t) => t.id === activeToolId) ?? tools[0];
  const projectThreads = threads.filter((t) => t.projectId === activeProjectId);
  const filteredProjects = projects.filter((p) =>
    `${p.name} ${p.brand} ${p.market}`.toLowerCase().includes(projectSearch.toLowerCase()),
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border p-0">
          <div className={cn("flex items-center gap-2 px-3 h-14", collapsed && "justify-center px-2")}>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Qube
                </p>
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {activeTool.name}
                </p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft size={14} className={cn("transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0">
          {/* New chat */}
          <div className={cn("p-2", collapsed && "p-1.5")}>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={onNewChat}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity",
                    collapsed ? "justify-center h-9" : "px-3 py-2",
                  )}
                >
                  <Plus size={14} />
                  {!collapsed && "New chat"}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">New chat</TooltipContent>}
            </Tooltip>
          </div>

          {/* Project switcher */}
          <div className={cn("px-2 pb-2", collapsed && "px-1.5")}>
            <DropdownMenu onOpenChange={(open) => open && setProjectSearch("")}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title={collapsed ? activeProject?.name : undefined}
                  aria-label={collapsed ? `Open project picker for ${activeProject?.name ?? "current project"}` : "Open project picker"}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md hover:bg-sidebar-accent transition-colors text-left",
                    collapsed ? "justify-center h-9" : "px-2.5 py-2",
                  )}
                >
                  <Folder size={14} className="text-muted-foreground shrink-0" />
                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-sidebar-foreground truncate">
                          {activeProject?.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {activeProject?.brand} · {activeProject?.market}
                        </p>
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="start">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Projects in {activeTool.name}
                </p>
                <div className="px-2 pb-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search projects"
                      className="h-8 pl-7 text-xs"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto pr-1">
                  {filteredProjects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="text-sm font-medium text-popover-foreground">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {p.brand} · {p.market}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {filteredProjects.length === 0 && (
                    <p className="px-2 py-2 text-xs text-muted-foreground">
                      {projects.length === 0 ? "No projects available" : "No matching projects"}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onNewProject}>
                  <Plus size={12} className="mr-2" />
                  New project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="px-2 pb-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search chats"
                  className="pl-7 h-8 text-xs bg-transparent border-sidebar-border"
                />
              </div>
            </div>
          )}

          {/* Threads */}
          <div className="flex-1 overflow-y-auto px-1.5 py-1">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-2">
                Recent chats
              </p>
            )}
            <SidebarMenu>
              {projectThreads.map((t) => {
                const isActive = t.id === activeThreadId;
                return (
                  <SidebarMenuItem key={t.id}>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => onSelectThread(t.id)}
                          isActive={isActive}
                          className={cn("h-auto", collapsed ? "justify-center" : "items-start py-2")}
                        >
                          <MessageSquare size={12} className="shrink-0 text-muted-foreground" />
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{t.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{t.updatedAgo}</p>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{t.title}</TooltipContent>}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
              {projectThreads.length === 0 && !collapsed && (
                <p className="px-2.5 py-2 text-[11px] text-muted-foreground italic">
                  No chats yet — start a new one.
                </p>
              )}
            </SidebarMenu>
          </div>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 rounded-md hover:bg-sidebar-accent transition-colors",
                  collapsed ? "justify-center p-1" : "px-2 py-1.5",
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium text-sidebar-foreground truncate">J. Davies</p>
                    <p className="text-[10px] text-muted-foreground truncate">Analyst · Pro plan</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & docs</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
  );
}

