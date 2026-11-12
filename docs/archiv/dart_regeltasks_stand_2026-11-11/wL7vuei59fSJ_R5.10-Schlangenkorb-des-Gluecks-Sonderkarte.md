# R5.10: Schlangenkorb des Glücks (Sonderkarte)

- id: wL7vuei59fSJ
- Typ: Task
- Status: Done
- Tags: Karten, Regelwerk, Sonderkarten
- Priorität: High
- parentId: mOgZfYM4nHhP
- createdAt: 2026-01-04T13:25:03.581997-08:00
- updatedAt: 2026-05-27T05:45:24.232260-07:00
- completedAt: 2026-05-27T05:45:24.224431-07:00
- htmlUrl: https://app.dartai.com/t/wL7vuei59fSJ-R5-10-Schlangenkorb-des-Gl
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regelblock R5.10: Schlangenkorb des Glücks

Diese Sonderkarte ist besonders mächtig und bietet 4 verschiedene Optionen zur Auswahl.

---

## Kartenübersicht

**Anzahl im Spiel:** 1 Stück (einzigartig)

**Kategorie:** Spezial/Flexibel

**Besonderheit:** Diese Karte bietet dem Spieler eine Wahl aus 4 verschiedenen Effekten.

---

## Die 4 Optionen

### Option A: Bonus-Karten

**Effekt:** Der Spieler erhält zusätzliche Handkarten.

**Durchführung:**

1. Der Spieler zieht 3 zusätzliche Karten vom Nachziehstapel
2. Der Spieler darf sofort bis zu 2 dieser Karten ausspielen
3. Übrige Karten bleiben auf der Hand
4. Falls die Handkartengrenze von 5 überschritten wird: Überzählige Karten müssen am Zugende abgeworfen werden

**Use Cases:**

- UC-A1: Volle Nutzung - Spieler zieht 3, spielt 2 sofort aus
- UC-A2: Handkarten sparen - Spieler zieht 3, behält alle

---

### Option B: Karten-Tausch

**Effekt:** Der Spieler tauscht Karten zwischen Hand und Schlange.

**Durchführung:**

1. Der Spieler wählt bis zu 2 Karten aus einer seiner Schlangen
2. Diese Karten werden auf die Hand genommen
3. Der Spieler muss bis zu 2 Handkarten in die Schlange einfügen
4. Die Karten werden an den ursprünglichen Positionen ersetzt
5. Der Tausch muss sofort erfolgen

**Einschränkungen:**

- Nur Farbkarten können getauscht werden
- Sonderkarten in Schlangen können nicht getauscht werden

**Use Cases:**

- UC-B1: Farbgruppe optimieren - Tauscht ungünstige Karte gegen passende
- UC-B2: Wertvolle Karte retten - Nimmt grüne Karte auf die Hand zurück

---

### Option C: Aufräumen

**Effekt:** Entfernt eine Blockade oder gegnerische Sonderkarte.

**Durchführung:**

1. Der Spieler wählt EINE der folgenden Aktionen:
2. Entferne eine eigene Blockade (Schlangenblockade)
3. Entferne eine gegnerische Sonderkarte aus einer gegnerischen Schlange
4. Die entfernte Karte kommt auf den Ablagestapel
5. Bei Entfernung einer Farbenfusion: Die Fusion-Verbindung wird aufgelöst, die Karten bleiben

**Use Cases:**

- UC-C1: Blockade entfernen - Eigene Schlange wird wieder nutzbar
- UC-C2: Gegner schwächen - Entfernt gegnerische Regenbogenschlange

---

### Option D: Doppel-Aktion

**Effekt:** Der Spieler führt zwei zusätzliche Aktionen aus.

**Durchführung:**

1. Der Spieler erhält 2 zusätzliche Aktionen in diesem Zug
2. Jede Aktion kann sein:
3. Eine Farbkarte anlegen
4. Eine Sonderkarte spielen
5. Diese Aktionen sind zusätzlich zur normalen Kartengrenze
6. Die Schlangenkorb-Karte selbst zählt nicht zu diesen Aktionen

**Beispiel:**

- Normal: 2 Karten spielbar
- Mit Doppel-Aktion: 2 + 2 = 4 Karten spielbar

**Use Cases:**

- UC-D1: Maximale Aktionen - Spieler spielt 4 Karten in einem Zug
- UC-D2: Kombination - 2 Farbkarten + 2 Sonderkarten

---

## Allgemeine Regeln

**Spielablauf:**

1. Der Spieler spielt den Schlangenkorb des Glücks aus
2. Ein Auswahl-Menü erscheint mit den 4 Optionen
3. Der Spieler wählt GENAU EINE Option
4. Der gewählte Effekt wird ausgeführt
5. Die Schlangenkorb-Karte wird AUS DEM SPIEL ENTFERNT (nicht Ablagestapel)

**Wichtig:**

- Diese Karte ist einzigartig im Spiel (nur 1 Stück)
- Nach Verwendung ist sie komplett aus dem Spiel
- Sie kann nicht durch andere Karten zurückgeholt werden

---

## Use Cases für Gesamt-Mechanik

- UC-Main-A: Spieler wählt Option A - Bonus-Karten werden gezogen
- UC-Main-B: Spieler wählt Option B - Tausch wird durchgeführt
- UC-Main-C: Spieler wählt Option C - Aufräumen wird ausgeführt
- UC-Main-D: Spieler wählt Option D - Doppel-Aktion wird gewährt
- UC-Entfernung: Nach Nutzung verschwindet Karte komplett

---

## Akzeptanzkriterien

- Nur 1 Schlangenkorb-Karte im gesamten Spiel
- Auswahl-Menü zeigt alle 4 Optionen klar an
- Jede Option funktioniert wie beschrieben
- Karte wird nach Nutzung aus dem Spiel entfernt
- Kann nicht recycelt oder zurückgeholt werden

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
