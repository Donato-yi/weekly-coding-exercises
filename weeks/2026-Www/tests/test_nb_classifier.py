import unittest

from src.nb_classifier import NaiveBayesClassifier
from src.tokenize import tokenize


class TestTokenizer(unittest.TestCase):
    def test_tokenize_basic(self):
        self.assertEqual(tokenize("Hello, World!"), ["hello", "world"])
        self.assertEqual(tokenize("AI-driven"), ["ai", "driven"])


class TestNaiveBayes(unittest.TestCase):
    def test_fit_predict(self):
        samples = [
            ("tech", "build tools and compilers"),
            ("sports", "team won the match"),
            ("health", "sleep improves recovery"),
        ]
        clf = NaiveBayesClassifier(alpha=1.0)
        clf.fit(samples)
        self.assertEqual(clf.predict("compiler optimizations"), "tech")

    def test_probabilities_sum_to_one(self):
        samples = [
            ("tech", "servers and databases"),
            ("sports", "basketball season"),
        ]
        clf = NaiveBayesClassifier(alpha=1.0)
        clf.fit(samples)
        probs = clf.predict_proba("database server")
        self.assertAlmostEqual(sum(probs.values()), 1.0, places=6)


if __name__ == "__main__":
    unittest.main()
