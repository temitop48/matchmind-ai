export type NewsSignal = {
  title: string;
  impact: "Low" | "Medium" | "High";
  category:
    | "injury"
    | "availability"
    | "suspension"
    | "form"
    | "tactical"
    | "other";
  summary: string;
};

export type TeamNewsReport = {
  team: string;
  generatedAt: string;
  signals: NewsSignal[];
};