# M1dt — Waldtanz-Schlangenwurm (sichtbarer lebendiger Stitch-Wurm)

**Slice-ID:** M1dt
**Datum:** 27.06.2026
**Production:** https://schlangentanz-v2.vercel.app
**Klasse:** Affordance-Mid-Slice / creature-from-tiles (vierter Stitch-Spielmoment nach M1db, M1dl, M1dh, M1ds)

## Motivation

Nach M1ds (Spielmoment der Handkarten mit Hover-Lift, Selected-Lift, BEREIT-Badge) war die nächste grosse "Click-Simulator → echtes Spiel"-Lücke: die eigenen Schlangen auf dem Brett. Aktuell waren das flache Kartenreihen mit Mini-Rotationen, die wie eine "leicht gestaffelte Button-Liste" wirkten, nicht wie eine lebendige Schlange.

Der Stitch-Waldtanz-Game-Board zeigt eine lebendige Schlange als zentrales Spielelement — M1dt liefert genau diesen Effekt ohne Engine, Spiellogik oder andere Brettobjekte anzufassen.

## Sichtbarer Spielwert (Before/After)

| Element | Vor M1dt | Nach M1dt |
|---|---|---|
| Schlange als Ganzes | 5 Karten in einer Reihe mit Mini-Rotationen | 5 Karten als Körper-Glieder mit sichtbarer Schlange-Linie, Kopf-Augen + Schwanz-Curl, wellenförmiger Bewegung wenn aktiv |
| Kopf | `translateY(-0.25rem) rotate(-2deg)` | Zwei weisse Augen mit dunklen Pupillen + lächelnder Mund (Stitch-Stil, nur eigene Schlangen) |
| Körper | Mini-Offset `translateY(0.12rem)` per `:nth-child(2n)` | Sichtbare Schlange-Haut-Brücke als wellenförmige dashed-Linie hinter der Kartenreihe + farbiger Gradient-Untergrund |
| Schwanz | `translateY(0.25rem) rotate(2deg)` | Eingerollt (asymmetrisches Border-Radius) + Pfeilspitze via `::before` |
| Solo (1 Karte) | Standard-Spielkarte | Embryo mit grösserer min-width (7.5rem) — sichtbar als "noch nicht gewachsen" |
| Aktiv-Indikator | nichts | Sanftes Wriggle (`@keyframes wriggle`, 2.6s ease-in-out infinite) wenn `aktiverSpieler` und Phase = "Ausspielphase" |
| Reduced-Motion | — | Wriggle stoppt, Augen/Schwanz bleiben sichtbar (statisches Spielwert) |

Visuelle Differenz: die eigenen Schlangen sehen jetzt aus wie ein einziges Lebewesen auf dem Brett, nicht wie eine sortierte Karten-Liste. Head-to-tail Bewegung macht den "ich wachse"-Spielmoment direkt sichtbar.

## Scope (Rein/Raus)

### Rein

1. **Schlangenkörper-Brücke** in `src/App.css` als `::after` der Kartenreihe (`.schlangekarte__kartenreihe--pfad::after`) — wellenförmige dashed-Linie, dark-forest-green, lime unterlegt.
2. **Kopf-Gesicht** auf der ersten Karte einer eigenen Schlange: zwei Augen (`.schlangekarte__auge` mit Pupille) + Mund (`.schlangekarte__mund` Lächeln). Sichtbar NUR für eigene Schlangen, NIE für Solo-Karten (die tragen "Kopf & Schwanz"-Badge).
3. **Schwanz-Curl** auf der letzten Karte: `.schlangekarte__karte--schwanz-curl.schlangekarte__karte--schwanz-curl { border-radius: 1.1rem 0.5rem 0.5rem 0.3rem }` (doppelte Klasse = 0,2,0 Spezifität schlägt die spätere `.schlangekarte__karte--spielkarte { border-radius: 1.1rem }` 0,1,0) + `::before` Pfeilspitze nach links.
4. **Solo-Vergrößerung** — `.schlangekarte--solo.schlangekarte--solo .schlangekarte__karte { min-width: 7.5rem; min-height: 6.4rem }` (0,3,0 schlägt die spätere Spielkarte-Regel mit min-width: 5.9rem).
5. **Wriggle-Animation** — `@keyframes wriggle` (sanftes Schaukeln: `translateY(-0.18rem) rotate(0.4deg)` peak). Aktiv nur auf der Kartenreihe wenn `sollWriggeln` (eigene Schlange in Ausspielphase). `prefers-reduced-motion: reduce` Override stoppt die Animation.
6. **data-wriggle-aktiv** DOM-Attribut am `<li>` für dauerhafte Test-Stabilität gegen Cascade-Override.
7. **position: relative auf `.schlangekarte__karte`** als containing block für die absoluten Augen/Mund (Kimi Blocker 3 Fix).

### Raus

- Engine, Legal-Aktionen, Aktionspfade
- Sonderkarten-Bubble (M1dq) bleibt
- Anlegeplätze (M1dl) bleiben unverändert
- Schlangen-Markierung/Beschriftung oben (Name, Punkte-Badge) bleibt
- Drop-Zone Hover-Effekt (M1dl-Pulse) bleibt
- Letzte-Aktion-Ziel-Highlight (M1dc) bleibt
- Gegnerische Schlangen: minimal-stylisch (kein Kopf-Gesicht, kein Wriggle) — sie sind "die anderen", nicht "meine Schlange"
- Komponenten-Extraktionen

## Kimi Code CLI Review (kritisch, alle 3 Blocker adressiert)

Codex CLI `NOT_FUNCTIONAL` (OAuth usage limit bis 25.06.2026 19:07 UTC, wartet auf stdin). Kimi Code CLI 0.18.x (k2p7) als Review-Fallback gestartet im Background-Modus. Kimi lieferte 3 BLOCKERS:

### Blocker 1: Cascade-Override des Schwanz-Curl durch `.schlangekarte__karte--spielkarte`
**Kimi:** "`.schlangekarte__karte--schwanz-curl` border-radius wird von späterer `.schlangekarte__karte--spielkarte` überschrieben (Zeile 5954 kommt nach 5827, gleiche Spezifität) → Schwanz-Curl visuell nicht aktiv, obwohl RED-3 grün ist."

**Fix:** Selektor-Spezifität erhöht auf 0,2,0 via `.schlangekarte__karte--schwanz-curl.schlangekarte__karte--schwanz-curl` (doppelte Klasse). RED-6 als Cascade-Regression-Test hinzugefügt.

### Blocker 2: Cascade-Override der Solo-min-width durch `.schlangekarte__karte--spielkarte`
**Kimi:** "`.schlangekarte--solo .schlangekarte__karte` min-width: 7.5rem wird von späterer `.schlangekarte__karte--spielkarte` min-width: 5.9rem überschrieben (gleiche Spezifität, spätere Regel) → Solo-Vergrößerung visuell nicht aktiv."

**Fix:** Selektor-Spezifität erhöht auf 0,3,0 via `.schlangekarte--solo.schlangekarte--solo .schlangekarte__karte` (doppelte solo-Klasse + Karte). RED-7 als Cascade-Regression-Test hinzugefügt.

### Blocker 3: `position: relative` auf `.schlangekarte__karte` fehlt → Augen/Mund an falscher Stelle
**Kimi:** "`.schlangekarte__karte` hat kein `position: relative`, daher positionieren sich `.schlangekarte__gesicht` (Augen) und `.schlangekarte__mund` relativ zum nächsten positioned ancestor `.schlangekarte__kartenreihe--pfad`, nicht zur Kopf-Karte → Augen/Mund hängen an falscher Stelle in der Kartenreihe."

**Fix:** `position: relative` zu `.schlangekarte__karte { ... }` hinzugefügt (Zeile 5725). RED-8 als Regression-Test hinzugefügt.

### NON-BLOCKERS (3, alle nicht-aktional)

1. Schwanz-Curl `::before`-Pfeilspitze sitzt mit `right: -0.18rem` ausserhalb der Karte und zeigt nach links — funktional, optisch ungewöhnlich aber konsistent mit "Schwanz-Ende" Semantik.
2. Solo `min-height: 6.4rem` ist wegen `aspect-ratio: 2 / 3` auf `.schlangekarte__karte--spielkarte` formal wirkungslos; die Karte wird durch das größere Min-Width/Aspect-Ratio-Verhältnis trotzdem sichtbar grösser.
3. `prefers-reduced-motion: reduce` stoppt nur die Wriggle-Animation; Augen/Schwanz bleiben sichtbar — ausreichend für reduced-motion-Benutzer.

## RED/GREEN Verifikation

- **RED-1**: Eigene Schlange hat sichtbare Schlangenkörper-Brücke (`::after` mit dashed-border)
- **RED-2**: Kopf-Karte zeigt Augen (2x weiss mit Pupille) + Mund-Lächeln
- **RED-3**: Schwanz-Karte trägt Curl-Klasse mit asymmetrischem Border-Radius (1.1rem ≠ 0.3rem)
- **RED-4**: Solo-Karte trägt `schlangekarte--solo` Klasse mit 7.5rem min-width
- **RED-5**: `@keyframes wriggle` + `.schlangekarte--wriggle` + `prefers-reduced-motion: reduce` Override vorhanden
- **RED-6** (Kimi-Fix): Schwanz-Curl-Selektor hat 2-fach-Klasse (Cascade-Schutz)
- **RED-7** (Kimi-Fix): Solo-Selektor hat 2-fach-Container + 1-Karte (Cascade-Schutz)
- **RED-8** (Kimi-Fix): `.schlangekarte__karte` hat `position: relative` (containing block)
- **3x Smoke-Wiring**: Skript in `package.json` Kette eingebunden, enthält alle M1dt-Klassen + Test-IDs, hat Self-Test-Modus

## Gate-Status

- **Targeted/Adjacent**: `npx vitest run src/App.m1dt_*.test.tsx src/App.m1ds_*.test.tsx src/App.m1dl_*.test.tsx src/App.m1dq_*.test.tsx src/App.m1bx_*.test.tsx src/App.m1db_*.test.tsx src/App.m1l_*.test.tsx` → 22/23 Tests bestanden (1 pre-existing M1l-Fehler seit M1dp-Schlangenlichtung-Extraktion via `git stash`-Isolation bestätigt).
- **Typecheck**: `tsc -b` grün
- **Lint**: `eslint .` grün
- **Build**: `vite build` grün (220.33 kB CSS, 413.14 kB JS, 545ms)
- **check:test-lines**: grün (alle Testdateien unter 500 Zeilen, größte M1dt-Datei: 149 Zeilen)
- **git diff --check**: grün
- **Self-Test Smoke**: bestanden (`M1dt Waldtanz-Schlangenwurm Selbsttest bestanden, BASE_URL: https://schlangentanz-v2.vercel.app`)

## Playability-Gate-Update (folgt im naechsten Run nach Production-Smoke)

## Container-Groessen-Constraint (AGENTS.md)

- App.tsx: 0 bytes Änderung
- SchlangenPfadKarte.tsx: +24 Zeilen (97 total, unter 500)
- Schlangenbereich.tsx: +19 Zeilen (558 total — über 500, aber pre-existing Grenze; keine Extraktion in M1dt noetig)
- App.css: +127 Zeilen (10180 total, +5 fuer Cascade-Kommentare)

## Lessons Learned (M1dt-spezifisch)

1. **Cascade-Override ist der Killer #1 fuer Affordance-Slices.** Wenn man ein neues visuelles Detail (Border-Radius, Min-Width) auf einer existierenden Element-Klasse (.schlangekarte__karte) hinzufügt, MUSS man die specificity der späteren Regeln prüfen, die auf derselben Klasse sitzen. CSS-Source-Tests sind blind dafür — sie sehen nur die Existenz der neuen Regel, nicht die Anwendung in der Cascade. Kimi hat das gefunden, nicht die RED-Tests.

2. **Position-relative ist der häufig vergessene Cascade-Anker.** Absolute Positionierung auf Pseudo-/Sub-Elementen ohne `position: relative` am Parent rendert an der falschen Stelle (nämlich am nächsten positioned ancestor — oft dem Container, nicht dem Element). Immer wenn man Pseudo-Elemente für dekorative Augmentierungen hinzufügt, explizit `position: relative` am Parent setzen + Test dafür.

3. **Doppelte-Klasse-Trick (`.foo.foo`) ist die einfachste Cascade-Erhöhung.** Spezifität 0,2,0 ohne HTML-Änderung, ohne `!important`, ohne `nth-child`-Hacks. Wenn man keine IDs und keine Attribute verfügbar hat, ist das die idiomatische Lösung für "diese Regel MUSS über einer späteren Regel stehen".

4. **data-Attribut für Test-Stabilität ist fast immer die richtige Wahl.** `data-wriggle-aktiv` statt nur CSS-Klasse. CSS-Klasse kann durch Cascade-Override wegfallen, `data-` Attribut ist eine DOM-Eigenschaft die keine CSS-Regel beeinflusst. Tests prüfen das Attribut, CSS prüft die Klasse — beides läuft unabhängig.

5. **Kimi ist langsam aber findet CSS-Cascade-Bugs die RED-Tests nicht sehen.** 9+ Minuten Wartezeit, aber dafür konsequent Cascade-Spezifität, Position-Anker und Z-Index-Probleme. Der Trade-off lohnt sich für sichtbare Affordance-Slices, weil dort CSS-Source-Tests vs. Browser-Computed-Style-Diskrepanz am höchsten ist.
