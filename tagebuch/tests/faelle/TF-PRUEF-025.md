---
id: TF-PRUEF-025
titel: Der Wächter „kein Bedienelement liegt außerhalb des Bildes“ meldet auch Segmente und Schalter, deren Auswahlfeld unsichtbar ist.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O2b-lobby-flach (PR #35)
---

## Worum es geht

Die Lobby zeichnet die Gegnerzahl als Segmente und die Erweiterung als Schalter. Getippt wird jeweils das Label; Radio und Kästchen sind 1 × 1 px gross und unsichtbar. `findeAusserhalbDesBildes` in `tests/layout/messung.ts` sucht nur `button, a[href], [role="button"], input, select` und überspringt Elemente unter 2 px. Rutscht ein Schalter unter den Bildrand, sieht der Wächter das dann nicht.

## Bestanden, wenn

Nach dem Verschieben des Schalters unter den Bildrand (`.lobby__schalter { position: relative; top: 400px; }` am Ende von `src/ui/lobby/lobby-seite.css`; bis Iteration 1 hiess die Klasse `.schalter`) schlägt in `handy-quer` mindestens ein Lobby-Vertrag „kein Bedienelement liegt außerhalb des Bildes“ fehl und nennt „Mit Erweiterung“.

## Fehlgeschlagen, wenn

Alle Lobby-Verträge in `handy-quer` bleiben grün, obwohl der Schalter bei 577..621 px in einem 390 px hohen Fenster liegt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Stand mit `src/ui/lobby/lobby-seite.css` (ab O2b), Ports 4173 und 4174 frei |
| Ausgangslage | `git status` leer |

## Testdaten

Eine Zeile CSS: `.lobby__schalter { position: relative; top: 400px; }` (bis Iteration 1 hiess die Klasse `.schalter`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole | Zeile ans Ende von `src/ui/lobby/lobby-seite.css` hängen | | |
| 2 | Konsole | Lobby-Verträge in Handy quer laufen lassen | `npx playwright test tests/layout/lobby.spec.ts --project=handy-quer` | Exit-Code und Name des roten Vertrags |
| 3 | Browser | Produktionsbuild bei 844×390 öffnen und messen | `getBoundingClientRect()` von `label.lobby__schalter` | liegt unter 390 px |

## Zurücksetzen

`git checkout -- src/ui/lobby/lobby-seite.css`, danach `git status` leer.

## Nicht abgedeckte Grenzfälle

Segmente unter dem Bildrand und ein zugedecktes Schalter-Label: TF-PRUEF-026. Ein sichtbares Eingabefeld, dessen Label nur vorgelesen wird: TF-PRUEF-027.
