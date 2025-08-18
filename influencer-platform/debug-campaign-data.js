// Debug script to check campaign data
// Run this to verify CPM fields are being fetched

console.log('=== CAMPAIGN DATA DEBUGGING ===');
console.log('');
console.log('1. First, make sure you have run the migration:');
console.log('   - Copy content from: supabase/migrations/20250114_add_cpm_payment_model.sql');
console.log('   - Run in Supabase Dashboard > SQL Editor');
console.log('');
console.log('2. Check your campaign data in Supabase:');
console.log('   SELECT id, title, payment_model, cpm_rate, max_views, total_budget_calculated FROM campaigns LIMIT 5;');
console.log('');
console.log('3. If fields are NULL:');
console.log('   - Create a new campaign using the updated form');
console.log('   - Or manually update existing campaigns:');
console.log('     UPDATE campaigns SET payment_model = \'cpm\', cpm_rate = 10, max_views = 100000 WHERE payment_model IS NULL;');
console.log('');
console.log('4. Test the display by checking console logs in browser dev tools');
console.log('');
console.log('Expected display format: "1K/$10 • Max: 100K views"');
console.log('If showing "1K/$0 • Max: 0K views" - fields are NULL/missing');