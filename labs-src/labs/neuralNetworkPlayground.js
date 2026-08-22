export const ACTIVATION_LABELS = {
  step: "Step",
  sigmoid: "Sigmoid",
  relu: "ReLU"
};

export const NEURON_EXAMPLE = {
  input1: 1,
  input2: 0,
  weight1: 1,
  weight2: 1,
  bias: -0.5,
  activation: "step"
};

const NUMBER_FIELDS = ["input1", "input2", "weight1", "weight2", "bias"];

export function validateNeuronInput(input = {}) {
  const errors = {};
  for (const field of NUMBER_FIELDS) {
    if (input[field] === "" || input[field] === null || input[field] === undefined || !Number.isFinite(Number(input[field]))) {
      errors[field] = "Enter a finite number.";
    }
  }
  if (!Object.hasOwn(ACTIVATION_LABELS, input.activation)) errors.activation = "Choose an activation function.";
  return errors;
}

export function applyActivation(value, activation) {
  if (activation === "step") return value >= 0 ? 1 : 0;
  if (activation === "sigmoid") {
    const safeValue = Math.max(-500, Math.min(500, value));
    return 1 / (1 + Math.exp(-safeValue));
  }
  if (activation === "relu") return Math.max(0, value);
  throw new RangeError(`Unsupported activation: ${activation}`);
}

export function runNeuron(input) {
  const errors = validateNeuronInput(input);
  if (Object.keys(errors).length) return { errors, output: null, weightedSum: null, contributions: [] };

  const values = Object.fromEntries(NUMBER_FIELDS.map((field) => [field, Number(input[field])]));
  const contribution1 = values.input1 * values.weight1;
  const contribution2 = values.input2 * values.weight2;
  const weightedSum = contribution1 + contribution2 + values.bias;
  const output = applyActivation(weightedSum, input.activation);

  return {
    errors: {},
    output,
    weightedSum,
    contributions: [
      { label: "Input 1 × weight 1", value: contribution1 },
      { label: "Input 2 × weight 2", value: contribution2 },
      { label: "Bias", value: values.bias }
    ],
    equation: `(${values.input1} × ${values.weight1}) + (${values.input2} × ${values.weight2}) + ${values.bias} = ${weightedSum}`,
    explanation: `${ACTIVATION_LABELS[input.activation]} converts the weighted sum ${weightedSum.toFixed(4)} into ${output.toFixed(4)}.`
  };
}

export function predictBinaryGrid(model) {
  return [[0, 0], [0, 1], [1, 0], [1, 1]].map(([input1, input2]) => {
    const result = runNeuron({ ...model, input1, input2 });
    return { input1, input2, output: result.output };
  });
}
