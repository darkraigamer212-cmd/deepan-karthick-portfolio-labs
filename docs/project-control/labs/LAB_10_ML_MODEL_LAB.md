# Lab 10 - ML Model Lab

## Certificate connection

Machine Learning Specialization: demonstrates dataset validation, feature scaling, distance-based classification, prediction evidence, and model evaluation.

## Workflow

The user supplies comma-separated rows with two numeric features and a label, chooses k, and enters a query point. The model standardizes features, ranks Euclidean neighbours, resolves vote ties deterministically, predicts a label, and calculates leave-one-out accuracy and a confusion summary.

## Implementation and tests

`ml-model-lab.js` contains bounded parsing, statistics, standardization, KNN classification, voting, tie-breaking, and leave-one-out evaluation. `MlModelLab.jsx` renders the dataset, prediction evidence, and evaluation. Tests cover parsing, errors, scaling, neighbours, ties, accuracy, confusion counts, and k limits.

## Limitations

The parser supports two numeric features and simple comma-separated cells only. KNN and leave-one-out results are educational and must not be treated as production model validation.
