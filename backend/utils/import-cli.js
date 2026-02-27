import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { importFromJson } from './importer.js';

/**
 * Author: A.R.O.N.A
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '../../scraper/output/goods_data.json');

try {
  const result = importFromJson(jsonPath);
  console.log(`Import done: ${result.processed} items`);
} catch (error) {
  console.error(`Import failed: ${error.message}`);
  process.exit(1);
}
