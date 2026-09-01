from rag_answer import ask_rag


def rag_tool(question):
    """
    RAG tool interface for the LangChain Agent.

    Input:
        question: User's question

    Output:
        Dictionary containing:
        - answer
        - sources
    """

    return ask_rag(question)


# ============================================================
# TESTING
# ============================================================

if __name__ == "__main__":

    question = input("Enter question for RAG tool: ")

    try:

        result = rag_tool(question)

        print("\n==============================")
        print("RAG TOOL RESULT")
        print("==============================")

        print("\nAnswer:")
        print(result["answer"])

        print("\nSources:")

        if not result["sources"]:

            print("No relevant sources found.")

        else:

            for i, source in enumerate(result["sources"]):

                print(
                    f"\n[{i}] "
                    f"{source['source']} - "
                    f"Page {source['page']}"
                )

                print(
                    f"Distance: "
                    f"{source['distance']:.2f}"
                )

                print("Evidence:")

                print(source["evidence"])

    except Exception as error:

        print("\nRAG Tool Error:")
        print(error)