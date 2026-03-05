# Evaluation Notes — Naive Bayes

## What to Measure
- **Accuracy**: overall percent correct on the test split.
- **Confusion Matrix**: where the model confuses one label for another.
- **Class Balance**: ensure each label has a reasonable number of samples.

## Practical Checks
1. Run training + evaluation on the sample dataset.
2. Inspect the confusion matrix to see which labels are easy/hard.
3. Add a couple of new samples for any label that’s consistently misclassified.

## Tips
- Keep the dataset small but balanced.
- Small wording tweaks can shift probabilities; that’s a good signal for what the model “knows.”
- If accuracy drops after adding samples, verify tokenization and label consistency first.
