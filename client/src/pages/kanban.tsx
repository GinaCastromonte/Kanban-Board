import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Sidebar } from "@/components/kanban/sidebar";

export default function KanbanPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <KanbanBoard />
    </div>
  );
}
