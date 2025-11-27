export type Paper = {
  id: string;
  paper_id: string;
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

export interface FormData {
  // Step 1
  role: string;
  academicLevel: string;
  
  // Step 2
  institution: string;
  highestDegree: string;
  primaryField: string;
  
  // Step 3
  googleScholarUrl: string;
  otherLinks: string;
  researchDescription: string;
  researchInterests: string[];
  recentPublications: string;
  
  // Step 4
  activeTopics: string[];
  learningTopics: string[];
  
  // Step 5
  goals: string[];
}
