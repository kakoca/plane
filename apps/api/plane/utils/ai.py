import boto3
import json
import os
from django.conf import settings

class BedrockService:
    def __init__(self):
        self.client = boto3.client(
            'bedrock-runtime',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.model_id = os.getenv('BEDROCK_MODEL_ID', 'anthropic.claude-v2')

    def generate_text(self, prompt, context=""):
        try:
            # Construct the prompt for Claude (assuming Claude model for now)
            # Adjust format based on the specific model being used
            full_prompt = f"\n\nHuman: {context}\n{prompt}\n\nAssistant:"
            
            body = json.dumps({
                "prompt": full_prompt,
                "max_tokens_to_sample": 2048,
                "temperature": 0.7,
                "top_p": 0.9,
            })

            response = self.client.invoke_model(
                body=body,
                modelId=self.model_id,
                accept='application/json',
                contentType='application/json'
            )

            response_body = json.loads(response.get('body').read())
            return response_body.get('completion')
        except Exception as e:
            print(f"Error generating text with Bedrock: {e}")
            return None
