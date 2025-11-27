export type Filters = {
  keywords: string[];
  title: string;
  authors: string[];
  year?: number | null;
  arxiv_id: string;
  results_per_page: number;
  page: number;
};