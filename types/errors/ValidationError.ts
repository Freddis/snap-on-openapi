import {ZodError} from 'zod';
import {ErrorCode} from '../../enums/ErrorCode';
import {ValidationLocations} from '../../enums/ValidationLocations';
import {BuiltInError} from './BuiltInError';

export class ValidationError extends BuiltInError {
  private error: ZodError<unknown>;
  private location: ValidationLocations;

  constructor(error: ZodError<unknown>, location: ValidationLocations) {
    super(ErrorCode.ValidationFailed);
    this.error = error;
    this.location = location;
  }

  getZodError() {
    return this.error;
  }

  getLocation() {
    return this.location;
  }
}
