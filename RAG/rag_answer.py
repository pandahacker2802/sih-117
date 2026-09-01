import os
import chromadb
import requests


# ============================================================
# OLLAMA SETTINGS
# ============================================================

OLLAMA_URL = "http://localhost:11434/api"

EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "gemma3:4b"

# Lower distance = more relevant
RELEVANCE_THRESHOLD = 300

COLLECTION_NAME = "industrial_documents"
CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")

NO_ANSWER = (
    "I could not find this information in the provided documents."
)


# ============================================================
# CHROMADB
# ============================================================

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)


# ============================================================
# CREATE EMBEDDING
# ============================================================

def create_embedding(text):

    response = requests.post(
        f"{OLLAMA_URL}/embeddings",
        json={
            "model": EMBEDDING_MODEL,
            "prompt": text
        },
        timeout=120
    )

    response.raise_for_status()

    return response.json()["embedding"]


# ============================================================
# ASK GEMMA
# ============================================================

def ask_gemma(question, context):

    prompt = f"""
You are a local enterprise knowledge assistant.

Answer the user's question using ONLY the information
provided in the context below.

If the answer is not present in the context, say:
"{NO_ANSWER}"

Do not use outside knowledge.
Do not invent facts.
Do not make assumptions.

Context:
{context}

User Question:
{question}

Answer:
"""

    response = requests.post(
        f"{OLLAMA_URL}/generate",
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )

    response.raise_for_status()

    return response.json()["response"].strip()


# ============================================================
# RAG FUNCTION
# ============================================================

def ask_rag(question):

    question = question.strip()

    if not question:
        return {
            "answer": "Please enter a question.",
            "sources": []
        }

    # --------------------------------------------------------
    # Question → embedding
    # --------------------------------------------------------

    query_embedding = create_embedding(question)

    # --------------------------------------------------------
    # Search ChromaDB
    # --------------------------------------------------------

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3,
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    # --------------------------------------------------------
    # Relevance filter
    # --------------------------------------------------------

    filtered_documents = []
    filtered_metadatas = []
    filtered_distances = []

    if results["distances"] and results["distances"][0]:

        for i, distance in enumerate(results["distances"][0]):

            if distance <= RELEVANCE_THRESHOLD:

                filtered_documents.append(
                    results["documents"][0][i]
                )

                filtered_metadatas.append(
                    results["metadatas"][0][i]
                )

                filtered_distances.append(
                    distance
                )

    # --------------------------------------------------------
    # No relevant information
    # --------------------------------------------------------

    if not filtered_documents:

        return {
            "answer": NO_ANSWER,
            "sources": []
        }

    # --------------------------------------------------------
    # Prepare context
    # --------------------------------------------------------

    context_parts = []

    for i, document in enumerate(filtered_documents):

        page = filtered_metadatas[i]["page"]
        source = filtered_metadatas[i]["source"]

        context_parts.append(
            f"Source: {source}\n"
            f"Page: {page}\n"
            f"Content:\n{document}"
        )

    context = "\n\n".join(context_parts)

    # --------------------------------------------------------
    # Generate answer
    # --------------------------------------------------------

    answer = ask_gemma(
        question,
        context
    )

    # --------------------------------------------------------
    # Prepare sources
    # --------------------------------------------------------

    sources = []

    for i, metadata in enumerate(filtered_metadatas):

        sources.append({
            "source": metadata["source"],
            "page": metadata["page"],
            "distance": filtered_distances[i],
            "evidence": filtered_documents[i][:500]
        })

    return {
        "answer": answer,
        "sources": sources
    }


# ============================================================
# COMMAND-LINE TESTING
# ============================================================

if __name__ == "__main__":

    question = input("Ask your question: ")

    try:

        result = ask_rag(question)

        print("\n==============================")
        print("RAG ANSWER")
        print("==============================")

        print(result["answer"])

        print("\n==============================")
        print("SOURCES & EVIDENCE")
        print("==============================")

        if not result["sources"]:

            print("No sufficiently relevant sources found.")

        else:

            for i, source in enumerate(result["sources"]):

                print(
                    f"\n[{i}] "
                    f"{source['source']} - "
                    f"Page {source['page']}"
                )

                print(
                    f"Distance: {source['distance']:.2f}"
                )

                print("Evidence:")

                print(source["evidence"])

    except requests.exceptions.ConnectionError:

        print("\nError: Ollama is not running or is unreachable.")

    except requests.exceptions.HTTPError as error:

        print(f"\nOllama HTTP error: {error}")

    except Exception as error:

        print(f"\nRAG error: {error}")