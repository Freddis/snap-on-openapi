import {ZodError} from 'zod';
import {ErrorCode} from '../../enums/ErrorCode';
import {ValidationLocation} from '../../enums/ValidationLocations';
import {BuiltInError} from './BuiltInError';

export class ValidationError extends BuiltInError {
  protected error: ZodError<unknown>;
  protected location: ValidationLocation;
  protected data?: unknown;

  constructor(error: ZodError<unknown>, location: ValidationLocation, data: unknown) {
    super(ErrorCode.ValidationFailed);
    this.error = error;
    this.location = location;
    this.data = data;
  }

  getZodError() {
    return this.error;
  }

  getLocation() {
    return this.location;
  }
  getData() {
    return this.data;
  }
}
