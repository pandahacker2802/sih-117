import chromadb
import requests

OLLAMA_URL = "http://localhost:11434/api"
EMBEDDING_MODEL = "nomic-embed-text"

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_collection(
    name="industrial_documents"
)


def create_embedding(text):
    response = requests.post(
        f"{OLLAMA_URL}/embeddings",
        json={
            "model": EMBEDDING_MODEL,
            "prompt": text
        }
    )

    response.raise_for_status()

    return response.json()["embedding"]


question = input("Enter test question: ")

query_embedding = create_embedding(question)

results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3,
    include=["documents", "metadatas", "distances"]
)


print("\n==============================")
print("RETRIEVAL SCORES")
print("==============================")

for i in range(len(results["documents"][0])):

    print(f"\n[{i}]")
    print("Source:", results["metadatas"][0][i]["source"])
    print("Page:", results["metadatas"][0][i]["page"])
    print("Distance:", results["distances"][0][i])
    print("Evidence:")
    print(results["documents"][0][i][:300])