import unittest

from src.naive_bayes import NaiveBayesClassifier, tokenize
from src.dataset import SAMPLES


class TestNaiveBayes(unittest.TestCase):
    def setUp(self):
        texts = [text for text, _ in SAMPLES]
        labels = [label for _, label in SAMPLES]
        self.model = NaiveBayesClassifier(alpha=1.0)
        self.model.fit(texts, labels)

    def test_tokenize(self):
        self.assertEqual(tokenize("Hello, WORLD!"), ["hello", "world"])

    def test_predict(self):
        pred = self.model.predict("great support and reliable")
        self.assertEqual(pred, "positive")

    def test_probabilities_normalize(self):
        probs = self.model.predict_proba("slow crashes and bugs")
        self.assertAlmostEqual(sum(probs.values()), 1.0, places=6)

    def test_confusion_matrix(self):
        texts = [text for text, _ in SAMPLES]
        labels = [label for _, label in SAMPLES]
        accuracy, confusion = self.model.evaluate(texts, labels)
        self.assertGreaterEqual(accuracy, 0.7)
        self.assertIn("positive", confusion)
        self.assertIn("negative", confusion)


if __name__ == "__main__":
    unittest.main()
