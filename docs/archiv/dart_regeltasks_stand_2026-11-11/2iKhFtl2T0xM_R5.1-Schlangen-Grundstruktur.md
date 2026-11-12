# R5.1: Schlangen-Grundstruktur

- id: 2iKhFtl2T0xM
- Typ: Subtask
- Status: Done
- Tags: Regelwerk, documentation
- Priorität: Critical
- parentId: 0Stz8jwZ4ciH
- createdAt: 2026-01-04T13:16:19.816831-08:00
- updatedAt: 2026-05-27T05:45:13.775015-07:00
- completedAt: 2026-05-27T05:45:13.698657-07:00
- htmlUrl: https://app.dartai.com/t/2iKhFtl2T0xM-R5-1-Schlangen-Grundstruktur
- taskRelationships: {}

---

<!-- BESCHREIBUNG (woertlich aus Dart, unveraendert) -->
## R5.1: Schlangen-Grundstruktur

### Regelbeschreibung

Jeder Spieler baut im Laufe des Spiels bis zu zwei Schlangen. Eine Schlange ist eine Reihe von Karten, die nebeneinander liegen.

### Definition einer Schlange

**Was ist eine Schlange?**

- Eine geordnete Reihe von Farbkarten (und ggf. Sonderkarten)
- Die Karten liegen horizontal nebeneinander
- Karten überlappen sich leicht, sodass alle Farben sichtbar sind
- Die Schlange hat zwei Enden (links und rechts)

**Minimum:**

- Eine Schlange besteht aus mindestens 1 Karte
- Eine einzelne Karte gilt bereits als Schlange

**Maximum:**

- Es gibt KEINE Obergrenze für die Länge einer Schlange
- Theoretisch kann eine Schlange alle Farbkarten des Spiels enthalten

### Schlangen pro Spieler

**Anzahl:**

- Jeder Spieler darf MAXIMAL 2 Schlangen haben
- Ein Spieler kann auch nur 1 Schlange haben
- Ein Spieler kann auch 0 Schlangen haben (zu Spielbeginn)

**Unabhängigkeit:**

- Die beiden Schlangen sind vollständig unabhängig voneinander
- Karten aus einer Schlange können nicht einfach zur anderen verschoben werden
- Jede Schlange wird separat gewertet

### Visuelle Darstellung

**Überlappung:**

- Karten überlappen sich um etwa 20-30% ihrer Breite
- Die Farbe jeder Karte muss erkennbar bleiben
- Richtung: Spätere Karten überlappen frühere Karten

**Anordnung:**

- Schlangen liegen horizontal
- Die erste Karte ist ganz links (oder rechts, je nach Wachstumsrichtung)
- Der Spielerbereich zeigt beide Schlangen untereinander

### Digitale Umsetzung

**Use Case UC-R5.1-01: Schlangen-Datenstruktur**

- Eine Schlange wird als geordnete Liste von Karten-IDs gespeichert
- Position 0 ist das linke Ende, letzte Position ist das rechte Ende
- Neue Karten können am Anfang oder Ende eingefügt werden

**Use Case UC-R5.1-02: Schlangen-Visualisierung**

- Jede Schlange wird als horizontale Kartenreihe dargestellt
- Die Karten überlappen sich visuell
- Bei zwei Schlangen werden sie vertikal versetzt angezeigt

**Use Case UC-R5.1-03: Schlangen-Länge berechnen**

- Das System zählt die Anzahl der Karten in jeder Schlange
- Diese Information kann für Aufgaben-Prüfungen benötigt werden

### Akzeptanzkriterien

- Eine Schlange ist eine geordnete Liste von Karten
- Maximal 2 Schlangen pro Spieler
- Keine Längen-Obergrenze für einzelne Schlangen
- Beide Enden einer Schlange sind als Anlegepunkte identifizierbar

---

<!-- KOMMENTARE -->

Keine Kommentare (list_comments count=0).
