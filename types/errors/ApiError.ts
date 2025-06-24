export abstract class ApiError<TCode extends string> extends Error {
  private code: TCode;
  constructor(code: TCode) {
    super(code);
    this.code = code;
  }
  getCode(): TCode {
    return this.code;
  }
}
