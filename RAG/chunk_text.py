from pypdf import PdfReader

PDF_PATH = "documents/Sample.pdf.pdf"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def extract_pages(pdf_path):
    reader = PdfReader(pdf_path)

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text and text.strip():
            pages.append({
                "page": page_number,
                "text": text.strip()
            })

    return pages


def create_chunks(pages):
    chunks = []

    for page in pages:
        text = page["text"]
        start = 0

        while start < len(text):
            end = start + CHUNK_SIZE
            chunk = text[start:end].strip()

            if chunk:
                chunks.append({
                    "text": chunk,
                    "page": page["page"]
                })

            start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


pages = extract_pages(PDF_PATH)
chunks = create_chunks(pages)

print(f"Pages extracted: {len(pages)}")
print(f"Chunks created: {len(chunks)}")

for i, chunk in enumerate(chunks[:3]):
    print(f"\n--- Chunk {i + 1} | Page {chunk['page']} ---")
    print(chunk["text"])