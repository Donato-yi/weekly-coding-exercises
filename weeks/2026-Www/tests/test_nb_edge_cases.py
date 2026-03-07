import unittest

from src.naive_bayes import NaiveBayesClassifier


class TestNaiveBayesEdgeCases(unittest.TestCase):
    def test_fit_empty_raises(self):
        model = NaiveBayesClassifier()
        with self.assertRaises(ValueError):
            model.fit([], [])

    def test_fit_length_mismatch_raises(self):
        model = NaiveBayesClassifier()
        with self.assertRaises(ValueError):
            model.fit(["one"], ["a", "b"])

    def test_empty_text_uses_priors(self):
        texts = ["good support", "bad bugs", "bad crash", "bad latency"]
        labels = ["positive", "negative", "negative", "negative"]
        model = NaiveBayesClassifier()
        model.fit(texts, labels)
        self.assertEqual(model.predict(""), "negative")
        probs = model.predict_proba("")
        self.assertAlmostEqual(sum(probs.values()), 1.0, places=6)


if __name__ == "__main__":
    unittest.main()
