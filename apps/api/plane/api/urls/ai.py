from django.urls import path
from plane.api.views.ai import GenerateAIView

urlpatterns = [
    path("ai/generate/", GenerateAIView.as_view(), name="ai-generate"),
]
