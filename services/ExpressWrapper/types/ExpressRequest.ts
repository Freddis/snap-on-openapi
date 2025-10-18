export interface ExpressRequest {
  headers: Record<string, string | string[] | undefined>
  body: string
  method: string
  protocol: string
  originalUrl: string
  host: string
  // Node.js Readable stream methods for body collection
  on(event: 'data', listener: (chunk: Buffer) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}
