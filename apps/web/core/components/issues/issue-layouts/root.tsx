// Adicionar este botão na toolbar de issues existente
// Este é um exemplo de integração - o arquivo real pode ter estrutura diferente

import React from "react";
import { useRouter } from "next/navigation";
import { Network } from "lucide-react";
import { Button } from "@plane/ui";

interface GraphViewButtonProps {
  workspaceSlug: string;
  projectId: string;
}

/**
 * GraphViewButton - Botão de acesso rápido para visualização em grafo
 */
export const GraphViewButton: React.FC<GraphViewButtonProps> = ({
  workspaceSlug,
  projectId,
}) => {
  const router = useRouter();

  const handleOpenGraphView = () => {
    router.push(`/${workspaceSlug}/projects/${projectId}/graph`);
  };

  return (
    <Button
      variant="neutral-primary"
      size="sm"
      onClick={handleOpenGraphView}
      prependIcon={<Network className="h-3.5 w-3.5" />}
      className="flex items-center gap-1.5"
    >
      <span className="hidden sm:inline">Graph View</span>
    </Button>
  );
};

// Integrar este botão na barra de ferramentas principal dos issues
// Exemplo de uso:
// <GraphViewButton workspaceSlug={workspaceSlug} projectId={projectId} />