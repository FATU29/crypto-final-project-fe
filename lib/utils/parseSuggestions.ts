/**
 * Parse [SUGGESTIONS] section from AI response
 * @param content - AI response content
 * @returns Object with main content and extracted suggestions
 */
export function parseSuggestions(content: string): {
  mainContent: string;
  suggestions: string[];
} {
  // Match [SUGGESTIONS] section at the end of response
  const suggestionsRegex = /\[SUGGESTIONS\]\s*((?:[-•]\s*.+?\n?)+)/i;
  const match = content.match(suggestionsRegex);

  if (!match) {
    return {
      mainContent: content,
      suggestions: [],
    };
  }

  // Extract main content (everything before [SUGGESTIONS])
  const mainContent = content.substring(0, match.index).trim();

  // Extract and clean suggestions
  const suggestionsText = match[1];
  const suggestions = suggestionsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((line) => line.length > 0);

  return {
    mainContent,
    suggestions,
  };
}
