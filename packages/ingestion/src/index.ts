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
export { CsvAdapter } from './adapters/csv-adapter'
export { PdfAdapter, UrlAdapter, ImageAdapter } from './adapters/stub-adapters'
export { NotImplementedAdapterError, type SourceAdapter, type AdapterInput } from './adapters/types'
