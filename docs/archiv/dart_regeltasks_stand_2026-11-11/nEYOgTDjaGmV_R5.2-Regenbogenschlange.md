# R5.2: Regenbogenschlange

- id: nEYOgTDjaGmV
- Typ: Task
- Status: Done
- Tags: Regelwerk, Sonderkarten
- Priorität: Critical
- parentId: mOgZfYM4nHhP
- createdAt: 2026-01-04T13:23:53.485896-08:00
- updatedAt: 2026-05-27T05:45:22.988756-07:00
- completedAt: 2026-05-27T05:45:22.980945-07:00
- htmlUrl: https://app.dartai.com/t/nEYOgTDjaGmV-R5-2-Regenbogenschlange
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Sonderkarte: Regenbogenschlange

Anzahl im Deck: 4 Stück

---

## Effekt

Die Regenbogenschlange ist ein Joker, der als JEDE beliebige Farbe zählt.

---

## Durchführung Schritt für Schritt

1. Der Spieler spielt die Regenbogenschlange aus seiner Hand
2. Die Karte wird IN die Schlange eingebaut (wie eine Farbkarte)
3. Die Regenbogenschlange nimmt automatisch die Farbe der angrenzenden Karten an
4. Bei zwei verschiedenen angrenzenden Farben wählt der Spieler, welche Farbe sie annimmt
5. Die gewählte Farbe bleibt für den Rest des Spiels fix

---

## Besonderheiten

- EINZIGE Sonderkarte, die in eine Schlange eingebaut wird
- Zählt für Farbgruppen-Bildung mit
- Hat KEINEN eigenen Punktwert (0 Punkte)
- Kann eine Farbgruppe vervollständigen oder verlängern
- Ist flexibel einsetzbar bei schwierigen Farbsituationen

---

## Farbbestimmung

- Wenn links UND rechts dieselbe Farbe: Nimmt diese Farbe an
- Wenn links und rechts verschiedene Farben: Spieler wählt EINE
- Wenn am Ende der Schlange (nur eine Seite belegt): Nimmt die Farbe der angrenzenden Karte
- Wenn allein (neue Schlange): Spieler wählt bei Anlegen der nächsten Karte

---

## Use Cases

- UC-R5.2-A: Gruppe vervollständigen - Rot-Rot-Regenbogen = gültige 3er-Gruppe
- UC-R5.2-B: Zwischen zwei Farben - Rot-Regenbogen-Blau, Spieler wählt Rot
- UC-R5.2-C: Aufgabe erfüllen - Regenbogen hilft bei Farbvielfalt-Aufgabe
- UC-R5.2-D: Am Schlangenende - Regenbogen am Schwanz, nimmt Farbe der vorletzten Karte
- UC-R5.2-E: Neue Schlange - Regenbogen startet Schlange, Farbe wird später bestimmt

---

## Akzeptanzkriterien

- Regenbogenschlange wird IN die Schlange gelegt (nicht auf Ablagestapel)
- Farbwahl wird bei Bedarf abgefragt
- Gewählte Farbe bleibt permanent
- Punktwert ist 0
- Funktioniert korrekt für Farbgruppen-Erkennung

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
