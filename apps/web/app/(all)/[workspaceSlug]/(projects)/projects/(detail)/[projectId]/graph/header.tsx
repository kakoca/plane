"use client";

import { observer } from "mobx-react";
import { ArrowLeft, Network } from "lucide-react";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";

export const ProjectGraphHeader: React.FC = observer(() => {
  const router = useAppRouter();
  const { currentProjectDetails } = useProject();

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-custom-border-200">
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-custom-text-300" />
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">{currentProjectDetails?.name ?? "Project"}</span>
          <span className="text-custom-text-300">/</span>
          <span className="text-custom-text-300">Graph View</span>
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-custom-border-200 hover:bg-custom-background-90"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>
    </div>
  );
});