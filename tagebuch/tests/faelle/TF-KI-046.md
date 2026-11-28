---
id: TF-KI-046
titel: Hält die solide KI die Farbkarte, die eine Aufgabe erfüllt, setzt sie diese Karte nicht mit Risiko-Aktion 2 aufs Spiel, wenn das nach ihrer eigenen Rechnung schlechter ist als die Erfüllung.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-28
veraendert_daten: nein
aenderung: task/K4-ki-erweiterung (PR #125)
skript: src/ki/strategien/solideKi_erweiterung_partien.test.ts
grenzfall_von: TF-KI-039
---

## Worum es geht

Plan K4, Kriterium 1: Fehlt der KI eine Karte zu einer Aufgabe und hält sie sie, spielt sie sie, ausser ein anderer Zug ist nachweislich besser bewertet. Ein Sonderfall ist die Risiko-Karte mit Aktion 2: Die KI benennt eine Farbkarte ihrer Hand, und bei Misserfolg darf der begünstigte Gegner genau diese Karte nehmen (D52). Benennt sie die Karte, die die Aufgabe erfüllt, verliert sie die Aufgabe bei Misserfolg.

## Bestanden, wenn

In jeder Stellung, in der eine Farbkarte der Hand eine offene oder die eigene geheime Aufgabe sofort erfüllt und die KI stattdessen Risiko-Aktion 2 spielt, liegt der Erwartungswert ihres ganzen Zuges über jede ungesehene Karte als oberste Stapelkarte über dem Wert der Erfüllung samt bester zweiter Karte, und zwar auch dann, wenn der Begünstigte die benannte Karte nimmt.

## Fehlgeschlagen, wenn

Der Erwartungswert des Zuges mit der Risiko-Karte liegt unter dem Wert der Erfüllung, etwa 15.31 gegen 18.64 in Saat 6'500'012.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K4-ki-erweiterung`, `npm ci` gelaufen |

## Testdaten

Partiesaaten 6'200'000 bis 6'200'039 und 6'500'000 bis 6'500'039, Spielerzahl 2 + (Nummer mod 3), bei gerader Nummer die solide KI an allen Sitzen, sonst an Sitz 0 gegen Zufalls-KIs; KI-Saat je Sitz (Saat × 31 + Sitz × 97 + 7). Einzelstellungen Saat 6'500'012 (Sitz 1) und 6'200'031 (Sitz 0) im Beleg.

## Technische Prüfung

Die Proben `aufgaben2.test.ts` und `fall.test.ts` aus dem Beleg nach `src/ki/__pruefer__/` legen, mit `PRUEF_ZIEL`, `PRUEF_BASIS`, `PRUEF_ANZAHL`, `PRUEF_AUS` beziehungsweise `PRUEF_SAAT`, `PRUEF_SITZ`, `PRUEF_GEWAEHLT` über `npx vitest run` ausführen und danach löschen. Für jede ungesehene Karte legt die Probe sie oben auf den Stapel, spielt die Risiko-Karte, lässt den Gegner die benannte Karte oder die Stapelkarte wählen und den Rest des Zuges die solide KI spielen; bewertet wird mit `bewerte` plus `aufgabenwert` auf dem echten Zustand.

## Nicht abgedeckte Grenzfälle

Risiko-Aktion 3 mit einer Schlangenkarte, deren Tausch eine Aufgabe zerstören könnte, kam in den Partien nicht vor und ist nicht eigens geprüft. Wie ein menschlicher Gegner bei Misserfolg wählt, hängt von ihm ab; geprüft sind beide Wahlen.
