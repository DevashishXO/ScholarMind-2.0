type Category = {
  code: string;
  label: string;
  is_primary: boolean;
}

export type Paper = {
  paper_id: string;
  id: string;
  title: string;
  authors: string[];
  "abstract": string;
  year: number;
  url: string;
  pdfUrl: string;
  matchtype: string;
  //new entries
  
  category: Category[];
  published_date: string;
  doi: string;
  
  // type: string;
  // noOfCitations: number;
  // keywords: string[];
  // access: string;
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
