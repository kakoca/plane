"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { PageHead } from "@/components/core/page-title";
import { ProjectGraphView } from "@/components/graph-visualization";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useCycle } from "@/hooks/store/use-cycle";
import { useModule } from "@/hooks/store/use-module";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
import type { Route } from "./+types/page";

function ProjectGraphPage({ params }: Route.ComponentProps) {
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId } = params;
  // theme hook
  const { resolvedTheme } = useTheme();
  // plane hooks
  const { t } = useTranslation();
  // store
  const { getProjectById } = useProject();
  const { issues } = useIssues();
  const { cycles } = useCycle();
  const { modules } = useModule();
  
  // derived values
  const project = getProjectById(projectId);
  const pageTitle = project?.name ? `${project?.name} - Graph View` : "Graph View";
  const isDarkMode = resolvedTheme === "dark";
  
  // state
  const [isLoading, setIsLoading] = useState(false);

  const handleIssueClick = (issueId: string) => {
    router.push(`/${workspaceSlug}/projects/${projectId}/issues/${issueId}`);
  };

  const handleCycleClick = (cycleId: string) => {
    router.push(`/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`);
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`);
  };

  const handleRelationshipCreate = async (sourceId: string, targetId: string, type: string) => {
    console.log("Creating relationship:", { sourceId, targetId, type });
    // TODO: Implement relationship creation via API
  };

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full flex flex-col">
        <ProjectGraphView
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          issues={issues || []}
          cycles={cycles || []}
          modules={modules || []}
          onIssueClick={handleIssueClick}
          onCycleClick={handleCycleClick}
          onModuleClick={handleModuleClick}
          onRelationshipCreate={handleRelationshipCreate}
          theme={isDarkMode ? "dark" : "light"}
          className="flex-1"
        />
      </div>
    </>
  );
}

export default observer(ProjectGraphPage);