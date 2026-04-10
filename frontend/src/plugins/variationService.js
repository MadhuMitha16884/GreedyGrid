export function applyVariation(baseConfig) {
  // A mock variation service that manipulates difficulty or layout based on some AI setup
  const variation = { ...baseConfig };
  
  const isVariationActive = Math.random() > 0.5;
  if(isVariationActive) {
      if(!variation.aiModifiers) variation.aiModifiers = [];
      variation.aiModifiers.push("Randomized Twist");
  }

  return variation;
}
