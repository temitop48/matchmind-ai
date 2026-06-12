import type { RawNewsItem } from "../types/newsSource";
import type { NewsSignal } from "../types/news";

function detectCategory(text: string): NewsSignal["category"] {
  const lower = text.toLowerCase();

  if (lower.includes("injury") || lower.includes("injured")) return "injury";
  if (lower.includes("doubt") || lower.includes("available")) return "availability";
  if (lower.includes("suspended") || lower.includes("ban")) return "suspension";
  if (lower.includes("form") || lower.includes("winning") || lower.includes("defeat")) return "form";
  if (lower.includes("formation") || lower.includes("tactical")) return "tactical";

  return "other";
}

function detectImpact(text: string): NewsSignal["impact"] {
  const lower = text.toLowerCase();

  if (
    lower.includes("ruled out") ||
    lower.includes("major injury") ||
    lower.includes("suspended") ||
    lower.includes("captain")
  ) {
    return "High";
  }

  if (
    lower.includes("doubt") ||
    lower.includes("fitness") ||
    lower.includes("rotation") ||
    lower.includes("concern")
  ) {
    return "Medium";
  }

  return "Low";
}

export function analyzeNewsSignals(items: RawNewsItem[]): NewsSignal[] {
  return items.map((item) => {
    const combinedText = `${item.title} ${item.summary}`;

    return {
      title: item.title,
      category: detectCategory(combinedText),
      impact: detectImpact(combinedText),
      summary: item.summary,
    };
  });
}