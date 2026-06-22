import { createFileRoute } from "@tanstack/react-router";
import { BackupModule } from "@/components/backup/backup-module";

export const Route = createFileRoute("/corretor/backup")({
  component: () => <div className="p-6"><BackupModule /></div>,
});
