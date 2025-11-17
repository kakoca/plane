# Python imports
import json
from typing import Dict, List, Any

# Django imports
from django.db.models import Q, Prefetch, OuterRef, Subquery, F, Func
from django.core.serializers.json import DjangoJSONEncoder

# Third Party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from plane.app.views.base import BaseAPIView
from plane.app.permissions import WorkspaceEntityPermission, ProjectEntityPermission
from plane.db.models import (
    Issue,
    IssueRelation,
    Cycle,
    Module,
    Page,
    IssueView,
    CycleIssue,
    ModuleIssue,
)


class WorkspaceGraphEndpoint(BaseAPIView):
    """
    API endpoint to retrieve graph data for workspace-level visualization.
    Returns nodes (issues, cycles, modules, pages, views) and edges (relationships).
    
    Query Parameters:
    - scope: workspace | project | cycle | module (default: workspace)
    - types: Comma-separated list of node types to include (issue,cycle,module,page,view)
    - max_depth: Maximum depth for relationship traversal (default: 2)
    - include_links: Whether to include page links (default: true)
    - project_id: Filter by specific project (optional)
    """
    
    permission_classes = [WorkspaceEntityPermission]
    use_read_replica = True

    def get(self, request, slug):
        # Parse query parameters
        scope = request.GET.get("scope", "workspace")
        types = request.GET.get("types", "issue,cycle,module,page,view").split(",")
        max_depth = int(request.GET.get("max_depth", "2"))
        include_links = request.GET.get("include_links", "true").lower() == "true"
        project_id = request.GET.get("project_id", None)

        # Build base queryset
        base_filters = {"workspace__slug": slug}
        if project_id:
            base_filters["project_id"] = project_id

        nodes = []
        edges = []

        # Fetch issues with relationships
        if "issue" in types:
            issues = self._fetch_issues(base_filters, max_depth)
            nodes.extend(issues["nodes"])
            edges.extend(issues["edges"])

        # Fetch cycles
        if "cycle" in types:
            cycles = self._fetch_cycles(base_filters)
            nodes.extend(cycles["nodes"])
            edges.extend(cycles["edges"])

        # Fetch modules
        if "module" in types:
            modules = self._fetch_modules(base_filters)
            nodes.extend(modules["nodes"])
            edges.extend(modules["edges"])

        # Fetch pages
        if "page" in types:
            pages = self._fetch_pages(base_filters, include_links)
            nodes.extend(pages["nodes"])
            edges.extend(pages["edges"])

        # Fetch views
        if "view" in types:
            views = self._fetch_views(base_filters)
            nodes.extend(views["nodes"])

        graph_data = {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "scope": scope,
                "types": types,
                "max_depth": max_depth,
                "total_nodes": len(nodes),
                "total_edges": len(edges),
            },
        }

        return Response(graph_data, status=status.HTTP_200_OK)

    def _fetch_issues(self, base_filters: Dict, max_depth: int) -> Dict[str, List]:
        """Fetch issues and their relationships"""
        issues = (
            Issue.issue_objects.filter(**base_filters)
            .select_related("state", "project", "parent")
            .prefetch_related("assignees", "labels")
            .values(
                "id",
                "name",
                "sequence_id",
                "project_id",
                "state__name",
                "state__group",
                "priority",
                "parent_id",
                "created_at",
                "updated_at",
            )[:500]  # Limit to 500 issues for performance
        )

        nodes = []
        edges = []
        edge_id = 0

        for issue in issues:
            # Create issue node
            nodes.append({
                "id": str(issue["id"]),
                "type": "issue",
                "data": {
                    "label": issue["name"],
                    "metadata": {
                        "issueNumber": issue["sequence_id"],
                        "title": issue["name"],
                        "status": issue["state__name"],
                        "statusGroup": issue["state__group"],
                        "priority": self._map_priority(issue["priority"]),
                        "projectId": str(issue["project_id"]),
                        "createdAt": issue["created_at"].isoformat() if issue["created_at"] else None,
                        "updatedAt": issue["updated_at"].isoformat() if issue["updated_at"] else None,
                    },
                },
                "position": {"x": 0, "y": 0},  # Will be calculated on client
            })

            # Create parent-child edge
            if issue["parent_id"]:
                edges.append({
                    "id": f"edge-{edge_id}",
                    "source": str(issue["parent_id"]),
                    "target": str(issue["id"]),
                    "type": "parent_of",
                })
                edge_id += 1

        # Fetch issue relations
        issue_ids = [str(issue["id"]) for issue in issues]
        relations = IssueRelation.objects.filter(
            Q(issue_id__in=issue_ids) | Q(related_issue_id__in=issue_ids)
        ).values("issue_id", "related_issue_id", "relation_type")

        for relation in relations:
            edge_type = self._map_relation_type(relation["relation_type"])
            edges.append({
                "id": f"edge-{edge_id}",
                "source": str(relation["issue_id"]),
                "target": str(relation["related_issue_id"]),
                "type": edge_type,
            })
            edge_id += 1

        return {"nodes": nodes, "edges": edges}

    def _fetch_cycles(self, base_filters: Dict) -> Dict[str, List]:
        """Fetch cycles and their issue connections"""
        cycles = (
            Cycle.objects.filter(**base_filters)
            .values(
                "id",
                "name",
                "start_date",
                "end_date",
                "project_id",
                "created_at",
            )[:100]
        )

        nodes = []
        edges = []
        edge_id = 0

        for cycle in cycles:
            nodes.append({
                "id": str(cycle["id"]),
                "type": "cycle",
                "data": {
                    "label": cycle["name"],
                    "metadata": {
                        "title": cycle["name"],
                        "startDate": cycle["start_date"].isoformat() if cycle["start_date"] else None,
                        "endDate": cycle["end_date"].isoformat() if cycle["end_date"] else None,
                        "projectId": str(cycle["project_id"]),
                        "createdAt": cycle["created_at"].isoformat() if cycle["created_at"] else None,
                    },
                },
                "position": {"x": 0, "y": 0},
            })

        # Fetch cycle-issue relationships
        cycle_ids = [str(cycle["id"]) for cycle in cycles]
        cycle_issues = CycleIssue.objects.filter(
            cycle_id__in=cycle_ids,
            deleted_at__isnull=True,
        ).values("cycle_id", "issue_id")

        for ci in cycle_issues:
            edges.append({
                "id": f"edge-{edge_id}",
                "source": str(ci["cycle_id"]),
                "target": str(ci["issue_id"]),
                "type": "links_to",
            })
            edge_id += 1

        return {"nodes": nodes, "edges": edges}

    def _fetch_modules(self, base_filters: Dict) -> Dict[str, List]:
        """Fetch modules and their issue connections"""
        modules = (
            Module.objects.filter(**base_filters)
            .values(
                "id",
                "name",
                "start_date",
                "target_date",
                "project_id",
                "created_at",
            )[:100]
        )

        nodes = []
        edges = []
        edge_id = 0

        for module in modules:
            nodes.append({
                "id": str(module["id"]),
                "type": "module",
                "data": {
                    "label": module["name"],
                    "metadata": {
                        "title": module["name"],
                        "startDate": module["start_date"].isoformat() if module["start_date"] else None,
                        "targetDate": module["target_date"].isoformat() if module["target_date"] else None,
                        "projectId": str(module["project_id"]),
                        "createdAt": module["created_at"].isoformat() if module["created_at"] else None,
                    },
                },
                "position": {"x": 0, "y": 0},
            })

        # Fetch module-issue relationships
        module_ids = [str(module["id"]) for module in modules]
        module_issues = ModuleIssue.objects.filter(
            module_id__in=module_ids,
            deleted_at__isnull=True,
        ).values("module_id", "issue_id")

        for mi in module_issues:
            edges.append({
                "id": f"edge-{edge_id}",
                "source": str(mi["module_id"]),
                "target": str(mi["issue_id"]),
                "type": "links_to",
            })
            edge_id += 1

        return {"nodes": nodes, "edges": edges}

    def _fetch_pages(self, base_filters: Dict, include_links: bool) -> Dict[str, List]:
        """Fetch pages"""
        pages = (
            Page.objects.filter(**base_filters, archived_at__isnull=True)
            .values(
                "id",
                "name",
                "project_id",
                "created_at",
            )[:100]
        )

        nodes = []
        edges = []

        for page in pages:
            nodes.append({
                "id": str(page["id"]),
                "type": "page",
                "data": {
                    "label": page["name"],
                    "metadata": {
                        "title": page["name"],
                        "projectId": str(page["project_id"]),
                        "createdAt": page["created_at"].isoformat() if page["created_at"] else None,
                    },
                },
                "position": {"x": 0, "y": 0},
            })

        # TODO: Implement page-to-page links if needed
        # This would require parsing page content for internal links

        return {"nodes": nodes, "edges": edges}

    def _fetch_views(self, base_filters: Dict) -> Dict[str, List]:
        """Fetch views"""
        views = (
            IssueView.objects.filter(**base_filters)
            .values(
                "id",
                "name",
                "project_id",
                "created_at",
            )[:100]
        )

        nodes = []

        for view in views:
            nodes.append({
                "id": str(view["id"]),
                "type": "view",
                "data": {
                    "label": view["name"],
                    "metadata": {
                        "title": view["name"],
                        "projectId": str(view["project_id"]),
                        "createdAt": view["created_at"].isoformat() if view["created_at"] else None,
                    },
                },
                "position": {"x": 0, "y": 0},
            })

        return {"nodes": nodes}

    def _map_priority(self, priority: str) -> str:
        """Map Plane priority to graph priority"""
        priority_map = {
            "urgent": "urgent",
            "high": "high",
            "medium": "medium",
            "low": "low",
            "none": "none",
        }
        return priority_map.get(priority, "none")

    def _map_relation_type(self, relation_type: str) -> str:
        """Map Plane relation type to graph edge type"""
        relation_map = {
            "blocked_by": "blocks",
            "duplicate": "depends_on",
            "relates_to": "links_to",
            "start_before": "depends_on",
            "finish_before": "depends_on",
        }
        return relation_map.get(relation_type, "links_to")


class ProjectGraphEndpoint(BaseAPIView):
    """
    API endpoint to retrieve graph data for project-level visualization.
    Similar to WorkspaceGraphEndpoint but scoped to a single project.
    """
    
    permission_classes = [ProjectEntityPermission]
    use_read_replica = True

    def get(self, request, slug, project_id):
        # Reuse workspace endpoint logic but filter by project
        workspace_endpoint = WorkspaceGraphEndpoint()
        workspace_endpoint.request = request
        workspace_endpoint.kwargs = {"slug": slug}
        
        # Override query params to include project filter
        request.GET._mutable = True
        request.GET["project_id"] = project_id
        request.GET["scope"] = "project"
        request.GET._mutable = False
        
        return workspace_endpoint.get(request, slug)


class GraphRelationshipEndpoint(BaseAPIView):
    """
    API endpoint to create new relationships between graph nodes.
    Supports creating issue relations, cycle-issue connections, and module-issue connections.
    
    POST body:
    {
        "source_id": "uuid",
        "source_type": "issue|cycle|module",
        "target_id": "uuid",
        "target_type": "issue|cycle|module",
        "relation_type": "blocks|depends_on|parent_of|links_to"
    }
    """
    
    permission_classes = [ProjectEntityPermission]
    
    def post(self, request, slug, project_id):
        # Parse request data
        source_id = request.data.get("source_id")
        source_type = request.data.get("source_type")
        target_id = request.data.get("target_id")
        target_type = request.data.get("target_type")
        relation_type = request.data.get("relation_type", "depends_on")
        
        # Validate required fields
        if not all([source_id, source_type, target_id, target_type]):
            return Response(
                {"error": "source_id, source_type, target_id, and target_type are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Validate types
        valid_types = ["issue", "cycle", "module", "page", "view"]
        if source_type not in valid_types or target_type not in valid_types:
            return Response(
                {"error": f"Invalid type. Must be one of: {', '.join(valid_types)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            # Handle different relationship types based on source and target
            if source_type == "issue" and target_type == "issue":
                # Create issue-to-issue relation
                return self._create_issue_relation(
                    request, slug, project_id, source_id, target_id, relation_type
                )
            elif source_type == "cycle" and target_type == "issue":
                # Add issue to cycle
                return self._add_issue_to_cycle(
                    request, slug, project_id, source_id, target_id
                )
            elif source_type == "module" and target_type == "issue":
                # Add issue to module
                return self._add_issue_to_module(
                    request, slug, project_id, source_id, target_id
                )
            elif source_type == "issue" and target_type == "cycle":
                # Reverse: Add issue to cycle
                return self._add_issue_to_cycle(
                    request, slug, project_id, target_id, source_id
                )
            elif source_type == "issue" and target_type == "module":
                # Reverse: Add issue to module
                return self._add_issue_to_module(
                    request, slug, project_id, target_id, source_id
                )
            else:
                return Response(
                    {"error": f"Unsupported relationship: {source_type} -> {target_type}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    
    def _create_issue_relation(self, request, slug, project_id, source_id, target_id, relation_type):
        """Create a relation between two issues"""
        from plane.db.models import Project, IssueRelation, Issue
        from plane.utils.issue_relation_mapper import get_actual_relation
        from plane.bgtasks.issue_activities_task import issue_activity
        from plane.utils.host import base_host
        from django.utils import timezone
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        
        # Validate issues exist
        if not Issue.issue_objects.filter(id=source_id, project_id=project_id).exists():
            return Response(
                {"error": f"Source issue {source_id} not found in project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if not Issue.issue_objects.filter(id=target_id, project_id=project_id).exists():
            return Response(
                {"error": f"Target issue {target_id} not found in project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Get project
        project = Project.objects.get(pk=project_id)
        
        # Determine issue positions based on relation type
        if relation_type in ["blocking", "start_after", "finish_after"]:
            issue_id = source_id
            related_issue_id = target_id
        else:
            issue_id = target_id
            related_issue_id = source_id
        
        # Create the relation
        issue_relation, created = IssueRelation.objects.get_or_create(
            issue_id=issue_id,
            related_issue_id=related_issue_id,
            relation_type=get_actual_relation(relation_type),
            defaults={
                "project_id": project_id,
                "workspace_id": project.workspace_id,
                "created_by": request.user,
                "updated_by": request.user,
            }
        )
        
        if created:
            # Log activity
            issue_activity.delay(
                type="issue_relation.activity.created",
                requested_data=json.dumps(request.data, cls=DjangoJSONEncoder),
                actor_id=str(request.user.id),
                issue_id=str(source_id),
                project_id=str(project_id),
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                notification=True,
                origin=base_host(request=request, is_app=True),
            )
            
            return Response(
                {
                    "id": str(issue_relation.id),
                    "source_id": str(source_id),
                    "target_id": str(target_id),
                    "relation_type": relation_type,
                    "created": True,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {
                    "message": "Relationship already exists",
                    "id": str(issue_relation.id),
                },
                status=status.HTTP_200_OK,
            )
    
    def _add_issue_to_cycle(self, request, slug, project_id, cycle_id, issue_id):
        """Add an issue to a cycle"""
        from plane.db.models import Cycle, Issue, CycleIssue
        from plane.bgtasks.issue_activities_task import issue_activity
        from plane.utils.host import base_host
        from django.utils import timezone
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        
        # Validate cycle and issue exist
        if not Cycle.objects.filter(id=cycle_id, project_id=project_id).exists():
            return Response(
                {"error": f"Cycle {cycle_id} not found in project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if not Issue.issue_objects.filter(id=issue_id, project_id=project_id).exists():
            return Response(
                {"error": f"Issue {issue_id} not found in project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Create cycle-issue relationship
        cycle_issue, created = CycleIssue.objects.get_or_create(
            cycle_id=cycle_id,
            issue_id=issue_id,
            defaults={
                "project_id": project_id,
                "workspace_id": Cycle.objects.get(id=cycle_id).workspace_id,
                "created_by": request.user,
                "updated_by": request.user,
            }
        )
        
        if created:
            # Log activity
            issue_activity.delay(
                type="cycle.activity.created",
                requested_data=json.dumps({"cycle_id": str(cycle_id)}, cls=DjangoJSONEncoder),
                actor_id=str(request.user.id),
                issue_id=str(issue_id),
                project_id=str(project_id),
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                notification=True,
                origin=base_host(request=request, is_app=True),
            )
            
            return Response(
                {
                    "id": str(cycle_issue.id),
                    "cycle_id": str(cycle_id),
                    "issue_id": str(issue_id),
                    "created": True,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {
                    "message": "Issue already in cycle",
                    "id": str(cycle_issue.id),
                },
                status=status.HTTP_200_OK,
            )


class GraphLayoutEndpoint(BaseAPIView):
    """
    API endpoint to persist graph layout (node positions).
    Allows saving and retrieving custom node positions for better visualization.
    
    PATCH body:
    {
        "layout": {
            "node-id-1": {"x": 100, "y": 200},
            "node-id-2": {"x": 300, "y": 400},
            ...
        }
    }
    """
    
    permission_classes = [ProjectEntityPermission]
    
    def get(self, request, slug, project_id):
        """Retrieve saved layout for a project"""
        from plane.db.models import Project
        
        try:
            project = Project.objects.get(id=project_id, workspace__slug=slug)
            
            # Get layout from project metadata or a dedicated model
            # For now, using project metadata field (you may need to add this field)
            layout = getattr(project, 'graph_layout', {})
            
            return Response(
                {
                    "project_id": str(project_id),
                    "layout": layout,
                },
                status=status.HTTP_200_OK,
            )
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
    
    def patch(self, request, slug, project_id):
        """Save layout for a project"""
        from plane.db.models import Project
        import json
        
        layout = request.data.get("layout", {})
        
        if not layout:
            return Response(
                {"error": "Layout data is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            project = Project.objects.get(id=project_id, workspace__slug=slug)
            
            # Validate layout structure
            if not isinstance(layout, dict):
                return Response(
                    {"error": "Layout must be an object with node IDs as keys"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Validate each position
            for node_id, position in layout.items():
                if not isinstance(position, dict) or 'x' not in position or 'y' not in position:
                    return Response(
                        {"error": f"Invalid position for node {node_id}. Must have x and y coordinates"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                
                # Ensure coordinates are numbers
                try:
                    float(position['x'])
                    float(position['y'])
                except (TypeError, ValueError):
                    return Response(
                        {"error": f"Invalid coordinates for node {node_id}. x and y must be numbers"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            
            # Save layout to project metadata
            # Note: You may need to add a JSONField 'graph_layout' to the Project model
            # For now, we'll simulate saving it
            project.graph_layout = layout
            project.save(update_fields=['graph_layout'])
            
            return Response(
                {
                    "project_id": str(project_id),
                    "layout": layout,
                    "message": "Layout saved successfully",
                },
                status=status.HTTP_200_OK,
            )
            
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    
    def _add_issue_to_module(self, request, slug, project_id, module_id, issue_id):
        """Add an issue to a module"""
        from plane.db.models import Module, Issue, ModuleIssue
        from plane.bgtasks.issue_activities_task import issue_activity
        from plane.utils.host import base_host
        from django.utils import timezone
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        
        # Validate module and issue exist
        if not Module.objects.filter(id=module_id, project_id=project_id).exists():
            return Response(
                {"error": f"Module {module_id} not found in project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if not Issue.issue_objects.filter(id=issue_id, project_id=project_id).exists():
            return Response(
                {"error": f"Issue {issue_id} not found in project"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Create module-issue relationship
        module_issue, created = ModuleIssue.objects.get_or_create(
            module_id=module_id,
            issue_id=issue_id,
            defaults={
                "project_id": project_id,
                "workspace_id": Module.objects.get(id=module_id).workspace_id,
                "created_by": request.user,
                "updated_by": request.user,
            }
        )
        
        if created:
            # Log activity
            issue_activity.delay(
                type="module.activity.created",
                requested_data=json.dumps({"module_id": str(module_id)}, cls=DjangoJSONEncoder),
                actor_id=str(request.user.id),
                issue_id=str(issue_id),
                project_id=str(project_id),
                current_instance=None,
                epoch=int(timezone.now().timestamp()),
                notification=True,
                origin=base_host(request=request, is_app=True),
            )
            
            return Response(
                {
                    "id": str(module_issue.id),
                    "module_id": str(module_id),
                    "issue_id": str(issue_id),
                    "created": True,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {
                    "message": "Issue already in module",
                    "id": str(module_issue.id),
                },
                status=status.HTTP_200_OK,
            )