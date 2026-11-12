# R2.4: Phase 3 - Aufgabenprüfung

- id: BlFRGBuRc6sK
- Typ: Task
- Status: Done
- Tags: documentation, rules
- Priorität: Critical
- parentId: KxgqDvAPcuvF
- createdAt: 2026-01-04T13:15:49.096422-08:00
- updatedAt: 2026-05-27T05:45:20.713204-07:00
- completedAt: 2026-05-27T05:45:20.693506-07:00
- htmlUrl: https://app.dartai.com/t/BlFRGBuRc6sK-R2-4-Phase-3-Aufgabenpr-fung
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## Regel R2.4: Phase 3 - Aufgabenprüfung

### Regelbeschreibung

Nach dem Ausspielen von Karten prüft der Spieler, ob er eine offene oder seine geheime Aufgabe erfüllt hat. Bei Erfüllung ruft er "SchlangenSpass!" und erhält die Aufgabenkarte.

### Durchführung Schritt für Schritt

1. Der Spieler prüft seine Schlange(n) gegen die 3 offenen Aufgaben
2. Der Spieler prüft seine Schlange(n) gegen seine geheime Aufgabe
3. Erfüllt eine Schlange eine Aufgabe:
4. Der Spieler ruft laut "SchlangenSpass!"
5. Der Spieler zeigt, wie die Aufgabe erfüllt ist
6. Der Spieler nimmt die Aufgabenkarte zu sich (Punkte)
7. Bei offener Aufgabe: Eine neue wird vom Stapel nachgelegt
8. Bei geheimer Aufgabe: Die Karte wird aufgedeckt und zu den Punkten gelegt
9. Es können MEHRERE Aufgaben in einem Zug erfüllt werden

### Aufgabenerfüllung - Wichtige Regeln

- Die Aufgabe muss VOLLSTÄNDIG erfüllt sein
- Die Aufgabe muss im AKTUELLEN Zustand der Schlange(n) erfüllt sein
- Vergessenes "SchlangenSpass!"-Rufen: Aufgabe gilt trotzdem (im physischen Spiel ggf. Hausregel)
- Eine erfüllte Aufgabe kann nicht rückgängig gemacht werden
- Aufgaben werden sofort nach Erfüllung abgehandelt

### Digitale Umsetzung

Das System muss:

- Automatisch prüfen, ob Aufgaben erfüllt sind
- Erfüllte Aufgaben visuell hervorheben
- Den "SchlangenSpass!"-Ruf als Animation/Sound darstellen
- Punkte automatisch gutschreiben
- Neue offene Aufgaben automatisch nachlegen
- Die geheime Aufgabe bei Erfüllung aufdecken
- Mehrfache Erfüllung in einem Zug unterstützen

### Use Cases

- UC2.4.1: Spieler erfüllt offene Aufgabe "Farbvielfalt"
- UC2.4.2: Spieler erfüllt seine geheime Aufgabe
- UC2.4.3: Spieler erfüllt 2 Aufgaben gleichzeitig
- UC2.4.4: Aufgabe war schon vorher erfüllt aber nicht bemerkt - gilt trotzdem
- UC2.4.5: Aufgaben-Nachziehstapel ist leer - keine neue offene Aufgabe

### Akzeptanzkriterien

- Erfüllte Aufgaben werden korrekt erkannt
- Punkte werden korrekt gutgeschrieben
- Neue offene Aufgaben werden nachgelegt
- Geheime Aufgaben werden bei Erfüllung sichtbar
- Mehrfache Erfüllung pro Zug funktioniert

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
