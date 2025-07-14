import 'zod-openapi/extend';
import z, {ZodRawShape, ZodType} from 'zod';
import {stringDateTransformer} from './transformers/stringDateTransformer';
import {stringNumberTransformer} from './transformers/stringNumberTransfromer';

export class ValidationUtils {
  public readonly strings = {
    datetime: stringDateTransformer,
    number: stringNumberTransformer,
  };

  paginatedQuery<X extends ZodRawShape>(filter: X) {
    return z
          .object({
            page: z.number().min(1).optional().default(1).openapi({description: 'Page number'}),
            pageSize: z.number().min(1).optional().openapi({
              description: 'Number of items to display in the page.',
            }),
          })
          .extend(filter)
          .openapi({description: 'Pagination parameters'});
  }

  paginatedResponse<T extends ZodType>(arr: T) {
    return z.object({
      items: z.array(arr).openapi({description: 'Page or items'}),
      info: z
          .object({
            count: z.number().openapi({description: 'Total number of items'}),
            page: z.number().openapi({description: 'Current page'}),
            pageSize: z.number().openapi({description: 'Number of itemss per page'}),
          })
          .openapi({description: 'Pagination details'}),
    });
  }
}
