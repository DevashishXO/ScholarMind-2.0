export type Paper = {
  id: string;
  title: string;
  authors: string[];
  "abstract": string;
  type: string;
  noOfCitations: number;
  year: number;
  keywords: string[];
  access: string;
  doi: string;
  url: string;
  pdfUrl: string;
};
