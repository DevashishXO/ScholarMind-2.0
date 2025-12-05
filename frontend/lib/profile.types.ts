// lib/profile.types.ts
export interface Publication {
  title: string;
  authors: string;
  year: number;
  venue?: string;
  citation_count: number;
  cited_by_count?: number;
  doi?: string;
  publisher?: string;
  pages?: string | null;
  url?: string | null;
  abstract?: string | null;
  bibtex?: string | null;
  oa_pdf_url?: string | null;
  details_fetched?: boolean;
  updated_at?: { $date: string } | null;
}

export interface MetricsIndex {
  all: number;
  since_2019?: number;
}

export interface Metrics {
  citations: MetricsIndex;
  h_index: MetricsIndex;
  i10_index: MetricsIndex | { all: number } | number;
}

export interface CoAuthor {
  name: string;
  scholar_id: string;
  affiliation?: string;
}

export interface CitationYear {
  year: number;
  citations: number;
}

export interface ScholarlyProfile {
  scholar_id?: string;
  name?: string;
  affiliation?: string;
  email?: string | null;
  profile_picture?: string | null;
  website?: string | null;
  interests: string[];
  co_authors?: CoAuthor[];
  metrics: Metrics;
  citation_graph?: CitationYear[];
  publications: Publication[];
  scraping_status?: string;
  profile_fetched_at?: { $date: string } | null;
  details_fetched_at?: { $date: string } | null;
}

export interface Profile {
  name: string;
  email: string;
  picture?: string;
  role?: string;
  institution?: string;
  academicLevel?: string;
  highestDegree?: string;
  primaryField?: string;
  googleScholarUrl?: string;
  researchDescription?: string;
  researchInterests?: string[];
  activeTopics?: string[];
  learningTopics?: string[];
  goals?: string[];
  scholarlyProfile: ScholarlyProfile;
  onboardingComplete?: boolean;
  onboardingStep?: number;
  scholarlyProfileStatus?: string;
}
