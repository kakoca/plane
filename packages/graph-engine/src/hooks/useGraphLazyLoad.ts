import { useState, useEffect, useCallback, useRef } from 'react';
import { GraphNode, GraphEdge, GraphData } from '../types';

interface LazyLoadConfig {
  initialLoadCount?: number;
  loadMoreCount?: number;
  maxNodes?: number;
  loadDelay?: number;
}

interface UseGraphLazyLoadReturn {
  visibleData: GraphData;
  loadedCount: number;
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  loadAll: () => void;
  reset: () => void;
}

/**
 * Hook para implementar lazy loading em grafos grandes
 * 
 * @param fullData - Dados completos do grafo
 * @param config - Configurações de lazy loading
 * @returns Dados visíveis e funções de controle
 */
export function useGraphLazyLoad(
  fullData: GraphData,
  config: LazyLoadConfig = {}
): UseGraphLazyLoadReturn {
  const {
    initialLoadCount = 50,
    loadMoreCount = 25,
    maxNodes = 500,
    loadDelay = 100,
  } = config;

  const [loadedCount, setLoadedCount] = useState(initialLoadCount);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  // Calcular dados visíveis
  const visibleData: GraphData = {
    nodes: fullData.nodes.slice(0, Math.min(loadedCount, maxNodes)),
    edges: [],
    metadata: fullData.metadata,
  };

  // Filtrar edges para incluir apenas aqueles com nós visíveis
  const visibleNodeIds = new Set(visibleData.nodes.map(n => n.id));
  visibleData.edges = fullData.edges.filter(
    edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );

  const totalCount = Math.min(fullData.nodes.length, maxNodes);
  const hasMore = loadedCount < totalCount;

  // Carregar mais nós
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    
    // Simular delay de carregamento
    loadingTimeoutRef.current = setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + loadMoreCount, totalCount));
      setIsLoading(false);
    }, loadDelay);
  }, [hasMore, isLoading, loadMoreCount, totalCount, loadDelay]);

  // Carregar todos os nós
  const loadAll = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    
    loadingTimeoutRef.current = setTimeout(() => {
      setLoadedCount(totalCount);
      setIsLoading(false);
    }, loadDelay);
  }, [isLoading, totalCount, loadDelay]);

  // Resetar para o estado inicial
  const reset = useCallback(() => {
    setLoadedCount(initialLoadCount);
    setIsLoading(false);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, [initialLoadCount]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleData,
    loadedCount,
    totalCount,
    isLoading,
    hasMore,
    loadMore,
    loadAll,
    reset,
  };
}

/**
 * Hook para implementar virtualização de viewport
 * Renderiza apenas nós visíveis na tela
 */
export function useGraphVirtualization(
  data: GraphData,
  viewportBounds: { x: number; y: number; width: number; height: number }
): GraphData {
  const [virtualizedData, setVirtualizedData] = useState<GraphData>(data);

  useEffect(() => {
    // Filtrar nós dentro do viewport com margem
    const margin = 100; // Margem extra para suavizar transições
    const visibleNodes = data.nodes.filter(node => {
      const { x, y } = node.position;
      return (
        x >= viewportBounds.x - margin &&
        x <= viewportBounds.x + viewportBounds.width + margin &&
        y >= viewportBounds.y - margin &&
        y <= viewportBounds.y + viewportBounds.height + margin
      );
    });

    // Criar conjunto de IDs visíveis
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    // Filtrar edges conectados aos nós visíveis
    const visibleEdges = data.edges.filter(
      edge => visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
    );

    setVirtualizedData({
      nodes: visibleNodes,
      edges: visibleEdges,
      metadata: data.metadata,
    });
  }, [data, viewportBounds]);

  return virtualizedData;
}

/**
 * Hook para implementar paginação de dados do grafo
 */
export function useGraphPagination(
  fetchData: (page: number, pageSize: number) => Promise<GraphData>,
  pageSize: number = 50
) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<GraphData>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  // Cache de páginas carregadas
  const pagesCache = useRef<Map<number, GraphData>>(new Map());

  const loadPage = useCallback(async (pageNumber: number) => {
    // Verificar cache
    if (pagesCache.current.has(pageNumber)) {
      const cachedData = pagesCache.current.get(pageNumber)!;
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    
    try {
      const pageData = await fetchData(pageNumber, pageSize);
      
      // Adicionar ao cache
      pagesCache.current.set(pageNumber, pageData);
      
      // Verificar se há próxima página
      setHasNextPage(pageData.nodes.length === pageSize);
      
      setData(pageData);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, pageSize]);

  const nextPage = useCallback(() => {
    if (hasNextPage && !isLoading) {
      const next = page + 1;
      setPage(next);
      loadPage(next);
    }
  }, [page, hasNextPage, isLoading, loadPage]);

  const previousPage = useCallback(() => {
    if (page > 1 && !isLoading) {
      const prev = page - 1;
      setPage(prev);
      loadPage(prev);
    }
  }, [page, isLoading, loadPage]);

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber > 0 && !isLoading) {
      setPage(pageNumber);
      loadPage(pageNumber);
    }
  }, [isLoading, loadPage]);

  // Carregar primeira página
  useEffect(() => {
    loadPage(1);
  }, []); // eslint-disable-line

  return {
    data,
    page,
    isLoading,
    hasNextPage,
    hasPreviousPage: page > 1,
    nextPage,
    previousPage,
    goToPage,
  };
}