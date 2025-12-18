import 'zod-openapi/extend';
import z from 'zod';

export const stringDateTransformer = z.union([
  z.date(),
  z.string().refine((input) => {
    try {
      const output = new Date(Date.parse(input));
      const outputStr = output.toISOString().split('T')[0];
      const inputStr = input.replace('T', ' ');
      return inputStr === outputStr;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      return false;
    }
  }, 'Not a valid date string')
  .transform((x) => {
    return new Date(Date.parse(x));
  }),
]).openapi({type: 'string', format: 'date'});
