---
id: TF-KI-036
titel: Unter /spiel spielt der KI-Gegner nach K5 mehrere Züge mit der soliden KI, ohne Konsolenfehler und ohne waagrechtes Scrollen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
aenderung: task/K5-staerkenachweis (PR #122)
---

## Worum es geht

K5 trägt eine neue Strategie in die Registry ein, aus der auch die App ihren KI-Gegner holt. Geprüft wird, dass eine Partie im Produktionsbuild weiter mit der soliden KI läuft und nicht etwa mit „erste erlaubte Aktion“.

## Bestanden, wenn

Nach vier eigenen Zügen hat KI-Gegner 1 in jedem seiner Züge eine Karte gespielt, und das Protokoll führt sie auf. Die Züge sind sinnvoll: Er legt Farbkarten an eigene Schlangen oder beginnt neue, und er frisst ein eigenes Paar des Menschen, wenn er Schlangenfrass hat. Der Stapel sinkt von 98. Die Konsole zeigt keine Fehler, `scrollWidth` ist gleich `clientWidth` (1'280).

## Fehlgeschlagen, wenn

Der KI-Gegner bleibt stehen, die Seite meldet einen Fehler, die Konsole zeigt einen Fehler, oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`npm run build`), `npx vite preview --port 4296 --strictPort` |
| Ausgangslage prüfen | `http://localhost:4296/` zeigt die Lobby mit „Neue Partie“; localStorage leer |

## Testdaten

Lobby: 1 Gegner, Erweiterung aus.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“ klicken |  | Spieltisch, „Du bist dran“, Stapel 98 |
| 2 | Spieltisch | eine Farbkarte der Hand wählen, „Neue Schlange“ oder „Deine Schlange 1: Ende“, „Ausführen“, „Zug beenden“ |  | KI-Gegner 1 ist dran, danach wieder „Du bist dran“ |
| 3 | Spieltisch | bei einer Ansage „Durchlassen“ klicken |  | Protokoll nennt die Wirkung |
| 4 | Spieltisch | Schritte 2 und 3 viermal wiederholen |  | Protokoll mit Zügen von KI-Gegner 1, Stapel sinkt |
| 5 | Konsole des Browsers | Fehler lesen, `scrollWidth` und `clientWidth` messen |  | keine Fehler, 1'280 gleich 1'280 |

## Nicht abgedeckte Grenzfälle

Touch-Geräte entfallen, weil K5 keine Oberfläche ändert. Partien mit 2 und 3 Gegnern und mit Erweiterung prüft der Stärkenachweis selbst ohne Oberfläche.
