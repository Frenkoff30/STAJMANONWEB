/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profil } from '@/lib/supabase';

declare global {
  namespace App {
    interface Locals {
      /** Klient pro tenhle jeden požadavek. `null`, když rezervace nejsou nastavené. */
      supabase: SupabaseClient | null;
      /** Přihlášený člověk, ověřený u Supabase. */
      uzivatel: { id: string; email: string } | null;
      /** Jeho profil ve stáji. Neschválený profil je taky profil. */
      profil: Profil | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_FORM_ACCESS_KEY?: string;
}

export {};
