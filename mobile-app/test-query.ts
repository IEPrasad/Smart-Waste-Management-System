import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // Adjust if needed

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDrivers() {
  const { data: logs } = await supabase.from('pickup_logs').select('driver_id').limit(10);
  console.log('Pickup log driver IDs:', logs?.map(l => l.driver_id));
  
  const { data: drivers } = await supabase.from('driver').select('id, full_name');
  console.log('Driver table rows:', drivers);
}

checkDrivers();
