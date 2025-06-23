export abstract class OpenApiError<TCode extends string> extends Error {
  private code: TCode;
  constructor(code: TCode) {
    super(code);
    this.code = code;
  }
  getCode(): TCode {
    return this.code;
  }
}
