import os
import uuid
import requests
import chromadb
import pytesseract
import pymupdf

from PIL import Image


# ============================================================
# SETTINGS
# ============================================================

DOCUMENTS_FOLDER = "documents"

CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
COLLECTION_NAME = "industrial_documents"

OLLAMA_URL = "http://localhost:11434/api"
EMBEDDING_MODEL = "nomic-embed-text"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


# ============================================================
# TESSERACT
# ============================================================

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ============================================================
# CHUNKING
# ============================================================

def create_chunks(text):

    chunks = []

    start = 0

    while start < len(text):

        end = start + CHUNK_SIZE

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


# ============================================================
# EMBEDDING
# ============================================================

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


# ============================================================
# NORMAL PDF TEXT EXTRACTION
# ============================================================

def extract_pdf_pages(pdf_path):
    try:
        document = pymupdf.open(pdf_path)
        pages = []
        for page_number, page in enumerate(document, start=1):
            text = page.get_text().strip()
            if text:
                pages.append({
                    "page": page_number,
                    "text": text,
                    "type": "pdf"
                })
        document.close()
        return pages
    except Exception as error:
        print(f"Error reading PDF text: {error}")
        return []


# ============================================================
# SCANNED PDF OCR
# ============================================================

def extract_scanned_pdf_pages(pdf_path):
    try:
        document = pymupdf.open(pdf_path)
        pages = []
        for page_number, page in enumerate(document, start=1):
            pixmap = page.get_pixmap(
                matrix=pymupdf.Matrix(1.5, 1.5)
            )
            image = Image.frombytes(
                "RGB",
                [pixmap.width, pixmap.height],
                pixmap.samples
            )
            text = pytesseract.image_to_string(
                image
            ).strip()
            if text:
                pages.append({
                    "page": page_number,
                    "text": text,
                    "type": "ocr"
                })
        document.close()
        return pages
    except Exception as error:
        print(f"Error reading scanned PDF: {error}")
        return []


# ============================================================
# IMAGE OCR
# ============================================================

def extract_image(image_path):
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(
            image
        ).strip()
        if not text:
            return []
        return [{
            "page": 1,
            "text": text,
            "type": "ocr"
        }]
    except Exception as error:
        print(f"Error OCR reading image: {error}")
        return []


# ============================================================
# DOCUMENT PROCESSING
# ============================================================

def process_file(file_path):

    filename = os.path.basename(file_path)

    extension = os.path.splitext(
        filename
    )[1].lower()

    print("\n================================")
    print(f"Processing: {filename}")
    print("================================")

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if extension == ".pdf":

        pages = extract_pdf_pages(
            file_path
        )

        if pages:

            print("Text PDF detected.")

        else:

            print(
                "No text detected or failed to parse PDF structure. "
                "Attempting OCR..."
            )

            pages = extract_scanned_pdf_pages(
                file_path
            )

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    elif extension in [
        ".png",
        ".jpg",
        ".jpeg",
        ".bmp",
        ".tiff"
    ]:

        print(
            "Image detected. "
            "Running OCR..."
        )

        pages = extract_image(
            file_path
        )

    # --------------------------------------------------------
    # PLAIN TEXT / MARKDOWN / CSV
    # --------------------------------------------------------

    elif extension in [
        ".txt",
        ".md",
        ".csv",
        ".json",
        ".log"
    ]:

        print(
            "Plain text file detected."
        )

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read().strip()

            if text:
                pages = [{
                    "page": 1,
                    "text": text,
                    "type": "text"
                }]
            else:
                pages = []
        except Exception as error:
            print(f"Error reading text file: {error}")
            pages = []

    # --------------------------------------------------------
    # UNSUPPORTED
    # --------------------------------------------------------

    else:

        print(
            f"Skipping unsupported file: "
            f"{filename}"
        )

        return []

    return pages


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
# DUPLICATE CHECK
# ============================================================

def document_already_ingested(filename):

    results = collection.get(
        where={
            "source": filename
        },
        limit=1
    )

    return len(results["ids"]) > 0


# ============================================================
# INGEST ONE FILE
# ============================================================

def ingest_file(file_path):

    filename = os.path.basename(
        file_path
    )

    # --------------------------------------------------------
    # Duplicate protection
    # --------------------------------------------------------

    if document_already_ingested(
        filename
    ):

        print(
            f"\nSkipping already ingested "
            f"document: {filename}"
        )

        return 0


    # --------------------------------------------------------
    # Extract text / OCR
    # --------------------------------------------------------

    pages = process_file(
        file_path
    )

    if not pages:

        print(
            f"No text extracted from "
            f"{filename}"
        )

        return 0


    print(
        f"Pages with text: "
        f"{len(pages)}"
    )


    total_chunks = 0


    # --------------------------------------------------------
    # Process pages
    # --------------------------------------------------------

    for page_data in pages:

        page_number = page_data[
            "page"
        ]

        page_text = page_data[
            "text"
        ]

        document_type = page_data[
            "type"
        ]


        chunks = create_chunks(
            page_text
        )


        print(
            f"Page {page_number}: "
            f"{len(chunks)} chunk(s)"
        )


        # ----------------------------------------------------
        # Create embeddings + store
        # ----------------------------------------------------

        for chunk_index, chunk in enumerate(
            chunks
        ):

            print(
                f"Embedding "
                f"{filename} "
                f"page {page_number} "
                f"chunk {chunk_index + 1}"
            )


            embedding = create_embedding(
                chunk
            )


            collection.add(
                ids=[
                    f"{uuid.uuid4().hex}"
                ],
                documents=[
                    chunk
                ],
                embeddings=[
                    embedding
                ],
                metadatas=[{
                    "source": filename,
                    "page": page_number,
                    "type": document_type
                }]
            )


            total_chunks += 1


    print(
        f"\nSuccessfully ingested: "
        f"{filename}"
    )

    print(
        f"Chunks added: "
        f"{total_chunks}"
    )

    return total_chunks


# ============================================================
# CURRENT FOLDER-BASED TESTING
# ============================================================

def ingest_documents_folder():

    if not os.path.exists(
        DOCUMENTS_FOLDER
    ):

        print(
            "Documents folder not found."
        )

        return


    files = []

    for filename in os.listdir(
        DOCUMENTS_FOLDER
    ):

        file_path = os.path.join(
            DOCUMENTS_FOLDER,
            filename
        )

        if os.path.isfile(
            file_path
        ):

            files.append(
                file_path
            )


    if not files:

        print(
            "No documents found."
        )

        return


    print(
        f"\nFound {len(files)} file(s)."
    )


    for file_path in files:

        ingest_file(
            file_path
        )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    ingest_documents_folder()

    print(
        "\n================================"
    )

    print(
        "INGESTION COMPLETE"
    )

    print(
        "================================"
    )

    print(
        "Total chunks in collection:",
        collection.count()
    )