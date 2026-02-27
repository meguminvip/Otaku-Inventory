import { db, pruneInactiveSources, recategorizeExistingGoods } from '../db/database.js';

/**
 * Author: A.R.O.N.A
 */

recategorizeExistingGoods();
const pruneResult = pruneInactiveSources();

const categories = db
  .prepare('SELECT category, COUNT(*) AS count FROM goods_items GROUP BY category ORDER BY count DESC')
  .all();

console.log('Recategorize completed');
console.log(`Pruned inactive-source rows: ${pruneResult.changes}`);
console.table(categories);
