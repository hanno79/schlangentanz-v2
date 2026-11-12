---
name: <kurzname aus Buchstaben, Ziffern, _ und -, gleich dem Dateinamen ohne .md>
quelle: <Amt, Portal, Kunde, eigene Messung, API; bei abgeleiteten Daten: abgeleitet>
anbieter: <optional: Stelle, die den Datensatz herausgibt; sonst Zeile löschen>
bezugsweg: <optional: wie der Datensatz bezogen wurde, etwa Bestellung im Geodatenshop; sonst Zeile löschen>
bezogen_am: <JJJJ-MM-TT; bei abgeleiteten Daten der Tag der Erzeugung; bei status: geplant: noch nicht bezogen>
stand: <Datenstand oder Version der Quelle>
format: <GeoPackage, Shapefile, CSV, JSON und so weiter>
ablage: <Pfad im Projekt>
basiert_auf: <nur bei abgeleiteten Daten: Namen der Ausgangsdatensätze, durch Komma getrennt; sonst Zeile löschen>
lizenz: <optional; sonst Zeile löschen>
kontakt: <optional; sonst Zeile löschen>
umfang: <optional: Anzahl Objekte oder Grösse, etwa 3'921 Gebäude; sonst Zeile löschen>
koordinatensystem: <optional: EPSG-Code, etwa EPSG:2056 (LV95); sonst Zeile löschen>
ausdehnung: <optional: west, süd, ost, nord und EPSG-Code, etwa 2681200, 1229400, 2686900, 1234100 EPSG:2056; sonst Zeile löschen>
schluesselfeld: <optional: Feld, das ein Objekt eindeutig kennzeichnet; sonst Zeile löschen>
felder: <optional: die wichtigsten Attribute, durch Komma getrennt; sonst Zeile löschen>
pruefsumme: <optional: Prüfsumme oder wo sie steht, etwa SHA-256 in quelle.json; sonst Zeile löschen>
status: <nur solange der Datensatz vorgesehen, aber noch nicht bezogen ist: geplant; sonst Zeile löschen>
---

## Aufbereitung

<Bei einem Original, das unverändert bleibt: Keine, und welcher Datensatz die
Bearbeitung enthält. Sonst je Schritt ein Unterabschnitt wie dieser:>

### 1. <Was gemacht wurde>

- womit: <Werkzeug, Skript, Version>
- ergebnis: <mit Zahlen, damit es später prüfbar ist>

## Fallstricke

<Was überrascht hat: falsches Koordinatensystem in den Metadaten, doppelte
Objekte, ein Feld, das entgegen der Beschreibung leer ist.>
