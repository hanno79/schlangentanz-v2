---
id: TF-PROBE-002
titel: Auf und neben den Grenzen 600 und 1024 wechselt die Anzeige ohne Neuladen richtig, und erst Neuladen setzt den Zähler zurück.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: probe/PROBE-1-geraeteklasse (59a50e2)
grenzfall_von: TF-PROBE-001
---

## Worum es geht

Die Festlegung zieht die Grenzen bei 600 und 1024 Pixeln, und genau dort passieren die typischen Fehler um eins. Geprüft wird im echten Browser, ob sich die Anzeige beim Ändern der Fensterbreite sofort anpasst. Der Zähler „Messungen“ zeigt dabei, dass die Seite nicht neu geladen wurde.

## Bestanden, wenn

Nach einem Klick auf „Neu messen“ (Zähler 1) zeigt die Seite bei 1025 px „Desktop“, bei 1024 px „Tablet“, bei 600 px „Tablet“, bei 599 px „Handy“, bei 320 px „Handy“ und bei 1280 px wieder „Desktop“; „Breite“ nennt jedes Mal genau die eingestellte Zahl und „Messungen: 1“ bleibt stehen. Nach dem Neuladen steht „Messungen: 0“.

## Fehlgeschlagen, wenn

Bei 600 steht „Handy“, bei 1024 „Desktop“, bei 1025 „Tablet“ oder bei 599 „Tablet“; die Anzeige ändert sich erst nach einem Neuladen; oder der Zähler springt beim Ändern der Breite auf 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit 59a50e2 auf `http://localhost:4173/probe` |
| Ausgangslage prüfen | Browser ohne Touch, Fenster 1280×900, Seite zeigt „Messungen: 0“ |

## Testdaten

Fensterbreiten in dieser Reihenfolge: 1025, 1024, 600, 599, 320, 1280 (Höhe immer 900).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Seite `/probe`, 1280×900 | „Neu messen“ einmal klicken | | „Messungen: 1“ |
| 2 | Fenstergrösse (Entwicklerwerkzeuge oder Playwright `setViewportSize`) | Breite setzen, nicht neu laden | 1025 | „Geräteklasse: Desktop“, „Breite: 1025 px“, „Messungen: 1“ |
| 3 | Fenstergrösse | Breite setzen | 1024 | „Geräteklasse: Tablet“, „Breite: 1024 px“, „Messungen: 1“ |
| 4 | Fenstergrösse | Breite setzen | 600 | „Geräteklasse: Tablet“, „Breite: 600 px“, „Messungen: 1“ |
| 5 | Fenstergrösse | Breite setzen | 599 | „Geräteklasse: Handy“, „Breite: 599 px“, „Messungen: 1“ |
| 6 | Fenstergrösse | Breite setzen | 320 | „Geräteklasse: Handy“, „Breite: 320 px“, „Messungen: 1“ |
| 7 | Fenstergrösse | Breite setzen | 1280 | „Geräteklasse: Desktop“, „Breite: 1280 px“, „Messungen: 1“ |
| 8 | Browser | Seite neu laden (F5) | | „Geräteklasse: Desktop“, „Messungen: 0“ |
