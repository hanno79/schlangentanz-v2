---
id: TF-TISCH-038
titel: Musst du wegen einer Schlangengrube aussetzen, sagen es Protokoll und Zugleiste, und die Partie läuft ohne dich weiter, bis du wieder dran bist.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
aenderung: task/O6-gegnerzuege (PR #79)
---

## Worum es geht

Liegt eine Schlangengrube vor dir, verfällt dein nächster Zug (A7.6). Die Oberfläche darf dabei nicht stehen bleiben und muss sagen, warum du übersprungen wurdest.

## Bestanden, wenn

Ohne Klick spielt KI-Gegner 1 weiter. Im Protokoll steht „Du setzt diesen Zug aus (Schlangengrube).“, und die Zugleiste zeigt den gelben Hinweis „Du hast wegen der Schlangengrube einen Zug ausgesetzt.“. Danach steht in der Statuszeile „Du bist dran“, der Hinweis bleibt sichtbar und verschwindet, sobald du eine Karte gespielt hast.

## Fehlgeschlagen, wenn

Die Partie bleibt stehen, das Aussetzen steht weder im Protokoll noch in der Zugleiste, oder der Hinweis bleibt nach deiner ersten Karte stehen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit fde8e51 |

## Testdaten

Szenario `grube-vor-dir`: zwei Spieler, vor dir liegt eine Schlangengrube von KI-Gegner 1, er ist am Zug.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=grube-vor-dir` | „KI-Gegner 1 ist dran“, „Schneller“ in der Zugleiste |
| 2 | Tisch | einige Sekunden zusehen | | Protokoll „Du setzt diesen Zug aus (Schlangengrube).“, gelber Hinweis in der Zugleiste, danach „Du bist dran“ |
| 3 | Deine Hand | eine Farbkarte, ein Ziel und „Ausführen“ wählen | | der gelbe Hinweis ist weg |

## Nicht abgedeckte Grenzfälle

Zwei Gruben vor dir prüft TF-TISCH-041. Eine Grube in der Schlussrunde (D21, D29) ist nicht eigens geprüft, weil kein Szenario dafür besteht; die Engine-Tests zu D21 und D29 decken die Regel ab.
