---
id: TF-REGELN-003
titel: Die Grossansicht einer Karte öffnet mit Tippen, Klick oder Enter, schliesst mit Knopf, Escape oder Tippen daneben, und der Fokus kehrt zur Karte zurück.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O9-regelhilfe (PR #37)
---

## Worum es geht

Die Grossansicht zeigt das Kartenbild und daneben oder darunter den Text der Karte. Sie muss mit Maus, Finger und Tastatur gleich gut gehen, lange Texte müssen scrollen, und die Karte muss gross genug zum Lesen sein.

## Bestanden, wenn

Der Dialog liegt ganz im Fenster, ohne waagrechten Überstand. Die Karte ist mindestens 280 px breit oder, wo das Fenster zu niedrig ist, so breit, wie die Fensterhöhe abzüglich 48 px zulässt (Handy quer 220 px). Der Text von Risiko-Belohnung lässt sich bis zum letzten Punkt scrollen. Nach jedem Schliessen liegt der Fokus wieder auf dem Kartenknopf.

## Fehlgeschlagen, wenn

Ein Weg zum Öffnen oder Schliessen wirkt nicht, der Dialog ragt über den Rand, der Text endet abgeschnitten, oder der Fokus landet nach dem Schliessen anderswo.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright Chromium in den fünf Geräteklassen |

## Testdaten

Karten Risiko-Belohnung (längster Text), Schlangenhäutung, Lila Riese, Blau.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/regeln`, „Alle Karten“ | Risiko-Belohnung antippen (Desktop: klicken) | | Dialog mit Bild und Text, Fokus auf „Schliessen“ |
| 2 | Dialog | Text bis zum Ende scrollen, „Schliessen“ antippen | | letzter Punkt „Freie Wahl bei Misserfolg …“ sichtbar, Fokus auf „Risiko-Belohnung: Text zeigen“ |
| 3 | `/regeln` | Schlangenhäutung öffnen, Escape drücken | | Dialog zu, Fokus zurück |
| 4 | `/regeln` | Lila Riese öffnen, neben den Dialog tippen | | Dialog zu, Fokus zurück |
| 5 | `/regeln`, Desktop | mit Tab zu „Blau“, Enter | | Dialog offen |

## Nicht abgedeckte Grenzfälle

Doppeltipp auf eine Karte und Neuladen mit offener Grossansicht: geprüft im Prüfprotokoll O9 (ein Dialog, nach Neuladen keiner), ohne eigenen Testfall.
