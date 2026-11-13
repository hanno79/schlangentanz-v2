---
id: TF-TISCH-001
titel: Ist eine deiner Schlangen breiter als ihr Bereich, sieht man ohne Wischen, dass sie weitergeht.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
---

## Worum es geht

Deine Schlangen stehen unten als je eine Zeile, die seitlich scrollt, wenn sie zu lang wird. Auf Touch-Geräten zeigt der Browser dabei keinen Scrollbalken an. Ob es rechts weitergeht, muss man deshalb am Bild selbst erkennen. Sonst hält man die letzte sichtbare Karte für das Ende der Schlange.

## Bestanden, wenn

In jeder der fünf Klassen gilt für jede deiner Schlangen, deren `scrollWidth` grösser ist als ihre `clientWidth`: Ohne Wischen ist ein Zeichen zu sehen, dass sie weitergeht. Das kann eine Karte sein, von der mindestens ein Viertel ihrer Breite am rechten Rand zu sehen ist, ein sichtbarer Scrollbalken, ein Verlauf oder Pfeil am Rand oder eine sichtbare Zahl der Karten.

## Fehlgeschlagen, wenn

Die Zeile endet scheinbar mit einer ganzen Karte, von der nächsten sind höchstens ein paar Pixel zu sehen, und es gibt weder Scrollbalken noch Zahl noch Zeichen am Rand.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild (`vite build`, `vite preview`), Playwright-Kontexte aus `scripts/pruefung/geraeteklassen.mjs` (Touch-Klassen mit `isMobile`) |
| Ausgangslage | Im Local Storage unter `schlangentanz-v2:partie` steht der serialisierte Zustand eines Szenarios |

## Testdaten

Szenario `volltisch()` aus `src/ui/tisch/__tests__/szenarien.ts` (je 11 Karten in deinen zwei Schlangen). Dazu eine lange Schlange: mit `baukasten({ spielerzahl: 2, erweiterung: false })` für Spieler 0 die Schlange Rot, Rot, Rot, Blau, Blau, Blau, Gelb, Gelb, Gelb, Grün, Grün, Grün, Braun, Braun, Braun, Violett, Violett, Violett, Rot, Rot, Rot, Blau (22 Karten).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand legen, `/spiel` öffnen | Szenario | Tisch mit „Deine Schlangen“ und „Deine Hand“ |
| 2 | Konsole | für jede Liste in „Deine Schlangen“ `scrollWidth`, `clientWidth` und `offsetHeight − clientHeight` lesen | | welche Zeilen seitlich scrollen, ob ein Scrollbalken Platz hat |
| 3 | Konsole | für die erste Karte, die nicht ganz zu sehen ist, den sichtbaren Teil in Pixeln messen | | mindestens ein Viertel der Kartenbreite |
| 4 | Deine Schlangen | Foto ansehen, rechten Rand der Zeile vergrössern | | erkennbar, dass es weitergeht |
| 5 | Deine Schlangen | mit dem Finger nach links wischen (Touch-Ereignisse) | | die Zeile scrollt, die verdeckten Karten erscheinen |

## Zurücksetzen

Browserkontext schliessen; der Local Storage ist danach leer.

## Nicht abgedeckte Grenzfälle

Die Schlangen der Gegner auf dem Handy scrollen ebenso seitlich; sie liegen in der Tischfläche und sind hier nicht eigens gemessen. Drehen des Geräts mit seitlich gescrollter Schlange: TF-TISCH-002. Kleineres Handy quer (740 × 360): TF-TISCH-003.
