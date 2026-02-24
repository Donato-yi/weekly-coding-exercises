from src.index import DocumentIndex


def test_search_ranking():
    idx = DocumentIndex()
    idx.add("doc1", "vector search uses cosine similarity")
    idx.add("doc2", "python typing and dataclasses")
    idx.add("doc3", "cosine distance and vector embeddings")

    results = idx.search("vector cosine", top_k=2)
    assert results[0][0] in {"doc1", "doc3"}
    assert results[1][0] in {"doc1", "doc3"}
