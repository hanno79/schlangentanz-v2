---
id: TF-SPEC-009
titel: Im Headless-Chromium bleibt die Spielanleitung ohne --disable-quic leer und lädt mit dem Schalter vollständig über HTTP/2.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5c-website-abgleich (PR #38)
grenzfall_von: TF-SPEC-005
---

## Worum es geht

Der Abgleich brach ab, weil die Seite im Headless-Chromium leer blieb. Als Ursache gilt, dass Chromium nach der Antwort `alt-svc: h3` auf QUIC wechselt und diese Anfragen auf diesem Netz hängen. Der Testfall prüft diese Erklärung an der echten Website.

## Bestanden, wenn

Ohne `--disable-quic` bleibt `#root` mindestens einmal leer, und Anfragen nach Skripten der Seite bleiben offen. Mit `--disable-quic` zeigt `#root` über 10'000 Zeichen, alle Antworten kommen über `h2`, und keine Anfrage bleibt offen.

## Fehlgeschlagen, wenn

Die Seite bleibt auch mit dem Schalter leer, oder sie lädt ohne Schalter in jedem Lauf vollständig (dann trägt die Erklärung nicht).

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Netz, auf dem der Fehler auftrat; Playwright-Chromium aus `node_modules` |

## Testdaten

Live-Seite `https://schlangentanz.ch/rules`, höchstens sechs Seitenaufrufe.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Terminal | Antwortkopf lesen | `curl -sI https://schlangentanz.ch/rules` | Zeile `alt-svc: h3=":443"` |
| 2 | Node-Skript ausserhalb des Repos | Seite mit `chromium.launch({ args: [] })` laden, bis 25 s auf Text in `#root` warten, offene Anfragen über `request`/`requestfinished`/`requestfailed` zählen, Protokolle über `performance` (`nextHopProtocol`) lesen | | `#root` 0 Zeichen, offene Anfragen auf `assets/*.js` und Bilder |
| 3 | dasselbe Skript | mit `args: ['--disable-quic']` wiederholen | | `#root` über 10'000 Zeichen nach wenigen Sekunden, nur `h2`, 0 offene Anfragen |
