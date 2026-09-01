import sys
import json
import contextlib
from rag_tool import rag_tool
from ingest import ingest_file


def main():
    raw_input = sys.stdin.read().strip()

    if not raw_input:
        print(json.dumps({
            "success": False,
            "error": "Input is empty"
        }))
        return

    try:
        request = json.loads(raw_input)

        question = request.get("question", "").strip()
        files = request.get("files", [])

        if not question:
            print(json.dumps({
                "success": False,
                "error": "Question is empty"
            }))
            return

        # Ingest newly uploaded files before querying RAG
        for file_path in files:
            if file_path:
                with contextlib.redirect_stdout(sys.stderr):
                    ingest_file(file_path)
                

        result = rag_tool(question)

        print(json.dumps({
            "success": True,
            "result": result
        }, ensure_ascii=False))

    except Exception as error:
        print(json.dumps({
            "success": False,
            "error": str(error)
        }))


if __name__ == "__main__":
    main()