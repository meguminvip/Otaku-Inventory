import { readFileSync } from 'fs';
import { upsertGoods } from '../db/database.js';

/**
 * Author: A.R.O.N.A
 */

export function importFromJson(jsonPath) {
  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  let processed = 0;

  for (const item of data.items || []) {
    if (!item.product_url || !item.title) {
      continue;
    }

    upsertGoods({ ...item, scraped_at: data.updated_at || new Date().toISOString() });
    processed += 1;
  }

  return { processed };
}
