export type Paper = {
  paper_id: string;
  id: string;
  title: string;
  authors: string[];
  "abstract": string;
  year: number;
  url: string;
  pdfUrl: string;
  matchtype:string
  
  // type: string;
  // noOfCitations: number;
  // keywords: string[];
  // access: string;
  // doi: string;
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
