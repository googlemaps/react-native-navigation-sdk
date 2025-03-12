export type GooglePlace = {
  description: string;
  matched_substrings: GooglePlaceMatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: GooglePlaceStructuredFormatting;
  terms: GooglePlaceTerm[];
  types: string[];
};

type GooglePlaceMatchedSubstring = {
  length: number;
  offset: number;
};

type GooglePlaceStructuredFormatting = {
  main_text: string;
  main_text_matched_substrings: MainTextMatchedSubstring[];
  secondary_text: string;
};

type MainTextMatchedSubstring = {
  length: number;
  offset: number;
};

type GooglePlaceTerm = {
  offset: number;
  value: string;
};
