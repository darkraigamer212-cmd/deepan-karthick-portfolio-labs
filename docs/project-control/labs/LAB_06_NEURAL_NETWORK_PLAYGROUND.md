# Lab 06 - Neural Network Playground

## Certificate connection

Neural Networks and Deep Learning: exposes the weighted sum, bias, and activation calculation performed by one neuron.

## Workflow

The user enters two inputs, two weights, a bias, and an activation. The lab displays each weighted contribution, the equation, the activated output, and four binary sample predictions.

## Implementation and tests

`neuralNetworkPlayground.js` owns validation, activations, the neuron calculation, and sample prediction. `NeuralNetworkPlayground.jsx` renders the controls and result. Tests cover the three activations, the weighted example, an OR-gate vector, and invalid numeric input.

## Limitations

The lab does not train weights or represent a multilayer network. It is deterministic arithmetic with no AI service or API.
