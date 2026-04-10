import { applyVariation } from "./variationService";

export function getNewGameConfig(baseConfig) {
  // Mock AI Generator that takes a config and creates a new variation each time.
  // In a real scenario, this would contact an LLM or use procedural generation algorithms.
  
  const modifiedConfig = applyVariation(baseConfig);
  
  if (modifiedConfig.game === "sudoku") {
    // Modify starting board slightly
    modifiedConfig.aiTip = "The board was shifted by the AI!";
  } else if (modifiedConfig.game === "puzzle") {
    modifiedConfig.aiTip = "The AI altered the shuffle!";
  } else if (modifiedConfig.game === "2048") {
    modifiedConfig.aiTip = "The AI generated custom starting tiles!";
  } else if (modifiedConfig.game === "wordsearch") {
    modifiedConfig.aiTip = "The AI dynamically hid a bonus term!";
  }

  return modifiedConfig;
}
