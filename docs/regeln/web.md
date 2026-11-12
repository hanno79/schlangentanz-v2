# Vertiefung: Web und Frontend

Gilt zusätzlich zu den Kernregeln, sobald das Projekt eine Oberfläche hat.
Wird nur gelesen, wenn die Arbeit die Oberfläche betrifft.

## Zustände sind Pflichtfälle

Jede Ansicht, die Daten lädt, behandelt vier Zustände: Laden, Erfolg, Leer,
Fehler. Ein fehlender Leer- oder Fehlerzustand gilt als unfertig, nicht als
Detail.

## Zugänglichkeit

- Jede Aktion ist per Tastatur erreichbar; die Fokusreihenfolge folgt der
  Lesereihenfolge, und der Fokus bleibt sichtbar.
- Textkontrast mindestens 4.5:1, bei grossem Text 3:1.
- Interaktive Elemente tragen einen zugänglichen Namen — Symbolschaltflächen
  brauchen ein Label, kein Tooltip allein.
- Farbe ist nie der einzige Träger einer Information.

## Texte

Keine Anzeigetexte hart im Code verstreuen. Auch ohne Übersetzung gehören sie
an eine Stelle, damit Wortlaut und Tonfall einheitlich bleiben.

## Abnahme

Eine Oberflächenänderung ist erst fertig, wenn sie im Browser geprüft wurde:
Funktion und Plausibilität der angezeigten Werte. Codelesen ersetzt das nicht.
Geprüft wird in der schmalsten unterstützten Breite und in der üblichen.

## Design

Palette, Schrift und Komponentenkonventionen stehen in `DESIGN.md`.
