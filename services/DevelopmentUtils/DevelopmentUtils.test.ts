import {expect, test} from 'vitest';
import {DevelopmentUtils} from './DevelopmentUtils';
import {describe} from 'node:test';


describe('Development Utils', () => {
  test('Swagger HTML returned correctly', () => {
    const utils = new DevelopmentUtils();
    const html = utils.getSwaggerHTML('/test');
    expect(html).toContain('SwaggerUIBundle');
  });

});

