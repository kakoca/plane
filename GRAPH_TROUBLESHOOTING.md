# 🔧 Troubleshooting - Visualização de Grafos

## Problemas Identificados e Soluções

### 1. ❌ Erro no Backend: `_add_issue_to_module` na Classe Errada

**Problema:** O método `_add_issue_to_module` está dentro da classe `GraphLayoutEndpoint` (linha 729) quando deveria estar na classe `GraphRelationshipEndpoint`.

**Erro que você verá:**
```python
AttributeError: 'GraphRelationshipEndpoint' object has no attribute '_add_issue_to_module'
```

**Solução:** Vou corrigir o arquivo `apps/api/plane/app/views/graph.py`

---

### 2. ⚠️ Campo `graph_layout` não existe no Model Project

**Problema:** A linha 706 tenta salvar `project.graph_layout` mas esse campo não existe no banco de dados.

**Erro que você verá:**
```python
AttributeError: 'Project' object has no attribute 'graph_layout'
```

**Soluções:**

**Opção A - Usar JSONField existente (Recomendado):**
```python
# Use o campo metadata que já existe
if not hasattr(project, 'graph_layout_data'):
    project.metadata = project.metadata or {}
    project.metadata['graph_layout'] = layout
    project.save()
```

**Opção B - Criar Migration (Melhor para produção):**
```bash
# Adicionar campo ao model
python manage.py makemigrations
python manage.py migrate
```

---

### 3. 🔍 QueryDict não é mutável

**Problema:** Linha 387 em `ProjectGraphEndpoint`:
```python
request.GET._mutable = True  # Pode dar erro
```

**Solução:** Usar uma cópia ao invés de modificar diretamente:
```python
# Criar nova QueryDict
from django.http import QueryDict
new_get = request.GET.copy()
new_get['project_id'] = project_id
request.GET = new_get
```

---

## Como Testar se o Backend está Funcionando

### 1. Subir o Docker
```bash
cd c:/Dev/plane
docker-compose -f docker-compose-local.yml up -d
```

### 2. Verificar se a API está rodando
```bash
# Verificar status
docker-compose -f docker-compose-local.yml ps

# Ver logs
docker-compose -f docker-compose-local.yml logs -f api
```

### 3. Testar Endpoint de Graph
```bash
# Substitua YOUR_WORKSPACE pelo slug do workspace
curl http://localhost:8000/api/workspaces/YOUR_WORKSPACE/graph/

# Exemplo com parâmetros
curl "http://localhost:8000/api/workspaces/YOUR_WORKSPACE/graph/?types=issue&max_depth=1"
```

**Resposta esperada:**
```json
{
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "scope": "workspace",
    "types": ["issue"],
    "max_depth": 1,
    "total_nodes": 10,
    "total_edges": 5
  }
}
```

---

## Problemas Comuns no Frontend

### 1. React Flow não renderiza

**Causa:** Falta instalar dependência ou compilar o módulo

**Solução:**
```bash
cd c:/Dev/plane
pnpm install
cd packages/graph-engine
pnpm run build
cd ../..
pnpm install
```

### 2. Erro: "Module not found: @plane/graph-engine"

**Causa:** Módulo não está compilado ou não está linkado

**Solução:**
```bash
cd packages/graph-engine
pnpm run build
cd ../../apps/web
pnpm install
```

### 3. GraphCanvas não renderiza nada

**Causa:** Dados não estão no formato correto

**Diagnóstico:**
```javascript
// Adicionar console.log em ProjectGraphView
console.log('Graph Data:', graphData);
console.log('Nodes:', graphData.nodes);
console.log('Edges:', graphData.edges);
```

**Verificar:**
- `nodes` deve ser array de objetos com `id`, `type`, `data`, `position`
- `edges` deve ser array de objetos com `id`, `source`, `target`, `type`

---

## Checklist de Verificação

### Backend (API)
- [ ] Docker containers rodando (`docker-compose ps`)
- [ ] API responde em http://localhost:8000
- [ ] Endpoint `/api/workspaces/{slug}/graph/` retorna dados
- [ ] Sem erros nos logs (`docker logs api`)
- [ ] Migrations aplicadas

### Frontend (Web)
- [ ] `pnpm install` executado na raiz
- [ ] Módulo `@plane/graph-engine` compilado
- [ ] React Flow instalado (`pnpm list react-flow-renderer`)
- [ ] Sem erros no console do navegador
- [ ] Componentes exportados corretamente

### Integração
- [ ] Frontend consegue chamar a API
- [ ] CORS configurado (se necessário)
- [ ] Dados são transformados pelo PlaneDataAdapter
- [ ] GraphCanvas renderiza com dados

---

## Logs Úteis

### Ver logs da API em tempo real
```bash
docker-compose -f docker-compose-local.yml logs -f api
```

### Ver erros específicos
```bash
docker-compose -f docker-compose-local.yml logs api | grep -i error
docker-compose -f docker-compose-local.yml logs api | grep -i exception
```

### Reiniciar apenas a API
```bash
docker-compose -f docker-compose-local.yml restart api
```

---

## Próximos Passos

1. ✅ Aplicar correções no arquivo `graph.py` (vou fazer agora)
2. ✅ Testar endpoint via curl
3. ✅ Verificar se frontend consegue buscar dados
4. ✅ Debugar renderização no navegador
5. ✅ Adicionar logs de debug se necessário

---

## Contato para Suporte

Se os problemas persistirem, forneça:
1. Logs completos da API
2. Erros do console do navegador
3. Request/Response da chamada API
4. Versão do Docker e Node.js