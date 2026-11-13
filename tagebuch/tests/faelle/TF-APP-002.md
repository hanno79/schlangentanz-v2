---
id: TF-APP-002
titel: Adressen, die /probe nur ähneln (/probe/ und /PROBE), zeigen die App und nicht die Probe-Seite.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: probe/PROBE-1-geraeteklasse (59a50e2)
grenzfall_von: TF-APP-001
---

## Worum es geht

Die Weiche in `src/main.tsx` vergleicht den Pfad genau mit `/probe`. Ein Schrägstrich am Ende oder Grossbuchstaben ergeben deshalb eine andere Adresse. Geprüft wird, was dort tatsächlich erscheint, damit das Verhalten bekannt ist.

## Bestanden, wenn

`/probe/` und `/PROBE` zeigen beide die Lobby mit „DAS KARTENSPIEL“ und „Schlangentanz“; „Probe-Seite“ steht nirgends.

## Fehlgeschlagen, wenn

Eine der beiden Adressen zeigt eine leere Seite, einen Fehler oder etwas anderes als die App.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit 59a50e2 auf `http://localhost:4173` |

## Testdaten

Adressen `http://localhost:4173/probe/` und `http://localhost:4173/PROBE`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser mit Touch, 390×844 | Adresse öffnen | `http://localhost:4173/probe/` | Lobby mit „DAS KARTENSPIEL“, „Schlangentanz“; kein „Probe-Seite“ |
| 2 | derselbe Browser | Adresse öffnen | `http://localhost:4173/PROBE` | Lobby mit „DAS KARTENSPIEL“, „Schlangentanz“; kein „Probe-Seite“ |
