import z from 'zod';

export const stringBooleanTransformer = z.enum(['true', 'false']).transform((val) => {
  return val === 'true';
}).openapi({type: 'boolean'});
