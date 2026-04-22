import { Plus, Search, MessageSquare, MoreHorizontal, Folder } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface ChatSidebarProps {
  projects: Project[];
  threads: ChatThread[];
  activeThreadId: string;
  activeProjectId: string;
  onSelectThread: (id: string) => void;
  onSelectProject: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  projects,
  threads,
  activeThreadId,
  activeProjectId,
  onSelectThread,
  onSelectProject,
  onNewChat,
}: ChatSidebarProps) {
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectThreads = threads.filter((t) => t.projectId === activeProjectId);

  return (
    <aside className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary-foreground">DD</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">DD 3.0</span>
        </div>
      </div>

      {/* New chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          New chat
        </button>
      </div>

      {/* Project switcher */}
      <div className="px-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left">
              <Folder size={14} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {activeProject?.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {activeProject?.brand} · {activeProject?.market}
                </p>
              </div>
              <MoreHorizontal size={14} className="text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              Projects
            </p>
            {projects.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {p.brand} · {p.market}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus size={12} className="mr-2" />
              New project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats"
            className="pl-7 h-8 text-xs bg-transparent border-sidebar-border"
          />
        </div>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Recent
        </p>
        {projectThreads.map((t) => {
          const isActive = t.id === activeThreadId;
          return (
            <button
              key={t.id}
              onClick={() => onSelectThread(t.id)}
              className={`w-full flex items-start gap-2 px-3 py-2 rounded-md text-left transition-colors mb-0.5 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-foreground"
              }`}
            >
              <MessageSquare size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{t.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.updatedAgo}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-foreground truncate">J. Davies</p>
                <p className="text-[10px] text-muted-foreground truncate">Analyst · Pro plan</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help & docs</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
