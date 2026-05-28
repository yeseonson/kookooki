// scripts/seed_supabase.js
// 실행 방법:
//   node scripts/seed_supabase.js
// 환경 변수 REQUIRED:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY를 환경 변수로 설정해야 합니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const sql = fs.readFileSync(new URL('../supabase-seed.sql', import.meta.url), 'utf8');

async function run() {
  const { data, error } = await supabase.rpc('run_sql', { sql });
  if (error) {
    console.error('Supabase SQL 실행 오류:', error);
    process.exit(1);
  }
  console.log('초기 데이터 시드가 완료되었습니다.', data);
}

run();
