/**
 * Sem míří odkazy z e-mailů: potvrzení registrace, pozvánka, obnova hesla.
 *
 * Umí obě podoby odkazu, které Supabase posílá:
 *   `?token_hash=…&type=…`  z upravené e-mailové šablony (doporučené, funguje
 *                           i když člověk otevře e-mail na jiném zařízení)
 *   `?code=…`               výchozí PKCE odkaz, vyžaduje stejný prohlížeč
 *
 * Token se ověřuje u Supabase. Sám o sobě neznamená nic, dokud ho nepotvrdí.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import type { EmailOtpType } from '@supabase/supabase-js';
import { vytvorKlienta, rezervaceNastaveny } from '@/lib/supabase';

const POVOLENE_TYPY: EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
];

export const GET: APIRoute = async (context) => {
  if (!rezervaceNastaveny) return context.redirect('/rezervace');

  const supabase = context.locals.supabase ?? vytvorKlienta(context);
  const parametry = context.url.searchParams;

  const tokenHash = parametry.get('token_hash');
  const typ = parametry.get('type') as EmailOtpType | null;
  const kod = parametry.get('code');

  let overeno = false;

  if (tokenHash && typ && POVOLENE_TYPY.includes(typ)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: typ });
    overeno = !error;
  } else if (kod) {
    const { error } = await supabase.auth.exchangeCodeForSession(kod);
    overeno = !error;
  }

  if (!overeno) {
    return context.redirect('/rezervace/prihlaseni?odkaz=neplatny');
  }

  // Obnova hesla pokračuje nastavením nového, zbytek rovnou do kalendáře.
  if (typ === 'recovery' || parametry.get('dal') === 'heslo') {
    return context.redirect('/rezervace/nove-heslo');
  }

  return context.redirect('/rezervace?ok=potvrzeno');
};
