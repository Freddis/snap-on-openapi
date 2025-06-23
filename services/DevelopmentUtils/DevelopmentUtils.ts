import {readFileSync} from 'fs';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

export class DevelopmentUtils {

  getSwaggerHTML(schemaUrl: string): string {
    const file = readFileSync(`${dirname(fileURLToPath(import.meta.url))}/../../assets/swagger.html`);
    const result = file.toString();
    return result.replaceAll('{{SCHEMA_URL}}', schemaUrl);
  }

  getStoplightHtml(schemaUrl: string): string {
    const file = readFileSync(`${dirname(fileURLToPath(import.meta.url))}/../../assets/stoplight.html`);
    const result = file.toString();
    return result.replaceAll('{{SCHEMA_URL}}', schemaUrl);
  }
}
