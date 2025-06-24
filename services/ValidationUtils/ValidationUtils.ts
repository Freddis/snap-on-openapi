import z, {ZodRawShape, ZodObject, ZodUnion, ZodUnionOptions} from 'zod';

export class ValidationUtils {

  paginatedQuery<X extends ZodRawShape>(filter: X) {
    return z
          .object({
            page: z.number().optional().openapi({description: 'Page number'}),
            pageSize: z.number().min(1).max(50).optional().default(10).openapi({
              description: 'Number of items to display in the page.',
            }),
          })
          .extend(filter)
          .openapi({description: 'Pagination parameters'});
  }

  paginatedResponse<T extends ZodObject<ZodRawShape>| ZodUnion<ZodUnionOptions>>(arr: T) {
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
