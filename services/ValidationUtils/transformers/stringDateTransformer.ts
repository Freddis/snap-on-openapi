import z from 'zod';

export const stringDateTransformer = z.string().refine((input) => {
  try {
    const output = new Date(Date.parse(input));
    const outputStr = output.toISOString().replace('T', ' ');
    const inputStr = input.replace('T', ' ');
    return inputStr === outputStr;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return false;
  }
}, 'Not a valid date string')
  .transform((x) => {
    return new Date(Date.parse(x));
  });
