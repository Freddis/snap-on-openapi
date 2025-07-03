import z, {ZodTypeAny, ZodArray, ZodObject, ZodRawShape} from 'zod';
import {AnyRoute} from '../../types/AnyRoute';
import {ValidationUtils} from '../ValidationUtils/ValidationUtils';
interface DescriptionCheckerConfig {
  checkValidators: boolean
}
export class DescriptionChecker {
  protected utils = new ValidationUtils();
  protected config: DescriptionCheckerConfig;
  constructor(config: DescriptionCheckerConfig) {
    this.config = config;
  }

  public checkRoutes(routes: AnyRoute<string>[]) {
    for (const route of routes) {
      this.checkRouteDescriptions(route);
    }
  }

  protected checkRouteDescriptions(route: AnyRoute<string>) {
    const minimalLength = 10;
    if (!route.description || route.description.length < minimalLength) {
      throw new Error(`Description for ${route.path} is missing or too small`);
    }
    this.checkValidatorDescriptions(route, 'responseValidator', 'responseValidator', route.validators.response);
    this.checkValidatorDescriptions(route, 'pathValidator', 'pathValidator', route.validators.path ?? z.object({}), false);
    this.checkValidatorDescriptions(route, 'queryValidator', 'queryValidator', route.validators.query ?? z.object({}), false);
    this.checkValidatorDescriptions(route, 'bodyValidator', 'bodyValidator', route.validators.body ?? z.object({}), false);
  }

  protected checkValidatorDescriptions(
      route: AnyRoute<string>,
      validatorName: string,
      field: string | undefined,
      validator: ZodTypeAny,
      checkValidatorDescription = true,
    ) {
    const openapi = validator._def.openapi ?? validator._def.zodOpenApi?.openapi;
    if (this.config.checkValidators && checkValidatorDescription && !openapi?.description) {
      throw new Error(
          `Route '${route.method}:${route.path}': ${validatorName} missing openapi description on field '${field}'`,
        );
    }
      // console.log(validator._def.typeName)
    if (validator._def.typeName === 'ZodArray') {
      const arr = validator as ZodArray<ZodObject<ZodRawShape>>;
      const nonPrimitiveArray = arr.element.shape !== undefined;
      if (nonPrimitiveArray) {
        this.checkShapeDescription(route, validatorName, arr.element.shape);
      }
    }
    if (validator._def.typeName === 'ZodObject') {
      const obj = validator as ZodObject<ZodRawShape>;
      this.checkShapeDescription(route, validatorName, obj.shape);
    }
  }
  protected checkShapeDescription(
      route: AnyRoute<string>,
      validatorName: string, shape: ZodRawShape
    ) {
    for (const field of Object.keys(shape)) {
      const value = shape[field] as ZodObject<ZodRawShape>;
      this.checkValidatorDescriptions(route, validatorName, field, value);
    }
  }
}
