/**
 * ProjectGraphExample
 * Exemplo de uso do ProjectGraphView
 */

import React from 'react';
import { ProjectGraphView } from '../views/ProjectGraphView';

/**
 * Exemplo de integração do ProjectGraphView com dados do Plane
 */
export const ProjectGraphExample: React.FC = () => {
  // Handler para quando um issue é clicado
  const handleIssueClick = (issueId: string) => {
    console.log('Issue clicked:', issueId);
    // Aqui você pode abrir um modal, navegar para a página do issue, etc.
    // Example: router.push(`/projects/${projectId}/issues/${issueId}`);
  };

  // Handler para criar relacionamento entre issues
  const handleRelationshipCreate = async (
    sourceId: string,
    targetId: string,
    type: string
  ) => {
    console.log('Creating relationship:', { sourceId, targetId, type });
    
    // Aqui você faria a chamada para a API do Plane
    // Example:
    // await issueService.createRelationship({
    //   source_id: sourceId,
    //   target_id: targetId,
    //   relation_type: type,
    // });
    
    // Por enquanto, apenas simula sucesso
    return Promise.resolve();
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ProjectGraphView
        projectId="project-123"
        workspaceSlug="my-workspace"
        onIssueClick={handleIssueClick}
        onRelationshipCreate={handleRelationshipCreate}
      />
    </div>
  );
};

/**
 * Exemplo com dados reais do Plane
 * 
 * import { observer } from 'mobx-react';
 * import { useProject } from '@/hooks/use-project';
 * import { useIssues } from '@/hooks/use-issues';
 * 
 * export const ProjectGraphWithData: React.FC<{ projectId: string }> = observer(({ projectId }) => {
 *   const { project } = useProject(projectId);
 *   const { issues } = useIssues(projectId);
 *   const { cycles } = useCycles(projectId);
 *   const { modules } = useModules(projectId);
 * 
 *   if (!project) return <div>Loading...</div>;
 * 
 *   return (
 *     <ProjectGraphView
 *       projectId={projectId}
 *       workspaceSlug={project.workspace_slug}
 *       issues={issues}
 *       cycles={cycles}
 *       modules={modules}
 *       onIssueClick={(issueId) => {
 *         // Abrir modal de detalhes do issue
 *         issueModalStore.open(issueId);
 *       }}
 *       onRelationshipCreate={async (sourceId, targetId, type) => {
 *         await issueService.createRelationship({
 *           source_id: sourceId,
 *           target_id: targetId,
 *           relation_type: type,
 *         });
 *       }}
 *     />
 *   );
 * });
 */

export default ProjectGraphExample;