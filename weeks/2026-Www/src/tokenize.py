import re
from typing import List

WORD_RE = re.compile(r"[a-z0-9']+")


def tokenize(text: str) -> List[str]:
    """Lowercase, keep simple word tokens, and drop empty results."""
    text = text.lower()
    return WORD_RE.findall(text)
