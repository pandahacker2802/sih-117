import chromadb
import requests
from pypdf import PdfReader

PDF_PATH = "documents/Sample.pdf.pdf"

OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBEDDING_MODEL = "nomic-embed-text"


# ---------- PDF TEXT EXTRACTION ----------

reader = PdfReader(PDF_PATH)

chunks = []

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

for page_number, page in enumerate(reader.pages, start=1):

    text = page.extract_text()

    if not text:
        continue

    text = text.strip()

    start = 0

    while start < len(text):

        end = start + CHUNK_SIZE

        chunk = text[start:end].strip()

        if chunk:
            chunks.append({
                "text": chunk,
                "page": page_number
            })

        start += CHUNK_SIZE - CHUNK_OVERLAP


# ---------- OLLAMA EMBEDDING ----------

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


# ---------- CHROMADB ----------

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="industrial_documents"
)


# ---------- STORE CHUNKS ----------

ids = []
documents = []
embeddings = []
metadatas = []

for i, chunk in enumerate(chunks):

    print(f"Embedding chunk {i + 1}/{len(chunks)}...")

    embedding = create_embedding(chunk["text"])

    ids.append(f"chunk_{i}")
    documents.append(chunk["text"])
    embeddings.append(embedding)

    metadatas.append({
        "source": "Sample.pdf.pdf",
        "page": chunk["page"]
    })


collection.add(
    ids=ids,
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas
)


print("\nRAG ingestion completed!")
print("Total chunks stored:", len(chunks))