---
id: TF-VOLL-002
titel: Zwei Läufe hintereinander und Desktop gegen Handy spielen dieselben Partien Stand für Stand.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: nein
skript: tests/vollpartien/vollpartie.spec.ts
aenderung: task/Z1-vollpartien (PR #123)
grenzfall_von: TF-VOLL-001
---

## Worum es geht

Feste Saaten nützen nur, wenn jeder Lauf genau dieselbe Partie spielt. Geprüft wird, ob zwei Läufe nacheinander und die beiden Geräte dieselbe Folge gespeicherter Stände ergeben; eine gleiche Endwertung allein könnte auch zufällig entstehen.

## Bestanden, wenn

Zwei Läufe von `npm run test:vollpartien` nacheinander berichten je Test dieselbe Zahl Schritte und dieselbe Endwertung. Ein Mitschnitt aller gespeicherten Stände hat für Desktop und Handy hochkant dieselbe SHA-256-Prüfsumme, zu zweit wie zu viert.

## Fehlgeschlagen, wenn

Schritte, Endwertung oder Prüfsumme des Mitschnitts unterscheiden sich zwischen zwei Läufen oder zwischen Desktop und Handy.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Quellstand ab Commit 2ad2cfde, eigener Produktionsbuild auf Port 4175 |

## Testdaten

Saaten 2026 (zu zweit) und 13 (zu viert).

## Technische Prüfung

Zweimal `npx playwright test --config playwright.vollpartien.config.ts --reporter=json`, die Annotationen `Z1` vergleichen. Für den Mitschnitt eine vorübergehende Spec neben `vollpartie.spec.ts`, die dieselbe Schleife spielt und nach jedem Schritt `serialisiere(neu)` in eine JSON-Datei ausserhalb des Repos schreibt; danach wird sie gelöscht. Erwartet: Prüfsummen `ee043a0d…` (zu zweit) und `2e99cc71…` (zu viert) je auf beiden Geräten gleich.
