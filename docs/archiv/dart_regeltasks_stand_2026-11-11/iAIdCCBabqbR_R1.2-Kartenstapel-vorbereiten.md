# R1.2: Kartenstapel vorbereiten

- id: iAIdCCBabqbR
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: CtddSdsqfNZ9
- createdAt: 2026-01-04T13:11:44.244678-08:00
- updatedAt: 2026-06-04T23:45:18.563814-07:00
- completedAt: 2026-05-27T05:45:10.063153-07:00
- htmlUrl: https://app.dartai.com/t/iAIdCCBabqbR-R1-2-Kartenstapel-vorbereiten
- taskRelationships: {"duplicateIds": ["0SRxMEdb1H5j"]}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R1.2: Kartenstapel vorbereiten

### Regelbeschreibung

Alle Farbkarten und Sonderkarten werden zu einem gemeinsamen Nachziehstapel gemischt. Die Aufgabenkarten und Zusatzkarten werden separat behandelt.

### Schritte im Detail

**Schritt 1: Hauptstapel erstellen**

- Alle 78 Farbkarten nehmen
- Alle 33 Sonderkarten hinzufügen
- Ergebnis: 111 Karten für den Hauptstapel

**Schritt 2: Hauptstapel mischen**

- Den Stapel von 111 Karten gründlich mischen
- Mindestens 7-mal Riffle-Shuffle für echte Zufälligkeit (beim physischen Spiel)
- Stapel verdeckt in die Tischmitte legen

**Schritt 3: Aufgabenkarten trennen**

- Die 8 offenen Aufgabenkarten separieren
- Die 7 geheimen Aufgabenkarten separieren
- Beide Stapel jeweils mischen

**Schritt 4: Zusatzkarten verteilen**

- Jedem Spieler 1 Comeback-Karte geben
- Jedem Spieler 2 Risiko-Belohnungs-Karten geben
- Diese Karten liegen offen vor jedem Spieler

### Digitale Umsetzung

**Use Case UC-R1.2-01: Hauptstapel erstellen und mischen**

- Das System erstellt eine Liste aller 111 Karten (Farb + Sonder)
- Das System wendet einen Zufallsalgorithmus an (Fisher-Yates Shuffle)
- Der gemischte Stapel wird als Nachziehstapel definiert

**Use Case UC-R1.2-02: Aufgabenstapel vorbereiten**

- Das System trennt offene und geheime Aufgabenkarten
- Beide Stapel werden separat gemischt
- Die Stapel werden für spätere Verwendung bereitgehalten

**Use Case UC-R1.2-03: Zusatzkarten zuweisen**

- Das System weist jedem Spieler automatisch 1 Comeback-Karte zu
- Das System weist jedem Spieler automatisch 2 Risiko-Belohnungs-Karten zu
- Diese Karten werden im Spielerbereich als "verfügbar" markiert

### Akzeptanzkriterien

- Hauptstapel enthält exakt 111 Karten
- Mischung ist statistisch zufällig (keine erkennbaren Muster)
- Aufgabenkarten sind korrekt getrennt (8 offen, 7 geheim)
- Jeder Spieler hat seine Zusatzkarten erhalten

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
