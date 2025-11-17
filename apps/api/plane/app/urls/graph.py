from django.urls import path

from plane.app.views import (
    WorkspaceGraphEndpoint,
    ProjectGraphEndpoint,
    GraphRelationshipEndpoint,
    GraphLayoutEndpoint,
)

urlpatterns = [
    # Workspace-level graph endpoint
    path(
        "workspaces/<str:slug>/graph/",
        WorkspaceGraphEndpoint.as_view(),
        name="workspace-graph",
    ),
    # Project-level graph endpoint
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/graph/",
        ProjectGraphEndpoint.as_view(),
        name="project-graph",
    ),
    # Create relationship endpoint
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/graph/relationships/",
        GraphRelationshipEndpoint.as_view(),
        name="graph-relationships",
    ),
    # Layout persistence endpoint
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/graph/layout/",
        GraphLayoutEndpoint.as_view(),
        name="graph-layout",
    ),
]