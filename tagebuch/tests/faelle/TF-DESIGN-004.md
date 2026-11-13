---
id: TF-DESIGN-004
titel: Zwischen 700 und 850 px Breite (Tablet hochkant) sind alle fünf Handkarten ganz zu sehen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/O1-gestaltung (PR #30)
grenzfall_von: TF-DESIGN-002
---

## Worum es geht

Ab 700 px steht die Zugleiste rechts neben Schlangen und Hand. Damit wird die Hand schmaler, die Karten aber grösser (80 px). Passt die Hand nicht mehr, scrollt sie in sich, und die letzte Karte ist am Rand angeschnitten. Geprüft wird an der Grenze 700 px und am Tablet hochkant (768×1024), das keine der drei Abnahmeklassen ist.

## Bestanden, wenn

Bei 700×900 und 768×1024 ist in `.hand-karten` `scrollWidth` gleich `clientWidth`; alle fünf Handkarten sind ganz zu sehen.

## Fehlgeschlagen, wenn

`scrollWidth` grösser ist als `clientWidth`; dann beide Werte und die angeschnittene Karte nennen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build auf Port 4174, Playwright mit `setViewportSize` und Touch |

## Testdaten

`/dev/entwurf/tisch` und `/dev/entwurf/tisch?karte=rot-01`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Playwright 700×900 | Tisch mit gewählter Farbkarte öffnen, `.hand-karten` messen | `/dev/entwurf/tisch?karte=rot-01` | `scrollWidth` gleich `clientWidth` |
| 2 | Playwright 768×1024 | Tisch öffnen, `.hand-karten` messen, Foto ansehen | `/dev/entwurf/tisch` | Farbenschutz ganz zu sehen |
