import {expect, test} from 'vitest';
import {DevelopmentUtils} from './DevelopmentUtils';


test('DevelopmentUtils', () => {
  const utils = new DevelopmentUtils();
  const html = utils.getSwaggerHTML('/test');
  expect(html).toContain('SwaggerUIBundle');
});
