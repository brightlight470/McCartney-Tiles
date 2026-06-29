export type {
  SourceKind,
  FieldSuggestion,
  DraftProduct,
  DraftRange,
  IngestionResult,
  PublishToggles,
} from './types'
export {
  classifyFinish,
  classifyEffect,
  classifyColour,
  classifyFormat,
  classifySizeBand,
} from './classify'
export { buildDraftProduct } from './draft'
export { parseLinesToRanges, extractCandidateLines } from './parse'
export { CsvAdapter } from './adapters/csv-adapter'
export { UrlAdapter } from './adapters/url-adapter'
export { PdfAdapter } from './adapters/pdf-adapter'
export { ImageAdapter } from './adapters/stub-adapters'
export { NotImplementedAdapterError, type SourceAdapter, type AdapterInput } from './adapters/types'
