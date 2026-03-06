# Naive Bayes: Tiny Text Classifier

Naive Bayes models assume token independence. For each class, it estimates a probability for each token, then combines those probabilities to choose the most likely class.

## Why Laplace Smoothing?
Without smoothing, any unseen word would zero-out a class. Laplace smoothing adds a small constant to every token count, making the model more stable on small datasets.

## Metrics
We use accuracy and a confusion matrix. The confusion matrix shows how often each actual label is predicted as each class.
