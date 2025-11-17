import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react";
import { Loader2, X, Maximize2, Minimize2, Settings, Filter } from "lucide-react";
// Hooks
import { useProject, useWorkspace, useIssues, useCycle, useModule } from "@/hooks/store";
import { useUserPermissions } from "@/hooks/use-user-permissions";
// Components
import { ProjectGraphView } from "@/components/graph-visualization";
// Types
import { EUserPermissions } from "@/plane-web/constants/user-permissions";

/**
 * GraphFullScreenPage - Página de visualização em tela cheia do grafo
 * 
 * Oferece uma experiência imersiva para explorar o grafo de relacionamentos
 * do projeto, com controles avançados e layout otimizado.
 */
const GraphFullScreenPage = observer(() => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query as { 
    workspaceSlug: string; 
    projectId: string; 
  };

  // Store hooks
  const { currentWorkspace } = useWorkspace();
  const { getProjectById, fetchProjectDetails } = useProject();
  const { issues, fetchIssues } = useIssues();
  const { cycles, fetchCycles } = useCycle();
  const { modules, fetchModules } = useModule();

  // Permissions
  const { hasPermission } = useUserPermissions();
  const canView = hasPermission(
    workspaceSlug,
    projectId,
    EUserPermissions.ISSUE_VIEW
  );

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "issue", "cycle", "module"
  ]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!workspaceSlug || !projectId) return;
      
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProjectDetails(workspaceSlug, projectId),
          fetchIssues(workspaceSlug, projectId),
          fetchCycles(workspaceSlug, projectId),
          fetchModules(workspaceSlug, projectId),
        ]);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workspaceSlug, projectId]);

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
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Handle node clicks
  const handleIssueClick = (issueId: string) => {
    // Open issue in modal or navigate to issue page
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

      // Refresh data
      await fetchIssues(workspaceSlug, projectId);
    } catch (error) {
      console.error("Error creating relationship:", error);
    }
  };

  // Check permissions
  if (!canView) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-custom-text-300">
            You don't have permission to view this graph.
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

  return (
    <div 
      className={`h-screen w-full relative ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header Toolbar */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between ${
          theme === "dark" ? "bg-gray-800/90" : "bg-white/90"
        } backdrop-blur-sm border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {/* Left side - Project info */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label="Close graph view"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {project?.name || "Project"} Graph
            </h1>
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {currentWorkspace?.name}
            </p>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded transition-colors ${
              showFilters 
                ? theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            aria-label="Toggle filters"
          >
            <Filter className="h-5 w-5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label="Toggle theme"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullScreen}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
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
          className={`absolute top-16 right-4 z-20 p-4 rounded-lg shadow-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } border ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3 className={`text-sm font-semibold mb-3 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Filter Nodes
          </h3>
          
          <div className="flex flex-col gap-2">
            {["issue", "cycle", "module", "page", "view"].map((type) => (
              <label 
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTypes([...selectedTypes, type]);
                    } else {
                      setSelectedTypes(selectedTypes.filter(t => t !== type));
                    }
                  }}
                  className="rounded"
                />
                <span className={`text-sm capitalize ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
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
          issues={issues}
          cycles={cycles}
          modules={modules}
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
        className={`absolute bottom-4 left-4 p-3 rounded-lg ${
          theme === "dark" 
            ? "bg-gray-800/90 text-gray-300" 
            : "bg-white/90 text-gray-700"
        } backdrop-blur-sm text-xs max-w-xs`}
      >
        <p className="font-semibold mb-1">Graph Controls:</p>
        <ul className="space-y-1">
          <li>• Drag nodes to reposition</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Drag from node to node to create relationships</li>
          <li>• Click nodes to view details</li>
        </ul>
      </div>
    </div>
  );
});

GraphFullScreenPage.displayName = "GraphFullScreenPage";

export default GraphFullScreenPage;