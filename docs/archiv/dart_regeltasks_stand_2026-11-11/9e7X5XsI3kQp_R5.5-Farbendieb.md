# R5.5: Farbendieb

- id: 9e7X5XsI3kQp
- Typ: Task
- Status: Done
- Tags: Angriff, Regelwerk, Sonderkarten
- Priorität: Critical
- parentId: mOgZfYM4nHhP
- createdAt: 2026-01-04T13:24:50.394972-08:00
- updatedAt: 2026-05-27T05:45:23.989544-07:00
- completedAt: 2026-05-27T05:45:23.980876-07:00
- htmlUrl: https://app.dartai.com/t/9e7X5XsI3kQp-R5-5-Farbendieb
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Sonderkarte: Farbendieb

Anzahl im Deck: 4 Stück

---

## Effekt

Stiehlt eine einzelne Farbkarte aus einer gegnerischen Schlange und fügt sie der eigenen hinzu.

---

## Durchführung Schritt für Schritt

1. Der Spieler spielt die Farbendieb-Karte aus seiner Hand
2. Der Spieler wählt einen Gegner aus
3. Der Spieler wählt eine Schlange des Gegners aus
4. Der Spieler wählt eine EINZELNE Farbkarte aus dieser Schlange
5. Die gewählte Karte wird aus der gegnerischen Schlange entfernt
6. Die gestohlene Karte wird der Hand des Spielers hinzugefügt
7. Die Farbendieb-Karte kommt auf den Ablagestapel

---

## Einschränkungen

- Nur EINE Karte kann pro Farbendieb gestohlen werden
- Kann NICHT auf geschützte Karten angewendet werden (Farbenschutz)
- Kann NICHT auf Regenbogenschlangen angewendet werden
- Die gegnerische Schlange kann dadurch geteilt werden (Lücke entsteht)

---

## Auswirkung auf gegnerische Schlange

- Wird eine Karte aus der Mitte gestohlen, entstehen ZWEI separate Schlangenteile
- Der Gegner hat dann plötzlich 2 Schlangen (oder 3, wenn er schon 2 hatte - dann werden die Teile zusammengeführt oder einer auf Ablagestapel)
- Wird eine Karte vom Ende gestohlen, bleibt die Schlange zusammenhängend

---

## Use Cases

- UC-R5.5-A: Karte vom Ende stehlen - Schlange wird um 1 kürzer
- UC-R5.5-B: Karte aus der Mitte stehlen - Schlange wird geteilt
- UC-R5.5-C: Geschützte Karte - Diebstahl wird durch Farbenschutz verhindert
- UC-R5.5-D: Schlange auf Hand nehmen - Gestohlene Karte kann im nächsten Zug gespielt werden
- UC-R5.5-E: Schlangenspaltung bei maximalem Limit - Gegner hat schon 2 Schlangen, überzähliger Teil geht auf Ablagestapel

---

## Akzeptanzkriterien

- Nur einzelne Farbkarten können gestohlen werden
- Gestohlene Karte kommt auf die Hand des Diebes
- Schlangenspaltung wird korrekt behandelt
- Farbenschutz blockiert Diebstahl

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
