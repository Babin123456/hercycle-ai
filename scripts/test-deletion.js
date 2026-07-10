/**
 * Test script to verify that deleting a user from public.users cascades properly.
 * 
 * Usage:
 * node scripts/test-deletion.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
  process.exit(1)
}

const supabase = createClient(url, key)
const MOCK_USER_ID = 'test_cascade_delete_user_123'

async function runTest() {
  console.log(`[1] Creating mock user in public.users...`)
  const { error: insertUserErr } = await supabase
    .from('users')
    .insert([{ id: MOCK_USER_ID }])

  if (insertUserErr) {
    console.error("Error creating mock user:", insertUserErr)
    return
  }

  console.log(`[2] Inserting mock cycle for user...`)
  await supabase
    .from('cycles')
    .insert([{ user_id: MOCK_USER_ID, start_date: '2023-01-01' }])

  console.log(`[3] Inserting mock daily log for user...`)
  await supabase
    .from('daily_logs')
    .insert([{ user_id: MOCK_USER_ID, date: '2023-01-01', symptoms: ['cramps'] }])

  // Verify inserts
  const { data: checkCycles } = await supabase.from('cycles').select('*').eq('user_id', MOCK_USER_ID)
  console.log(`Verified cycles inserted: ${checkCycles.length}`)

  console.log(`[4] Deleting user from public.users...`)
  const { error: deleteErr } = await supabase
    .from('users')
    .delete()
    .eq('id', MOCK_USER_ID)

  if (deleteErr) {
    console.error("Error deleting user:", deleteErr)
    return
  }

  // Verify cascades
  const { data: finalCycles } = await supabase.from('cycles').select('*').eq('user_id', MOCK_USER_ID)
  const { data: finalLogs } = await supabase.from('daily_logs').select('*').eq('user_id', MOCK_USER_ID)

  if (finalCycles.length === 0 && finalLogs.length === 0) {
    console.log("✅ SUCCESS: Cascade delete works. All related records were wiped.")
  } else {
    console.log("❌ FAILURE: Related records were not wiped.", { finalCycles, finalLogs })
  }
}

runTest()
