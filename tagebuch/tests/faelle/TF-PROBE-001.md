---
id: TF-PROBE-001
titel: Die Seite /probe zeigt in allen drei Geräteklassen die richtige Klasse und Touch, und „Neu messen“ zählt jeden Druck mit.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: probe/PROBE-1-geraeteklasse (59a50e2)
---

## Worum es geht

Die Probe-Seite soll zeigen, ob die App auf einem Desktop, einem Tablet oder einem Handy läuft und ob Touch aktiv ist. Geprüft wird das im Produktionsbuild in den drei Geräteklassen der Abnahme. Dazu kommt der Knopf „Neu messen“, der mit Maus und mit Touch mitzählen muss.

## Bestanden, wenn

Bei 1280×900 ohne Touch steht da „Geräteklasse: Desktop“, „Touch: nein“, „Breite: 1280 px“. Bei 1024×768 mit Touch steht „Geräteklasse: Tablet“, „Touch: ja“, „Breite: 1024 px“. Bei 390×844 mit Touch steht „Geräteklasse: Handy“, „Touch: ja“, „Breite: 390 px“. Nach dem Laden steht „Messungen: 0“, nach zwei Klicks oder Tipps auf „Neu messen“ „Messungen: 2“. Die Konsole zeigt keinen Fehler.

## Fehlgeschlagen, wenn

Eine der drei Klassen oder der Touch-Wert weicht ab, etwa „Geräteklasse: Desktop“ bei 1024 px, oder der Zähler steht nach zwei Drücken nicht auf 2, oder ein Text ist abgeschnitten oder nicht lesbar.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild ab Commit 59a50e2 (`npm run build`, dann `npm run preview -- --port 4173 --strictPort`), Adresse `http://localhost:4173/probe` |
| Ausgangslage prüfen | Port 4173 war vorher frei; die Seite zeigt die Überschrift „Probe-Seite“ |

## Testdaten

Fenstergrössen 1280×900 (Maus), 1024×768 (Touch) und 390×844 (Touch), wie in `scripts/pruefung/geraeteklassen.mjs`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser, Fenster 1280×900, Maus | Adresse öffnen | `http://localhost:4173/probe` | „Geräteklasse: Desktop“, „Touch: nein“, „Breite: 1280 px“, „Messungen: 0“ |
| 2 | Knopf „Neu messen“ | zweimal mit der Maus klicken | | „Messungen: 2“, die übrigen Werte bleiben gleich |
| 3 | Browser mit Touch, Fenster 1024×768 | Adresse neu öffnen | `http://localhost:4173/probe` | „Geräteklasse: Tablet“, „Touch: ja“, „Breite: 1024 px“, „Messungen: 0“ |
| 4 | Knopf „Neu messen“ | zweimal antippen | | „Messungen: 2“ |
| 5 | Browser mit Touch, Fenster 390×844 | Adresse neu öffnen | `http://localhost:4173/probe` | „Geräteklasse: Handy“, „Touch: ja“, „Breite: 390 px“, „Messungen: 0“ |
| 6 | Knopf „Neu messen“ | zweimal antippen | | „Messungen: 2“ |
| 7 | Konsole des Browsers | Fehler ansehen | | keine Fehlermeldung |

## Nicht abgedeckte Grenzfälle

Breite genau auf den Grenzen 599, 600, 1024 und 1025 ohne Neuladen und das Neuladen selbst: eigener Testfall TF-PROBE-002. Drehen des Handys: eigener Testfall TF-PROBE-003. Breite 0 oder negativ: kommt in einem Browser nicht vor, nur am Unit-Test prüfbar und dort nicht verlangt. Touch-Gerät mit Breite über 1024 (grosses Tablet): bewusst nicht geprüft, weil die Festlegung die Klasse nur an der Breite festmacht und das Ergebnis „Desktop, Touch: ja“ daraus direkt folgt.
