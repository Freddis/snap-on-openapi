import 'zod-openapi/extend';
import {array, number, object, ZodObject, ZodRawShape, ZodType} from 'zod';
import {stringDateTransformer} from './transformers/stringDateTransformer';
import {stringNumberTransformer} from './transformers/stringNumberTransfromer';
import {stringBooleanTransformer} from './transformers/stringBooleanTransformer';

export class ValidationUtils {
  public readonly strings = {
    datetime: stringDateTransformer,
    number: stringNumberTransformer,
    boolean: stringBooleanTransformer,
  };

  describeShape<TShape extends ZodRawShape>(
    val: ZodObject<TShape>,
    descriptions: Record<keyof TShape, string>
  ): ZodObject<TShape> {
    const newShape: ZodRawShape = {};
    for (const entry of Object.entries(val.shape)) {
      newShape[entry[0]] = entry[1].openapi({description: descriptions[entry[0]]});
    }
    return object(newShape) as ZodObject<TShape>;
  }

  paginatedQuery<X extends ZodRawShape>(filter: X) {
    return object({
      page: number().min(1).optional().default(1).openapi({description: 'Page number'}),
      pageSize: number().min(1).optional().openapi({
        description: 'Number of items to display in the page.',
      }),
    }).extend(
      filter
    ).openapi({description: 'Pagination parameters'});
  }

  paginatedResponse<T extends ZodType>(arr: T) {
    return object({
      items: array(arr).openapi({description: 'Page or items'}),
      info: object({
        count: number().openapi({description: 'Total number of items'}),
        page: number().openapi({description: 'Current page'}),
        pageSize: number().openapi({description: 'Number of itemss per page'}),
      })
          .openapi({description: 'Pagination details'}),
    });
  }
}
