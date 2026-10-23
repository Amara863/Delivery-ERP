
import { supabase } from './supabase';

async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Supabase query failed:', error.message);
    return;
  }

  console.log('Supabase query successful:', data);
}

testSupabaseConnection();
