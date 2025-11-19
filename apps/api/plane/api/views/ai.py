from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from plane.utils.ai import BedrockService

class GenerateAIView(APIView):
    def post(self, request):
        prompt = request.data.get('prompt')
        context = request.data.get('context', '')
        
        if not prompt:
            return Response({"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST)

        service = BedrockService()
        generated_text = service.generate_text(prompt, context)

        if generated_text:
            return Response({"response": generated_text}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Failed to generate text"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
