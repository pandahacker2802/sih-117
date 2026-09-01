import os
import chromadb
import requests

OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBEDDING_MODEL = "nomic-embed-text"


def create_embedding(text):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": EMBEDDING_MODEL,
            "prompt": text
        }
    )

    response.raise_for_status()

    return response.json()["embedding"]


# Connect to local ChromaDB
CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_or_create_collection(
    name="industrial_documents"
)


# Ask user a question
query = input("Ask your question: ")

# Convert question into embedding
query_embedding = create_embedding(query)

# Search ChromaDB
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3
)


print("\n===== SEARCH RESULTS =====")

for i, document in enumerate(results["documents"][0]):

    page = results["metadatas"][0][i]["page"]
    source = results["metadatas"][0][i]["source"]

    print(f"\n--- Result {i + 1} ---")
    print(f"Source: {source}")
    print(f"Page: {page}")
    print("Content:")
    print(document)