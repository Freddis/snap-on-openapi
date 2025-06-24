export interface ExpressResponse {
  header: (name: string, value: string) => ExpressResponse
  status: (code: number) => ExpressResponse
  json: (data: unknown) => ExpressResponse
  send: (body: string) => ExpressResponse
}
