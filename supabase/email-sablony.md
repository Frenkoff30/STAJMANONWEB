# České e-mailové šablony pro Supabase Auth

E-maily kolem účtu (potvrzení registrace, obnova hesla) neposílá web, ale
Supabase. Jejich text se nastavuje v dashboardu, ne v tomhle repozitáři —
tenhle soubor je jen předloha k vložení, ať se text neztratí.

**Kam:** Supabase → Authentication → Emails → Templates
(https://supabase.com/dashboard/project/hfroexlnqkczeyjmsqxw/auth/templates)

U každé šablony se mění **Subject** a **Message body**. Odkazy schválně
používají `token_hash` místo výchozího `{{ .ConfirmationURL }}`: takový odkaz
funguje i tehdy, když člověk otevře e-mail na jiném zařízení, než na kterém se
registroval. Zpracovává je `src/pages/rezervace/potvrdit.ts`.

Aby e-maily chodily od stáje a ne z Supabase, musí být zapnutý vlastní SMTP
(Resend) — viz Authentication → SMTP Settings.

---

## 1. Confirm signup (potvrzení registrace)

**Subject:**

```
Potvrďte svůj e-mail – rezervace jízdárny
```

**Message body:**

```html
<!doctype html>
<html lang="cs">
  <body style="margin:0;background:#f4f0e7;padding:24px 12px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px 28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#22312a">
      <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;color:#16211c">Stáj Manon</p>
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:19px;font-weight:normal;color:#16211c">Potvrďte prosím svůj e-mail</h2>
      <p style="margin:0 0 16px">
        Děkujeme za registraci do rezervací jízdárny. Posledním krokem je
        potvrzení e-mailové adresy &mdash; klepněte na tlačítko níže.
      </p>
      <p style="margin:8px 0 16px"><a href="{{ .SiteURL }}/rezervace/potvrdit?token_hash={{ .TokenHash }}&type=signup" style="display:inline-block;background:#1e3629;color:#fbf9f4;padding:12px 22px;text-decoration:none;font-size:14px;letter-spacing:.04em">Potvrdit e-mail</a></p>
      <p style="margin:0 0 16px">
        Potom váš účet ještě schválí stáj. Dáme vám vědět e-mailem, jakmile
        budete moci rezervovat.
      </p>
      <p style="margin:0 0 16px;font-size:13px;color:#6b7a72">
        Pokud jste se neregistrovali vy, nic nedělejte &mdash; bez potvrzení
        účet nikdo nepoužije.
      </p>
      <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e6e0d3;font-size:13px;color:#6b7a72">
        Stáj Manon &middot; Areál Jízdárna Suchá<br />
        <a href="https://www.stajmanon.cz" style="color:#6b7a72">www.stajmanon.cz</a> &middot;
        <a href="mailto:manon@wo.cz" style="color:#6b7a72">manon@wo.cz</a>
      </p>
    </div>
  </body>
</html>

```

---

## 2. Reset password (zapomenuté heslo)

**Subject:**

```
Nové heslo k rezervacím jízdárny
```

**Message body:**

```html
<!doctype html>
<html lang="cs">
  <body style="margin:0;background:#f4f0e7;padding:24px 12px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px 28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#22312a">
      <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;color:#16211c">Stáj Manon</p>
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:19px;font-weight:normal;color:#16211c">Nastavení nového hesla</h2>
      <p style="margin:0 0 16px">
        Dostali jsme žádost o nové heslo k vašemu účtu v rezervacích jízdárny.
        Nové heslo si nastavíte po klepnutí na tlačítko.
      </p>
      <p style="margin:8px 0 16px"><a href="{{ .SiteURL }}/rezervace/potvrdit?token_hash={{ .TokenHash }}&type=recovery" style="display:inline-block;background:#1e3629;color:#fbf9f4;padding:12px 22px;text-decoration:none;font-size:14px;letter-spacing:.04em">Nastavit nové heslo</a></p>
      <p style="margin:0 0 16px;font-size:13px;color:#6b7a72">
        Odkaz platí jednu hodinu. Pokud jste o změnu hesla nežádali, tenhle
        e-mail klidně smažte &mdash; vaše heslo zůstane beze změny.
      </p>
      <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e6e0d3;font-size:13px;color:#6b7a72">
        Stáj Manon &middot; Areál Jízdárna Suchá<br />
        <a href="https://www.stajmanon.cz" style="color:#6b7a72">www.stajmanon.cz</a> &middot;
        <a href="mailto:manon@wo.cz" style="color:#6b7a72">manon@wo.cz</a>
      </p>
    </div>
  </body>
</html>

```
