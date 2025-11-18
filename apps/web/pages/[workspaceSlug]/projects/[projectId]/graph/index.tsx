import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams, useRouter } from "next/navigation";
import { Filter, Loader2, Maximize2, Minimize2, Settings, X } from "lucide-react";
// Components
import { ProjectGraphView } from "@/components/graph-visualization";
import type {
  PlaneCycle,
  PlaneIssue,
  PlaneModule,
} from "@/components/graph-visualization/adapters/PlaneDataAdapter";
// Hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useIssues } from "@/hooks/store/use-issues";
import { useModule } from "@/hooks/store/use-module";
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";

/**
 * GraphFullScreenPage
 *
 * Full-screen graph exploration experience with advanced controls.
 */
const GraphFullScreenPage: React.FC = observer(() => {
  const router = useRouter();
  const params = useParams<{ workspaceSlug: string; projectId: string }>();
  const workspaceSlug = params?.workspaceSlug ?? "";
  const projectId = params?.projectId ?? "";

  // Store hooks
  const { currentWorkspace } = useWorkspace();
  const { getProjectById, fetchProjectDetails } = useProject();
  const { issueMap } = useIssues();
  const { cycleMap, fetchAllCycles } = useCycle();
  const { moduleMap, fetchModules } = useModule();

  const canView = true;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "issue",
    "cycle",
    "module",
  ]);

  // Fetch data on mount
  useEffect(() => {
    if (!workspaceSlug || !projectId) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProjectDetails(workspaceSlug, projectId),
          fetchAllCycles?.(workspaceSlug, projectId),
          fetchModules?.(workspaceSlug, projectId),
        ]);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [workspaceSlug, projectId, fetchProjectDetails, fetchAllCycles, fetchModules]);

  // Full screen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Handle node clicks
  const handleIssueClick = (issueId: string) => {
    router.push(`/${workspaceSlug}/projects/${projectId}/issues/${issueId}`);
  };

  const handleCycleClick = (cycleId: string) => {
    router.push(`/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`);
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`);
  };

  // Handle relationship creation
  const handleRelationshipCreate = async (
    sourceId: string,
    targetId: string,
    type: string
  ) => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceSlug}/projects/${projectId}/graph/relationships`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_id: sourceId,
            target_id: targetId,
            relation_type: type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create relationship");
      }
    } catch (error) {
      console.error("Error creating relationship:", error);
    }
  };

  // Check permissions
  if (!canView) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Access Denied</h2>
          <p className="text-custom-text-300">
            You don&apos;t have permission to view this graph.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-custom-text-300">Loading graph data...</p>
        </div>
      </div>
    );
  }

  const project = getProjectById(projectId);
  const normalizedIssues = useMemo<PlaneIssue[]>(
    () => Object.values(issueMap ?? {}) as PlaneIssue[],
    [issueMap]
  );
  const normalizedCycles = useMemo<PlaneCycle[]>(
    () => Object.values(cycleMap ?? {}) as PlaneCycle[],
    [cycleMap]
  );
  const normalizedModules = useMemo<PlaneModule[]>(
    () => Object.values(moduleMap ?? {}) as PlaneModule[],
    [moduleMap]
  );

  return (
    <div
      className={`relative h-screen w-full ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header Toolbar */}
      <div
        className={`absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b p-4 backdrop-blur-sm ${
          theme === "dark" ? "border-gray-700 bg-gray-800/90" : "border-gray-200 bg-white/90"
        }`}
      >
        {/* Left side - Project info */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label="Close graph view"
          >
            <X className="h-5 w-5" />
          </button>

          <div>
            <h1
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {project?.name || "Project"} Graph
            </h1>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {currentWorkspace?.name}
            </p>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`rounded p-2 transition-colors ${
              showFilters
                ? theme === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
                : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label="Toggle theme"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullScreen}
            className={`rounded p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label="Toggle fullscreen"
          >
            {isFullScreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className={`absolute right-4 top-16 z-20 rounded-lg border p-4 shadow-lg ${
            theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}
        >
          <h3
            className={`mb-3 text-sm font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Filter Nodes
          </h3>

          <div className="flex flex-col gap-2">
            {["issue", "cycle", "module", "page", "view"].map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedTypes((prev) => [...prev, type]);
                    } else {
                      setSelectedTypes((prev) => prev.filter((t) => t !== type));
                    }
                  }}
                  className="rounded"
                />
                <span
                  className={`text-sm capitalize ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {type}s
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div className="h-full w-full pt-16">
        <ProjectGraphView
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          issues={normalizedIssues}
          cycles={normalizedCycles}
          modules={normalizedModules}
          onIssueClick={handleIssueClick}
          onCycleClick={handleCycleClick}
          onModuleClick={handleModuleClick}
          onRelationshipCreate={handleRelationshipCreate}
          theme={theme}
          className="h-full"
        />
      </div>

      {/* Help Tooltip */}
      <div
        className={`absolute bottom-4 left-4 max-w-xs rounded-lg p-3 text-xs backdrop-blur-sm ${
          theme === "dark"
            ? "bg-gray-800/90 text-gray-300"
            : "bg-white/90 text-gray-700"
        }`}
      >
        <p className="mb-1 font-semibold">Graph Controls:</p>
        <ul className="space-y-1">
          <li>&bull; Drag nodes to reposition</li>
          <li>&bull; Scroll to zoom in/out</li>
          <li>&bull; Drag from node to node to create relationships</li>
          <li>&bull; Click nodes to view details</li>
        </ul>
      </div>
    </div>
  );
});

GraphFullScreenPage.displayName = "GraphFullScreenPage";

export default GraphFullScreenPage;
export default GraphFullScreenPage;

