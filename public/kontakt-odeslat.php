<?php
/**
 * Zpracování kontaktního formuláře — Stáj Manon.
 *
 * Web je jinak statický; tenhle jediný PHP soubor stačí na běžném hostingu
 * s funkcí mail(). Formulář funguje i bez JavaScriptu (klasický POST +
 * přesměrování), s JavaScriptem se odesílá přes fetch a vrací JSON.
 *
 * Nasazení: nechte soubor v kořeni webu vedle index.html. Adresu příjemce
 * změňte v konstantě RECIPIENT.
 */

declare(strict_types=1);

const RECIPIENT = 'manon@wo.cz';
const SUBJECT_PREFIX = '[stajmanon.cz] ';
/** Formulář vyplněný rychleji než za tolik sekund je téměř jistě robot. */
const MIN_FILL_SECONDS = 3;

$wantsJson = isset($_SERVER['HTTP_X_REQUESTED_WITH'])
    && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'fetch';

function respond(bool $ok, string $message, int $status = 200): void
{
    global $wantsJson;

    if ($wantsJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $target = '/kontakt?' . ($ok ? 'odeslano=1' : 'chyba=' . rawurlencode($message)) . '#formular';
    header('Location: ' . $target, true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Neplatný požadavek.', 405);
}

/* --- Antispam ---------------------------------------------------------- */

// Honeypot — skryté pole, které člověk nikdy nevyplní.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, 'Děkujeme, zpráva byla odeslána.');
}

$started = (int) ($_POST['ts'] ?? 0);
if ($started > 0 && (time() - $started) < MIN_FILL_SECONDS) {
    respond(false, 'Formulář byl odeslán příliš rychle. Zkuste to prosím znovu.', 422);
}

/* --- Validace ---------------------------------------------------------- */

$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$phone   = trim((string) ($_POST['phone'] ?? ''));
$topic   = trim((string) ($_POST['topic'] ?? 'Obecný dotaz'));
$message = trim((string) ($_POST['message'] ?? ''));

$errors = [];

if ($name === '' || mb_strlen($name) > 120) {
    $errors[] = 'Vyplňte prosím jméno.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Zadejte platnou e-mailovou adresu.';
}
if ($message === '' || mb_strlen($message) < 5) {
    $errors[] = 'Napište nám prosím, o co jde.';
}
if (mb_strlen($message) > 5000) {
    $errors[] = 'Zpráva je příliš dlouhá.';
}

// Ochrana proti vkládání hlaviček
foreach ([$name, $email, $phone] as $value) {
    if (preg_match('/[\r\n]/', $value)) {
        $errors[] = 'Neplatný vstup.';
        break;
    }
}

if ($errors) {
    respond(false, implode(' ', $errors), 422);
}

/* --- Odeslání ---------------------------------------------------------- */

$subject = SUBJECT_PREFIX . $topic . ' — ' . $name;

$body = "Nová zpráva z kontaktního formuláře na stajmanon.cz\n"
    . str_repeat('-', 52) . "\n\n"
    . "Téma:    {$topic}\n"
    . "Jméno:   {$name}\n"
    . "E-mail:  {$email}\n"
    . "Telefon: " . ($phone !== '' ? $phone : '—') . "\n\n"
    . "Zpráva:\n{$message}\n\n"
    . str_repeat('-', 52) . "\n"
    . 'Odesláno: ' . date('j. n. Y H:i') . "\n"
    . 'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'neznámá') . "\n";

$headers = [
    'From: Web stajmanon.cz <noreply@stajmanon.cz>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail(RECIPIENT, $encodedSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(
        false,
        'Zprávu se nepodařilo odeslat. Napište nám prosím přímo na ' . RECIPIENT . '.',
        500
    );
}

respond(true, 'Děkujeme, zpráva byla odeslána. Ozveme se v nejkratším možném čase.');
