"use client";

import { observer } from "mobx-react";
import { Network } from "lucide-react";
// hooks
import { useProject } from "@/hooks/store/use-project";

export const GraphMobileHeader: React.FC = observer(() => {
  const { currentProjectDetails } = useProject();

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-custom-border-200 bg-custom-background-100">
      <Network className="h-4 w-4 text-custom-text-300" />
      <div className="flex-1">
        <h1 className="text-sm font-medium truncate">
          {currentProjectDetails?.name ?? "Project"} - Graph View
        </h1>
      </div>
    </div>
  );
});