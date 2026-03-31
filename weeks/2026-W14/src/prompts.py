SYSTEM_PROMPT = """You are a helpful FAQ router. Use provided citations only.
If the question is out of scope, say so and request clarification.
Always include citations in the final answer.
"""

USER_TEMPLATE = """Question: {question}
Relevant snippets:
{snippets}

Return a concise answer with citations.
"""


def format_prompt(question: str, snippets: str) -> str:
    return USER_TEMPLATE.format(question=question, snippets=snippets)
