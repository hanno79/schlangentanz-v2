---
id: TF-DEV-056
titel: Die sechs Szenarien des Schlangenkorbs am Entwicklertisch zeigen mit echten Klicks das beschriebene Verhalten.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
aenderung: task/X6-schlangenkorb (PR #116)
---

## Worum es geht

Jedes Szenario `korb-ziehen`, `korb-tauschen`, `korb-entfernen`, `korb-aktionen`, `korb-letzte-karten` und `korb-zweiter-zug` beschreibt, was nach den Klicks zu sehen sein muss. Der Tester klickt es nach und vergleicht.

## Bestanden, wenn

In jedem Szenario stimmen Knöpfe, Lage und Ereignisse mit dem Feld „Erwartet“ überein, und nach jedem Schritt steht „Invarianten (alle erfüllt)“, ohne Konsolenfehler.

## Fehlgeschlagen, wenn

Ein Knopf fehlt oder ist zu viel, ein Wert in Lage oder Ereignis weicht ab, eine Invariante ist verletzt oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build von 14eaa6cb, `vite preview --outDir dist-testhooks --port 4191` |

## Testdaten

Die Szenarien aus `src/entwicklung/szenarienKorb.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=korb-ziehen` | „→ ziehen“, dann Blau, Rot, Gelb je „→ schlange-1 ende“ | | nur der Verdoppler wirkungslos; danach nur „ZugBeenden“, 3 Farbkarten, 1 Sonderkarte |
| 2 | `/dev?szenario=korb-tauschen` | Tausch „Feuerkeim (rot-08) Sonnenblatt (gelb-15)“ | | 12 Tausch-Knöpfe; Schlange Blau, Gelb, Blau; Hand Rot, Grün |
| 3 | `/dev?szenario=korb-entfernen` | eigene Blockade entfernen; „Von vorn“; Fusion des Gegners entfernen, einmal „abwehren“, einmal „durchlassen“ | | abgewehrt: „ohne Wirkung … → aus dem Spiel“; durchgelassen: Fusion auf Ablage Spieler 1, gelb-15 und gelb-05 einzeln |
| 4 | `/dev?szenario=korb-aktionen` | „→ aktionen“, Fusion auf Grün-Grün, „ZweiAbwerfenDreiZiehen: Feuerkeim, Verdoppler“, Blau anlegen | | zweite Fusion nur wirkungslos; KartenAbgeworfen, KartenGezogen; danach nur ZugBeenden |
| 5 | `/dev?szenario=korb-letzte-karten` | „→ ziehen“, Rot neue Schlange, Gelb anlegen, ZugBeenden, zweimal „KI-Schritt (solide)“ | | „SchlussrundeBegonnen: ausgelöst von Spieler 1“, kein Nachziehen, „PartieBeendet“ |
| 6 | `/dev?szenario=korb-zweiter-zug` | eigene Blockade entfernen | | nur „tauschen“ und „entfernen“ angeboten; Teilzug 2 |

## Nicht abgedeckte Grenzfälle

Andere Geräteklassen: der Entwicklertisch ist ein Prüfwerkzeug für Desktop.
