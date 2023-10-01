interface GrammarResponse {
  original: string;
  standard: string;
  diff: [number, string][];
}

export default GrammarResponse;
