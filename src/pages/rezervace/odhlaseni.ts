/**
 * Odhlášení. Jen POST.
 *
 * Kdyby to byl obyčejný odkaz, stačilo by někomu podstrčit stránku
 * s `<img src="/rezervace/odhlaseni">` a odhlásilo by ho to. GET proto
 * jen přesměruje zpátky.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { vytvorKlienta, rezervaceNastaveny } from '@/lib/supabase';

export const POST: APIRoute = async (context) => {
  if (rezervaceNastaveny) {
    const supabase = context.locals.supabase ?? vytvorKlienta(context);
    await supabase.auth.signOut();
  }
  return context.redirect('/rezervace/prihlaseni?odhlasen');
};

export const GET: APIRoute = (context) => context.redirect('/rezervace');
