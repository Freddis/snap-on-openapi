import {
  z,
  ZodArray,
  ZodDefault,
  ZodFirstPartyTypeKind,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodString,
  ZodTypeAny,
  ZodUnion,
  ZodUnionOptions,
} from 'zod';
import {ValidationError} from '../../types/errors/ValidationError';
import {ValidationLocations} from '../../enums/ValidationLocations';

export class Validator {

  validatePath(validator: ZodObject<ZodRawShape> | undefined, path: Record<string, string>) {
    const result = this.convertStringsAndSafeParse(
        validator?.strict() ?? z.object({}),
        path,
        ValidationLocations.Query,
      );
    return result;
  }

  validateQuery(validator: ZodObject<ZodRawShape> | undefined, query: Record<string, string>) {
    const result = this.convertStringsAndSafeParse(
        validator?.strict() ?? z.object({}),
        query,
        ValidationLocations.Query,
      );
    return result;
  }
  validateBody(validator: ZodObject<ZodRawShape>, body: unknown) {
    const bodyWithConvertedDatesValidator = this.swapValidators(
          validator,
          ZodFirstPartyTypeKind.ZodDate,
          z.string().transform((x) => new Date(x))
        );
    const result = bodyWithConvertedDatesValidator.safeParse(body);
    return result;
  }

  protected swapValidators(
    original: z.ZodTypeAny & {shape: ZodRawShape},
    searchType: ZodFirstPartyTypeKind,
    substitute: z.ZodTypeAny
  ): ZodTypeAny {
    if (original._def.typeName.toString() === searchType) {
      return substitute;
    }

    if (original._def.type) {
      const innerType = this.swapValidators(original._def.type, searchType, substitute);
      if (original._def.typeName === 'ZodArray') {
        return z.array(innerType);
      } else if (original._def.typeName === 'ZodOptional') {
        return z.optional(innerType);
      }
      throw new Error(`Can't convert ${original._def.typeName} validator`);
    }
    if (original._def.typeName && original._def.typeName === 'ZodNullable') {
      return this.swapValidators(original._def.innerType, searchType, substitute).nullable();
    }

    if (original.shape) {
      const result: ZodRawShape = {};
      for (const key in original.shape) {
        if (!Object.hasOwn(original.shape, key)) {
          continue;
        }
        const validator = original.shape[key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[key] = this.swapValidators(validator as any, searchType, substitute);
      }
      return z.object(result);
    }
    return original;
  }

  protected convertStringsAndSafeParse(
      finalValidator: ZodObject<ZodRawShape>,
      data: unknown,
      paramSourceName: ValidationLocations,
    ): z.SafeParseReturnType<unknown, object> {
    const initialValidatorShape: {
        [key: string]:
          | ZodArray<ZodString>
          | ZodString
          | ZodOptional<ZodString | ZodArray<ZodString>>
          | ZodDefault<ZodString>
          | ZodUnion<ZodUnionOptions>
          | ZodOptional<ZodUnion<ZodUnionOptions>>
      } = {};
    const finalShape = (finalValidator as ZodObject<ZodRawShape>).shape;
    for (const key of Object.keys(finalShape)) {
      if (!finalShape[key]) {
        throw new Error(`Key ${key} not found in validator shape`);
      }
      let def = finalShape[key]._def;
      if (def.typeName === 'ZodDefault') {
        def = def.innerType._def;
          // no continue, just unwrapping
      }

      if (def.typeName === 'ZodArray') {
        const validator = z.union([z.string().transform((x) => [x]), z.string().array()]);
        initialValidatorShape[key] = validator;
        continue;
      }
      initialValidatorShape[key] = z.string();
      if (def.typeName === 'ZodOptional') {
        initialValidatorShape[key] = z.string().optional();
        if (def.innerType._def.typeName === 'ZodArray') {
          const validator = z.union([z.string().transform((x) => [x]), z.string().array()]).optional();
          initialValidatorShape[key] = validator;
        }
      }
    }
    const initialValidator = z.object(initialValidatorShape).strict();
    const initialResult = initialValidator.safeParse(data);
    if (!initialResult.success) {
      throw new ValidationError(initialResult.error, paramSourceName);
    }
    const transformedParams: Record<string, unknown> = {};
    for (const field of Object.keys(finalShape)) {
      if (!finalShape[field]) {
          // never
        throw new Error(`'${field}' not found in final validator shape`);
      }
      let type = finalShape[field]._def.typeName;
      let def = finalShape[field]._def;
      let validator = finalShape[field];
      if (type === 'ZodDefault') {
        type = def.innerType._def.typeName;
        validator = def.innerType;
        def = def.innerType._def;
      }
      if (type === 'ZodOptional') {
        type = def.innerType._def.typeName;
        validator = def.innerType;
        def = def.innerType._def;
      }
      const initialValue = initialResult.data[field];
      if (initialValue === undefined) {
        continue;
      }
      if (type === 'ZodString') {
        transformedParams[field] = initialValue;
        continue;
      }

      if (type === 'ZodArray') {
        const subtype = def.type._def.typeName;
        const values: unknown[] = [];
        for (const value of initialValue) {
          const val = this.convertValue(subtype, value, field, paramSourceName, def.type);
          values.push(val);
        }
        transformedParams[field] = values;
        continue;
      }
      const value: unknown = this.convertValue(type, initialValue, field, paramSourceName, validator);
      transformedParams[field] = value;
    }

    const result = finalValidator.safeParse(transformedParams);
    return result;
  }

  protected convertValue(
      type: string,
      initialValue: string,
      field: string,
      paramSourceName: string,
      validator: ZodTypeAny,
    ) {
    let value: string | number| Date | boolean | object = '';
    let typeName = 'Unknown';
    switch (type) {
      case 'ZodNumber':
        value = Number(initialValue);
        typeName = 'number';
        break;
      case 'ZodDate':
        value = new Date(Date.parse(initialValue));
        typeName = 'date';
        break;
      case 'ZodBoolean':
        if (initialValue === 'true') {
          value = true;
        }
        if (initialValue === 'false') {
          value = false;
        }
        typeName = 'boolean';
        break;
      case 'ZodNativeEnum':
          // eslint-disable-next-line no-case-declarations
        const parsed = validator.safeParse(initialValue);
        value = parsed.data ?? '';
        typeName = 'enum';
        break;
      default:
        throw new Error(`Couldn't parse ${field} from ${paramSourceName}, type '${type}' cannot be used`);
    }
    const stringValue = typeName === 'date' ? (value as Date).toISOString() : value.toString();
    if (stringValue !== initialValue) {
      throw new Error(`Couldn't parse ${field} is not a valid ${typeName}: ${stringValue} != ${initialValue}`);
    }
    return value;
  }
}
