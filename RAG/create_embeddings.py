import json
import requests

OLLAMA_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"


def create_embedding(text):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": text
        }
    )

    response.raise_for_status()

    return response.json()["embedding"]
test_text = "This is a test document about economics."

embedding = create_embedding(test_text)

print("Embedding created successfully!")
print("Embedding size:", len(embedding))
print("First 5 values:", embedding[:5])