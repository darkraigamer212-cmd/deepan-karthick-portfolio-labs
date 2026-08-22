# Lab 04 - CNN Feature Explorer

## Certificate connection

Convolutional Neural Networks: exposes how small kernels transform local pixel neighbourhoods into feature maps.

## Workflow

The user edits a 5 × 5 grayscale grid or loads a preset, selects an edge, sharpen, or blur kernel, and sees the numeric and normalized 3 × 3 convolution output.

## Implementation

`cnnConvolution.js` owns grid validation, kernels, valid convolution, and output normalization. `CnnFeatureExplorer.jsx` provides the editable pixels and visual feature map.

## Tests

Tests cover edge convolution, blur division, grid/kernel validation, normal ranges, and flat-output normalization.

## Limitations

The lab performs a single stride-1 valid convolution without padding. It is not a trained CNN and does not classify uploaded images.
