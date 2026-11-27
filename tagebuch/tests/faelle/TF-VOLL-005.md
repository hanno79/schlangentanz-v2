---
id: TF-VOLL-005
titel: Die Prüfungen des Vollpartie-Laufs schlagen an, wenn die App falsch wertet, eine fremde Karte verrät, zwei Schritte auf einmal speichert oder auf der Wertung wirft.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: tests/vollpartien/vollpartie.spec.ts
aenderung: task/Z1-vollpartien (PR #123)
---

## Worum es geht

Ein grüner Lauf sagt nur etwas, wenn er bei einem Fehler der App rot wird. Dafür wird je ein Fehler in den Quellcode der App gebaut, der Lauf ausgeführt und der Code danach zurückgesetzt. Zusätzlich wird geprüft, dass die Konfiguration für eine Vercel-Vorschau vorbereitet ist und kein Geheimnis im Repo steht.

## Bestanden, wenn

Jeder der vier eingebauten Fehler macht den Lauf rot, mit einer Meldung, die zum Fehler passt: falscher Platz bei Gleichstand („Wertung von KI-Gegner 3: Platz“, erwartet „1.“, erhalten „2.“), eine fremde Handkarte in einem Attribut ab Stapel unter 50 („Verborgene Karten im Seitenquelltext“ in Schritt 74 und 92), KI legt und beendet in einem gespeicherten Schritt („Keine der 13 Aktionen“), ungefangener Wurf auf der Wertung („Konsolenfehler“, „Ungefangen: …“). Nach jedem Versuch ist `git status` leer. `Z1_BASIS_URL` und `Z1_VERCEL_SCHUTZ` stehen ohne Wert in `.env.example`, und `git grep` findet keinen Wert für das Geheimnis.

## Fehlgeschlagen, wenn

Ein eingebauter Fehler lässt den Lauf grün, die Meldung passt nicht zum Fehler, oder im Repo steht ein Wert für das Geheimnis.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Quellstand ab Commit 2ad2cfde, eigener Produktionsbuild auf Port 4175 |

## Testdaten

Die vier Eingriffe: `src/ui/spiel/ergebnisAnsicht.ts` Platz mit Gleichstandsbruch nach Spieler-Id; `src/ui/spiel/tischAnsicht.ts` und `src/ui/tisch/Gegner.tsx` mit `data-pruefer` aus der letzten Handkarte eines Gegners, sobald der Stapel unter 50 Karten hat; `src/ui/spiel/useSpiel.ts` hängt an „FarbkarteLegen“ eines KI-Gegners gleich dessen „ZugBeenden“; `src/ui/ergebnis/Ergebnis.tsx` mit `queueMicrotask(() => { throw … })`.

## Technische Prüfung

Je Eingriff `npx playwright test --config playwright.vollpartien.config.ts --project desktop` oder `--project handy-hochkant`, Exit-Code 1 und die Meldung lesen, dann `git checkout -- <datei>`. Für die Vorschau: `git grep -n -i -E "x-vercel|Z1_VERCEL_SCHUTZ|protection.bypass"` zeigt nur Namen, Doku und den Testwert `geheim` in `tests/vollpartien.test.ts`.

## Nicht abgedeckte Grenzfälle

Den Lauf gegen eine echte, geschützte Vorschau startet der Nutzer mit seinem Geheimnis selbst; der Prüfer fasst kein Geheimnis an.
