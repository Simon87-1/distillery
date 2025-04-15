import { Feedback } from "./common.types";

interface BoundingBox {
  content: string;
  page_number: number;
  height: number;
  width: number;
  doc_id: number;
  polygon: number[];
  span: any | null; // Adjust type if needed
  confidence: number;
}

interface Reference {
  document_id: number;
  offsets: number[];
  reference_text: string;
  bounding_boxes: BoundingBox | null;
}

export interface Fact {
  fact_id: string;
  text: string;
  section_name: string;
  references: Reference[];
  confidence_score: number | null;
  feedback: Feedback;
}

export interface Facts {
  facts: Fact[];
  header: string;
}

export interface Message {
  metadata: any | null; // Adjust type if needed
  sections: Facts[];
}
