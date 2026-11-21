---
id: TF-ENGINE-044
titel: In Zufallspartien, in denen Regenbogenschlange, Blockade und Farbkarten beim Gegner oft vorkommen, lässt sich jeder Schritt aus den Ereignissen nachrechnen, kein Ereignis nennt eine Handkarte, und keine Invariante bricht.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E5-legen (PR #66)
---

## Worum es geht

Die Oberfläche soll die Wirkung jeder Karte aus den Ereignissen ablesen, ohne Zustände zu vergleichen (Plan E2 Kriterium 11, E4b), und kein Ereignis darf eine verdeckte Karte verraten (B2). Die Zufallspartien der Suite wählen gleichverteilt; hier werden die neuen Aktionen bevorzugt, damit sie sicher oft vorkommen.

## Bestanden, wenn

In 30 Partien (Saaten 101 bis 130, 2 bis 4 Spieler, mit und ohne Erweiterung) ergibt `spieleNach(lageVon(vorher), ereignisse)` bei jedem Schritt `lageVon(nachher)`, `verrateneHandkarten` ist leer, keine Invariante ist verletzt, und es kommen mindestens je 10 RegenbogenschlangeLegen, BlockadeLegen und Farbkarten in fremde Schlangen vor. Gemessen: 115, 84 und 1'183, dazu 12 Abwehren.

## Fehlgeschlagen, wenn

Ein Schritt sich nicht nachrechnen lässt, ein Ereignis eine Handkarte nennt, eine Invariante bricht oder eine der neuen Aktionen weniger als zehnmal vorkommt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf `206ca15`, `npm ci` gelaufen, `git status` leer |

## Testdaten

Prüfdatei `zz_pruefer_e5.test.ts` aus dem Beleg des Laufs, Abschnitt „Zufallspartien“: Mit Wahrscheinlichkeit 0,7 wird unter den angebotenen RegenbogenschlangeLegen und BlockadeLegen gewählt, sonst unter allen Aktionen.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Prüfdatei anlegen | Inhalt aus dem Beleg nach `src/engine/__tests__/zz_pruefer_e5.test.ts` | nur diese Datei neu |
| 2 | Konsole im Repo | Zufallspartien ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_e5.test.ts -t Zufallspartien --silent=false` | 1 grün, Zeile „Zähler: …“ mit Werten über 10 |
| 3 | Konsole im Repo | Prüfdatei löschen | `rm src/engine/__tests__/zz_pruefer_e5.test.ts` | `git status` leer |

## Nicht abgedeckte Grenzfälle

Schlangenfrass, Farbendieb, Farbenfusion und Häutung sind auf diesem Stand Platzhalter und kommen nicht vor; ihre Ereignisse prüfen E6 bis E9. Unter hoher Last kann der Test die Vorgabe von 5 s überschreiten; dann ist es eine Zeitüberschreitung, kein roter Befund.
