from pypdf import PdfReader

pdf_path = "documents/Sample.pdf.pdf"

reader = PdfReader(pdf_path)

for page_number, page in enumerate(reader.pages, start=1):
    text = page.extract_text()

    print(f"\n--- Page {page_number} ---")
    print(text)