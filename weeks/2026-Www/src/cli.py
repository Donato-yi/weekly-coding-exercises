from __future__ import annotations

import argparse
from pathlib import Path

from .index import DocumentIndex


def load_docs(folder: Path) -> DocumentIndex:
    idx = DocumentIndex()
    for path in sorted(folder.glob("*.txt")):
        idx.add(path.stem, path.read_text(encoding="utf-8"))
    return idx


def main() -> None:
    parser = argparse.ArgumentParser(description="Mini local search (hashing vectorizer)")
    parser.add_argument("--query", required=True, help="Search query")
    parser.add_argument("--docs", required=True, help="Folder of .txt docs")
    parser.add_argument("--top", type=int, default=5, help="Top results")
    args = parser.parse_args()

    folder = Path(args.docs)
    idx = load_docs(folder)
    results = idx.search(args.query, top_k=args.top)

    if not results:
        print("No results")
        return

    print(f"Query: {args.query}\n")
    for doc_id, score in results:
        print(f"- {doc_id}: {score:.3f}")


if __name__ == "__main__":
    main()
