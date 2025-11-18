# Correções de Bugs no Sistema de Grafos

## 📋 Resumo
Este documento detalha as correções aplicadas aos bugs críticos identificados no sistema de visualização de grafos do Plane.

## 🐛 Bugs Corrigidos

### 1. Método na Classe Errada ✅
**Arquivo:** `apps/api/plane/app/views/graph.py`  
**Linhas:** 617-680 (movido de 729-792)

**Problema:**
```python
# ❌ ANTES - Método estava na classe errada
class GraphLayoutEndpoint(BaseAPIView):
    def patch(self, request, slug, project_id):
        # ...
    
    def _add_issue_to_module(self, ...):  # Método privado na classe errada!
        # ...
```

**Solução:**
```python
# ✅ DEPOIS - Método movido para a classe correta
class GraphRelationshipEndpoint(BaseAPIView):
    def post(self, request, slug, project_id):
        # ...
    
    def _add_issue_to_module(self, ...):  # Agora está na classe certa!
        # ...

class GraphLayoutEndpoint(BaseAPIView):
    # Apenas métodos de layout aqui
```

**Impacto:** 
- Agora o método auxiliar pode ser chamado corretamente dentro de `GraphRelationshipEndpoint.post()`
- Melhor organização do código
- Sem mais erros de método não encontrado

---

### 2. Campo Inexistente no Model Project ✅
**Arquivo:** `apps/api/plane/app/views/graph.py`  
**Linhas:** 643, 700-703

**Problema:**
```python
# ❌ ANTES - Tentava acessar campo que não existe
project.graph_layout = layout  # Campo 'graph_layout' não existe no model Project
project.save(update_fields=['graph_layout'])

layout = getattr(project, 'graph_layout', {})  # Sempre retornaria {}
```

**Solução:**
```python
# ✅ DEPOIS - Usa campo metadata existente (JSONField)
# Salvando:
if not project.metadata:
    project.metadata = {}
project.metadata['graph_layout'] = layout
project.save(update_fields=['metadata'])

# Lendo:
layout = project.metadata.get('graph_layout', {}) if project.metadata else {}
```

**Impacto:**
- Layout agora é persistido corretamente no banco de dados
- Usa o campo `metadata` (JSONField) que já existe no model Project
- Não requer migration ou alteração de schema
- Usuários podem salvar e recuperar posições dos nós

---

### 3. QueryDict Não Mutável ✅
**Arquivo:** `apps/api/plane/app/views/graph.py`  
**Linhas:** 385-390

**Problema:**
```python
# ❌ ANTES - Tentava modificar QueryDict diretamente
request.GET._mutable = True  # Acesso a atributo privado (code smell)
request.GET["project_id"] = project_id
request.GET["scope"] = "project"
request.GET._mutable = False  # Pode falhar silenciosamente
```

**Solução:**
```python
# ✅ DEPOIS - Cria cópia mutável corretamente
new_get = request.GET.copy()  # Cria cópia mutável do QueryDict
new_get["project_id"] = project_id
new_get["scope"] = "project"
request.GET = new_get  # Substitui com versão modificada
```

**Impacto:**
- Código mais limpo e pythônico
- Não depende de atributos privados (_mutable)
- Mais robusto e menos propenso a erros
- Segue boas práticas Django

---

## 🧪 Próximos Passos para Testes

### 1. Iniciar Backend via Docker
```bash
cd c:/Dev/plane
docker-compose -f docker-compose-local.yml up -d
docker-compose -f docker-compose-local.yml logs -f api
```

### 2. Verificar Health Check
```bash
# Testar se API está respondendo
curl http://localhost:8000/api/health/

# Testar autenticação (substitua TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/workspaces/
```

### 3. Testar Endpoints de Grafo

#### A) Obter dados do grafo do workspace
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/workspaces/WORKSPACE_SLUG/graph/?depth=2&max_nodes=100"
```

**Resposta esperada:**
```json
{
  "nodes": [
    {
      "id": "issue-123",
      "type": "issue",
      "label": "Issue Title",
      "data": { ... }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "issue-123",
      "target": "issue-456",
      "type": "blocks"
    }
  ]
}
```

#### B) Obter dados do grafo do projeto
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/workspaces/WORKSPACE_SLUG/projects/PROJECT_ID/graph/"
```

#### C) Salvar layout do grafo
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "layout": {
         "issue-123": {"x": 100, "y": 200},
         "issue-456": {"x": 300, "y": 400}
       }
     }' \
     "http://localhost:8000/api/workspaces/WORKSPACE_SLUG/projects/PROJECT_ID/graph/layout/"
```

**Resposta esperada:**
```json
{
  "message": "Layout saved successfully",
  "nodes_updated": 2
}
```

#### D) Obter layout salvo
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/workspaces/WORKSPACE_SLUG/projects/PROJECT_ID/graph/layout/"
```

#### E) Criar novo relacionamento
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "source_type": "issue",
       "source_id": "issue-123",
       "target_type": "issue", 
       "target_id": "issue-456",
       "relation_type": "blocks"
     }' \
     "http://localhost:8000/api/workspaces/WORKSPACE_SLUG/projects/PROJECT_ID/graph/relationships/"
```

### 4. Testar Frontend

#### A) Compilar módulo graph-engine (se necessário)
```bash
cd c:/Dev/plane/packages/graph-engine
pnpm install
pnpm run build
```

#### B) Iniciar aplicação web
```bash
cd c:/Dev/plane/apps/web
pnpm install
pnpm run dev
```

#### C) Acessar visualizações
- **Project Graph:** `http://localhost:3000/workspace/SLUG/projects/PROJECT_ID/graph`
- **Cycle Graph:** `http://localhost:3000/workspace/SLUG/projects/PROJECT_ID/cycles/CYCLE_ID/graph`
- **Module Graph:** `http://localhost:3000/workspace/SLUG/projects/PROJECT_ID/modules/MODULE_ID/graph`

#### D) Verificar Console do Navegador
- Abrir DevTools (F12)
- Verificar erros no Console
- Verificar chamadas na aba Network
- Verificar se GraphCanvas renderiza

### 5. Cenários de Teste

#### ✅ Teste 1: Visualização Básica
1. Abrir graph view
2. Verificar se nós são renderizados
3. Verificar se edges conectam corretamente
4. Testar zoom/pan

#### ✅ Teste 2: Salvar Layout
1. Arrastar nós para novas posições
2. Clicar em "Save Layout"
3. Recarregar página
4. Verificar se posições foram mantidas

#### ✅ Teste 3: Criar Relacionamento
1. Clicar em modo "Add Relationship"
2. Conectar dois nós
3. Selecionar tipo de relação (blocks/depends_on/links_to)
4. Verificar se edge aparece

#### ✅ Teste 4: Filtros
1. Alternar filtros por tipo (issues/cycles/modules)
2. Verificar se nós são filtrados corretamente
3. Testar filtro de profundidade

#### ✅ Teste 5: Performance com Grafo Grande
1. Criar projeto com 100+ issues
2. Abrir graph view
3. Verificar lazy loading
4. Medir tempo de renderização

---

## 📊 Status das Correções

| Bug | Severidade | Status | Arquivo | Linhas |
|-----|------------|--------|---------|--------|
| Método na classe errada | 🔴 Crítico | ✅ Corrigido | `graph.py` | 617-680 |
| Campo inexistente no model | 🔴 Crítico | ✅ Corrigido | `graph.py` | 643, 700-703 |
| QueryDict não mutável | 🟡 Médio | ✅ Corrigido | `graph.py` | 385-390 |

---

## 🔍 Diagnóstico de Problemas Comuns

### Problema: "Method not found" ao criar relacionamento
**Causa:** Método `_add_issue_to_module` estava na classe errada  
**Status:** ✅ Corrigido

### Problema: Layout não persiste após recarregar
**Causa:** Campo `project.graph_layout` não existia  
**Status:** ✅ Corrigido - Agora usa `project.metadata`

### Problema: Erro ao filtrar grafo por projeto
**Causa:** Tentativa de modificar QueryDict imutável  
**Status:** ✅ Corrigido - Agora cria cópia mutável

### Problema: Frontend não renderiza nós
**Possíveis causas:**
1. Backend não está rodando → Verificar `docker-compose logs -f api`
2. Erro na API → Verificar resposta com curl
3. CORS bloqueando → Verificar DevTools Network
4. Módulo não compilado → Rodar `pnpm run build` no graph-engine

### Problema: Performance ruim com grafos grandes
**Soluções implementadas:**
1. ✅ Lazy loading com 3 estratégias (progressive, viewport, pagination)
2. ✅ Limite de nós (max_nodes parameter)
3. ✅ Limite de profundidade (depth parameter)
4. ⏳ TODO: Web Workers para processamento em background

---

## 📝 Arquivos Relacionados

### Backend
- [`apps/api/plane/app/views/graph.py`](apps/api/plane/app/views/graph.py:1) - Views corrigidas (793 linhas)
- [`apps/api/plane/app/urls/graph.py`](apps/api/plane/app/urls/graph.py:1) - URLs dos endpoints (35 linhas)

### Frontend
- [`packages/graph-engine/`](packages/graph-engine/) - Módulo React Flow (48 arquivos)
- [`apps/web/core/components/graph-visualization/`](apps/web/core/components/graph-visualization/) - Componentes de visualização

### Documentação
- [`DOCKER_SETUP_COMMANDS.md`](DOCKER_SETUP_COMMANDS.md:1) - Comandos Docker
- [`GRAPH_TROUBLESHOOTING.md`](GRAPH_TROUBLESHOOTING.md:1) - Guia de troubleshooting
- [`integration-plan.md`](integration-plan.md:1) - Plano original de integração

---

## ✨ Melhorias Futuras (Opcional)

1. **Adicionar campo dedicado no model** (opcional):
   ```python
   # apps/api/plane/db/models/project.py
   class Project(BaseModel):
       # ... campos existentes ...
       graph_layout = models.JSONField(null=True, blank=True)
   ```
   - Vantagem: Mais explícito, melhor para queries
   - Desvantagem: Requer migration

2. **Cache de grafos grandes**:
   ```python
   from django.core.cache import cache
   
   cache_key = f"graph_{workspace_id}_{project_id}"
   cached_graph = cache.get(cache_key)
   if cached_graph:
       return cached_graph
   ```

3. **Compressão de layouts**:
   ```python
   import gzip
   import json
   
   compressed = gzip.compress(json.dumps(layout).encode())
   project.metadata['graph_layout_compressed'] = compressed
   ```

---

## 🎉 Conclusão

Todos os bugs críticos foram corrigidos e o sistema está pronto para testes. Os endpoints devem funcionar corretamente agora que:

1. ✅ Métodos estão nas classes corretas
2. ✅ Persistência usa campos existentes no banco
3. ✅ QueryDicts são manipulados corretamente

**Próximo passo:** Iniciar o backend via Docker e testar os endpoints conforme instruções acima.