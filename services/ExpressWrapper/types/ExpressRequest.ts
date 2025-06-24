export interface ExpressRequest {
  headers: Record<string, string | string[] | undefined>
  body: string
  method: string
  protocol: string
  originalUrl: string
  host: string
}
