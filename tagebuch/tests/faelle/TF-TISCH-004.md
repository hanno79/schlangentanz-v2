---
id: TF-TISCH-004
titel: Auf einem sehr flachen Handy quer (568 × 320) bleiben Kopfleiste und deine Schlangen ganz zu sehen.
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

Ältere kleine Handys sind quer nur 568 × 320 gross. Das liegt unter allen fünf Geräteklassen. Die Tischfläche links wird dort sehr schmal, und für deine Schlangen bleibt wenig Höhe. Der Fall zeigt, wo das Layout an seine Grenze kommt.

## Bestanden, wenn

Bei 568 × 320 mit Touch, im Volltisch:

- Die Kopfleiste zeigt „Zur Lobby“ ganz, und kein Text überlagert einen anderen.
- „Deine Schlangen“ hält in der Höhe nichts zurück (`scrollHeight − clientHeight` ≤ 1).
- Die Tischfläche schneidet seitlich nichts ab (`scrollWidth` ≤ `clientWidth` + 1).

## Fehlgeschlagen, wenn

„Zur Lobby“ ist abgeschnitten, Texte in der Kopfleiste liegen übereinander, deine Schlangen halten Höhe zurück, oder die Tischfläche schneidet seitlich Inhalt ab.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontext „handy-hochkant“ (Touch) mit Fenster 568 × 320 |
| Ausgangslage | Spielstand `volltisch()` im Local Storage |

## Testdaten

Szenario `volltisch()` aus `src/ui/tisch/__tests__/szenarien.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand legen, `/spiel` bei 568 × 320 öffnen | | dein Platz rechts |
| 2 | Kopfleiste | Foto ansehen | | „Zur Lobby“ ganz, Texte getrennt |
| 3 | Konsole | `scrollHeight` und `clientHeight` von „Deine Schlangen“ lesen, dazu `scrollWidth` und `clientWidth` von `.st-flaeche` | | nichts zurückgehalten, nichts seitlich abgeschnitten |

## Zurücksetzen

Browserkontext schliessen.
