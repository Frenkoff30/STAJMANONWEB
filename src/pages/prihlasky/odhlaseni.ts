/**
 * Odhlášení ze správy přihlášek. Jen POST, stejně jako u rezervací:
 * odhlašovací odkaz by šel podstrčit třeba jako obrázek na cizí stránce.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { klientSpravy, prihlaskyNastaveny } from '@/lib/prihlasky/db';

export const POST: APIRoute = async (context) => {
  if (prihlaskyNastaveny) await klientSpravy(context).auth.signOut();
  return context.redirect('/prihlasky/prihlaseni?odhlasen');
};

export const GET: APIRoute = (context) => context.redirect('/prihlasky/sprava');
