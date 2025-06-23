export interface OpenApiFieldError {
  field: string
  message: string
  fieldErrors?: OpenApiFieldError[]
}
