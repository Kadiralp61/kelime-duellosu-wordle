// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// .env dosyasındaki bilgileri okur
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdrgtafcpqotnmhhfebr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkcmd0YWZjcHFvdG5taGhmZWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTQ1NTksImV4cCI6MjA5OTI3MDU1OX0.pRE1_wli9lFbSAvGTH6QuuV_53n0L70mq7JjRFKl5Vk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);