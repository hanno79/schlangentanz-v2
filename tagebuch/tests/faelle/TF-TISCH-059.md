---
id: TF-TISCH-059
titel: Bei 320 × 568 bleiben die Knöpfe der Zugleiste mit den Möglichkeiten der Erweiterung frei und antippbar.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
aenderung: task/O10-erweiterung-tisch (PR #124)
grenzfall_von: TF-TISCH-055
---

## Worum es geht

320 × 568 ist schmaler als jede Geräteklasse der Abnahme (kleinste ist Handy hochkant mit 390 × 844). Die Erweiterung bringt zusätzliche Knöpfe in die Zugleiste: „Risiko spielen“, vier Boni des Korbs, vier Risiko-Aktionen. Geprüft wird, ob die Zugleiste dafür Platz bekommt oder ob „Deine Schlangen“ und „Deine Hand“ darüberliegen.

## Bestanden, wenn

Für jeden Knopf und jeden Satz der Zugleiste liegt an seinem Mittelpunkt kein anderes Element obenauf (`document.elementFromPoint`), und im Bild sind „Zug beenden“, „Ansehen“ und „Abbrechen“ ganz zu sehen.

## Fehlgeschlagen, wenn

An der Mitte eines Knopfs der Zugleiste liegt eine Schlange, eine Handkarte oder ein Gegner, oder im Bild überdeckt „Deine Schlangen“ oder „Deine Hand“ einen Knopf.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Dev-Server mit Testhooks (`npx vite --port 5191`), Stand ab Commit 77afb96, Playwright Chromium mit Touch |

## Testdaten

Fenster 320 × 568. Lagen: `korb-entfernen` nach Antippen von „Sonderkarte Schlangenkorb des Glücks“; `risiko-misserfolg` nach Antippen von „Risiko spielen“. Zum Vergleich dieselben Lagen im Stand von `origin/neuaufbau`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | `/spiel?szenario=korb-entfernen&tempo=sofort` öffnen | Fenster 320 × 568 | Tisch mit Zugleiste „Wähle eine Karte aus deiner Hand.“ |
| 2 | Deine Hand | Schlangenkorb antippen | | Zugleiste „Wähle einen der Boni des Schlangenkorbs.“ mit vier Boni |
| 3 | Zugleiste | „Abbrechen“ und „Zug beenden“ suchen | | beide Knöpfe ganz sichtbar, nicht von Karten überdeckt |
| 4 | Adresse | `/spiel?szenario=risiko-misserfolg&tempo=sofort` öffnen, „Risiko spielen“ antippen | | vier Risiko-Aktionen, „Wähle die Risiko-Aktion.“ und „Abbrechen“ frei |

## Technische Prüfung

Für jedes `button` und `p` unter `[aria-label="Zugleiste"]`: `document.elementFromPoint` an der Mitte muss das Element selbst oder ein Kind davon liefern.

## Nicht abgedeckte Grenzfälle

320 × 568 mit drei Gegnern ist nicht gemessen, ebenso Zoom 200 % in der Klasse Handy hochkant.
