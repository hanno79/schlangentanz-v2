---
id: TF-TISCH-002
titel: Dreht man das Handy, während eine deiner Schlangen seitlich gescrollt ist, bleiben deine Schlangen ganz zu sehen und die Seite scrollt nicht waagrecht.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
grenzfall_von: TF-TISCH-001
---

## Worum es geht

Auf dem Handy hochkant stehen deine Schlangen unten, quer stehen sie rechts neben der Tischfläche. Wer das Handy dreht, nachdem er in einer Schlange seitlich gewischt hat, soll danach nichts abgeschnitten sehen.

## Bestanden, wenn

Vor dem Drehen (390 × 844), nach dem Drehen (844 × 390) und nach dem Zurückdrehen gilt: `scrollWidth` gleich `clientWidth`, „Deine Schlangen“ hält in der Höhe nichts zurück (`scrollHeight − clientHeight` ≤ 1), jedes Bild in „Deine Schlangen“ liegt in der Höhe ganz im Bereich, und die fünf Handkarten liegen ganz im Fenster.

## Fehlgeschlagen, wenn

Nach einer Drehung ist ein Bild deiner Schlangen oben oder unten angeschnitten, der Bereich scrollt senkrecht, eine Handkarte ragt aus dem Fenster oder die Seite wird breiter als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontext „handy-hochkant“ aus `scripts/pruefung/geraeteklassen.mjs` |
| Ausgangslage | Spielstand `volltisch()` im Local Storage, `/spiel` geöffnet |

## Testdaten

Szenario `volltisch()`; deine erste Schlange vor dem Drehen um 30 px nach rechts gescrollt.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Deine Schlangen | erste Schlange seitlich scrollen | 30 px | `scrollLeft` 30 |
| 2 | Konsole | Lage messen | | nichts angeschnitten |
| 3 | Browser | Fenster auf Querformat setzen (`setViewportSize`) | 844 × 390 | dein Platz rechts, Lage messen |
| 4 | Browser | zurück auf Hochformat | 390 × 844 | Lage messen |

## Zurücksetzen

Browserkontext schliessen.
