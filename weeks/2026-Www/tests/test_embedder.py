from src.embedder import HashingVectorizer, cosine, tokenize


def test_tokenize_basic():
    assert tokenize("Hello, World! 123") == ["hello", "world", "123"]


def test_vectorize_deterministic():
    vec = HashingVectorizer(dim=64)
    a = vec.vectorize("hello world")
    b = vec.vectorize("hello world")
    assert a == b


def test_cosine_identity():
    vec = HashingVectorizer(dim=64)
    v = vec.vectorize("same text")
    assert cosine(v, v) == 1.0
