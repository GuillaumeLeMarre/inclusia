export type FalcQualityLabel = "Excellent" | "Bon" | "À améliorer";

export interface FalcMetrics {
  averageWordsPerSentence: number;
  complexWordCount: number;
  passiveSentenceCount: number;
  sentenceCount: number;
  wordCount: number;
  densityScore: number;
}

export interface FalcValidationResult {
  score: number;
  label: FalcQualityLabel;
  metrics: FalcMetrics;
}

export interface FalcGenerationResult {
  content: string;
  score: number;
  label: FalcQualityLabel;
  metrics: FalcMetrics;
}

export interface FalcPictogramItem {
  id: number;
  keyword: string;
  label: string;
  imageUrl: string;
  source: "arasaac";
}

export interface FalcPictogramsData {
  items: FalcPictogramItem[];
  generatedAt: string;
  locale: string;
}

export interface FalcPictogramsResult {
  pictograms: FalcPictogramsData;
}
