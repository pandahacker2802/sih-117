import os
import uuid

import chromadb
import pytesseract
from PIL import Image
import requests


# -----------------------------
# Settings
# -----------------------------

OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBEDDING_MODEL = "nomic-embed-text"

IMAGE_PATH = "documents/test_page.png"

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "industrial_documents"


# -----------------------------
# Tesseract
# -----------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# -----------------------------
# OCR
# -----------------------------

print("Running OCR...")

text = pytesseract.image_to_string(
    Image.open(IMAGE_PATH)
)

text = text.strip()

if not text:
    raise ValueError("OCR could not extract any text.")


print("OCR successful.")


# -----------------------------
# Chunking
# -----------------------------

chunk_size = 800
overlap = 100

chunks = []

start = 0

while start < len(text):

    end = start + chunk_size

    chunk = text[start:end].strip()

    if chunk:
        chunks.append(chunk)

    start += chunk_size - overlap


print(f"Created {len(chunks)} chunks.")


# -----------------------------
# Create embeddings
# -----------------------------

def create_embedding(chunk):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": EMBEDDING_MODEL,
            "prompt": chunk
        }
    )

    response.raise_for_status()

    return response.json()["embedding"]


# -----------------------------
# Connect to ChromaDB
# -----------------------------

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)


# -----------------------------
# Store chunks
# -----------------------------

documents = []
embeddings = []
metadatas = []
ids = []


for i, chunk in enumerate(chunks):

    print(f"Embedding chunk {i + 1}/{len(chunks)}...")

    embedding = create_embedding(chunk)

    documents.append(chunk)
    embeddings.append(embedding)

    metadatas.append({
        "source": os.path.basename(IMAGE_PATH),
        "page": 1,
        "type": "ocr"
    })

    ids.append(
        f"ocr_{uuid.uuid4().hex}"
    )


collection.add(
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas,
    ids=ids
)


print("\nOCR document successfully added to ChromaDB.")
print(f"Source: {os.path.basename(IMAGE_PATH)}")
print(f"Chunks added: {len(chunks)}")