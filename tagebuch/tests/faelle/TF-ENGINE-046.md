---
id: TF-ENGINE-046
titel: In Zufallspartien mit Erweiterung, in denen die Schlangenhäutung bevorzugt gespielt wird, lässt sich jeder Schritt aus den Ereignissen nachrechnen, kein Ereignis nennt eine Handkarte, und die Aufzählung bleibt schnell.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E9-haeutung (PR #69)
---

## Worum es geht

Die Schlangenhäutung ordnet Karten innerhalb einer Schlange um. Die Oberfläche muss das allein aus den Ereignissen nachvollziehen können (E4b), auch in Schlangen mit Farbenfusion. In langen Schlangen zählt die Engine viele Umordnungen auf; hier wird auch gemessen, ob Aufzählung und KI-Schritt dabei schnell bleiben.

## Bestanden, wenn

Alle 60 Partien (Saaten 7919 bis 475140 in Schritten von 7919, je 2, 3 und 4 Spieler) enden. Jeder Schritt lässt sich mit `spieleNach` nachrechnen, `verrateneHandkarten` bleibt leer, keine Invariante ist verletzt. Es gibt mehr als 30 gewirkte Häutungen, mindestens eine Abwehr und mindestens eine Häutung in einer Schlange mit Farbenfusion. `ermittleAktionen` braucht in keinem Zustand mehr als 50 ms, ein KI-Schritt im Zustand mit den meisten Aktionen weniger als 50 ms.

## Fehlgeschlagen, wenn

Ein Schritt lässt sich nicht nachrechnen (Meldung mit Saat und Schritt), ein Ereignis nennt eine Handkarte, eine Invariante ist verletzt, eine Partie endet nicht nach 5'000 Schritten, oder eine der Zeiten liegt über der Grenze.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Worktree auf `task/E9-haeutung`, Stand ab Commit `d750cda`, `npm ci` gelaufen |
| Ausgangslage prüfen | `git status` leer |

## Testdaten

Prüfskript `zz_pruefer_e9.test.ts`, als Beleg des Laufs abgelegt (Teile M1 und M2). M1 wählt in jedem Schritt mit 85 % eine aufgezählte Schlangenhäutung, wenn es eine gibt, sonst zufällig unter allen aufgezählten Aktionen. M2 baut einen ungünstigen Tisch: 3 Spieler mit je zwei Schlangen aus 12 und 9 Farbkarten in sechs Farben, Spieler 1 hält 3 Schlangenhäutungen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg nach `src/engine/__tests__/zz_pruefer_e9.test.ts` kopieren und den Pfad in `MESS` auf eine Datei ausserhalb des Repos setzen | – | Datei neu, sonst nichts geändert |
| 2 | Konsole im Repo | ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e9.test.ts` | Exit 0, 10 Tests bestanden |
| 3 | Datei aus `MESS` | lesen | – | Zeile „M1“ mit `gewirkt` über 30, `abgewehrt` und `mitFusion` über 0, `ermittleAktionen max` unter 50 ms; Zeile „M1: KI-Schritt“ unter 50 ms; Zeile „M2“ mit der Zahl der Aktionen |
| 4 | Konsole im Repo | Prüfskript löschen | – | `git status` leer |

## Nicht abgedeckte Grenzfälle

Partien ohne Erweiterung enthalten keine Schlangenhäutung und laufen hier nicht. Ob die KI die Häutung klug einsetzt, ist Sache von K2/K3. Wie die Oberfläche mit Tausenden von Knöpfen umgeht, prüft TF-DEV-034.
