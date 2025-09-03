import 'zod-openapi/extend';
import z from 'zod';

export const stringNumberTransformer = z.string().refine((input) => {
  try {
    if (input === '') {
      return false;
    }
    const number = Number(input);
    if (isNaN(number)) {
      return false;
    }
    if (!isFinite(number)) {
      return false;
    }
    return true;
  /* c8 ignore start */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return false; // unreachable, but better safe than sorry
  }
  /* c8 ignore stop */
}, 'Not a valid number string')
.transform((x) => {
  return Number(x);
}).openapi({type: 'number'}); ;
