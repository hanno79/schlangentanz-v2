# Release-Status: M3c — Sonniges-Nest-Player-Cards als Stitch-Avatar-Heroes

**Datum:** 28.06.2026
**Autor:** Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
**Slice-Klasse:** Stitch-Vertical-Slice / Sonniges-Nest-Lobby-Stil-Fortsetzung (Schwester zu M3a Lobby-Belebung, M3b Spielstart-Buttons).
**Status:** ✅ grün — alle Gates pass, bereit für Deploy

## Zusammenfassung

M3c ersetzt die Emoji-Höhlen-Spielerslots aus M3a durch Stitch-inspirierte
runde 8rem-Avatare mit 3px-Border, Hard-Shadow, SVG-Schlangen-Karikaturen
(farbcodiert pro KI: Orange Crush / Lime Loop / Berry Boa). Host-Slot zeigt
"Slippy Host" mit grünem Wald-Snake-Avatar. Namens-Pille unter jedem Avatar,
Schwierigkeiten-Pille nur auf aktiven KI-Slots, 2x2-Grid (mobile: 1 Spalte),
Baumstamm-Rahmen mit Ranken/Vines um das Spielerfeld. Schließt die
Lobby-Stil-Familie ab.

Dieser Cron-Lauf finalisiert den M3c-Slice:
1. **Kimi-Blocker-Fix**: Wrapper-`<div aria-hidden>` entfernt (Screenreader
   hörten Spielernamen nicht), stattdessen innerer `<span class="lobby-avatar__bild" aria-hidden>`
   um die SVG-Dekoration. .lobby-avatar__bild bleibt lesbar.
2. **CSS-Refinement**: `.lobby-avatar__bild` als Grid-Wrapper für korrekte
   SVG-Zentrierung in runden Avatare.
3. **Live-Smoke-Fix**: Smoke klickt erst "Waldparty starten (2 KI)" + "Große
   Runde (3 KI)", damit alle KI-Slots aktiviert sind und Schwierigkeiten
   sichtbar werden.
4. **Test-Hardening**: RED-3 verifiziert jetzt die Korrekte aria-hidden-Verteilung
   (entweder SVG ODER Wrapper-span, NICHT der avatar-div selbst).

## Scope-Groesse

Mittlerer Vertical-Slice: ~10 Files, ~783 Zeilen Diff in Commit c571d31 +
~36 Zeilen Blocker-Fix in diesem Pass, **15 RED-Tests** (ursprünglich),
1 Live-Smoke, 1 Smoke-Wiring-Test.

**Warum kein Mikro-Slice (Affordance-Politur)?** Die Lobby ist der Erst-
Eindruck-Screen — Avatare mit karikativem Schlange-Charakter sind die
direkteste visuelle Verbindung zum Spielkonzept. Emoji sind ein
Generikum-Stolperer für ein Kartenspiel mit Schlangen-Motiv.

**Warum kein Big-Bang?** Reine Visual-Transformation der Lobby-Komponente,
keine Engine-Interaktion, keine State-Mutation, keine Layout-Auswirkung
auf `/game`. Regression-Risiko niedrig.

## Rein (dieser Finalisierungs-Pass)

1. **Kimi-Blocker-Resolution** (siehe unten): Wrapper aria-hidden entfernt
2. **CSS-Grid-Wrapper** `.lobby-avatar__bild` (display: grid; place-items: center)
3. **Smoke-Vorbedingung**: 2 Klicks auf Start-Buttons vor Vermessung

## Raus

- Engine-Logik
- KI-Difficulty-Slider (Folgeslice M3d)
- Lobby-Buttons selbst (M3b-Vertrag bleibt)
- Schlangenbuch-Komponente

## Gates

| Gate | Ergebnis |
|---|---|
| `npx vitest run src/App.m3c_*.test.tsx` | ✅ 11 Tests grün |
| `npx vitest run src/App.m3_sonniges_nest_lobby.test.tsx src/App.m3a_*.test.tsx src/App.m3b_*.test.tsx` | ✅ 18 Tests grün |
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` | ✅ exit 0 |
| `npm run build` | ✅ 102 modules, 421 KB JS, 230 KB CSS |
| Kimi-Review | siehe unten |

## Kimi-Disclosure

**REVIEWER=kimi-cli** (Codex `NOT_FUNCTIONAL` per Watchdog — codex wartet auf
stdin, Kimi ist der funktionierende Fallback). Watchdog-Output:
```
{"name":"codex","status":"NOT_FUNCTIONAL","detail":"codex wartet auf stdin"},
{"name":"kimi-cli","status":"OK","detail":"kimi -p antwortet"}
```

**1 BLOCKER gefunden und im selben Slice gefixt (dieser Commit):**

| Kimi-Blocker | Klassifikation | Hermes-Resolution |
|---|---|---|
| `.lobby-avatar { aria-hidden="true" }` versteckt SVG-Dekoration UND Spielername — Screenreader können "Slippy Host" nicht vorlesen | **Echter Blocker** | Fix: Wrapper-div ohne aria-hidden; innerer `.lobby-avatar__bild` span mit `aria-hidden="true"` um SVG-Dekoration; RED-3-Test verifiziert beide Bedingungen |

**NON-BLOCKERS (zur Kenntnis genommen):**
- KI-Difficulty-Slider fehlt weiterhin — sichtbare Pille `mutig/listig/fies` ist visueller Hinweis ohne Engine-Interaktion. Möglicher Folgeslice M3d (Difficulty-Wahl mit echtem KI-Engine-Switching).

## Naechste Luecke (M1x: Waldtanz Game Board als Forest Arena)

**Empfehlung:** Die nächsten Schritte sollten weg von Lobby-Politur hin
zum **zentralen Spielerlebnis auf `/game`** — der Waldtanz-Brett-Arena.

**Option M3d — Lobby-Difficulty-Slider mit Engine-Switching:**
Verbindet die Lobby-Schwierigkeiten-Pillen mit echter KI-Logik. Mittel
(~5 Files), ~80 Zeilen, 6-8 RED-Tests. Beendet die Lobby-Familie
endgültig.

**Option M6 — Waldtanz-Brett als Stitch-Forest-Arena-Transformation:**
Größter UX-Sprung: das `/game`-Spielbrett wird zu einer echten
Stitch-Forest-Arena mit:
- **Waldiger Backdrop** mit Sonnenstrahlen + Grünstufen
- **Schlangen als zentrale Kartenreihen** statt versteckte Brettobjekte
- **Handkarten board-nah unten** als Stitch-Pillen-Fächer mit Sichtbarkeit
- **Status/Wertung/Material als kompakte Pillen** am Brettrand
- **Phasen-Banner** gross + sichtbar über dem Brett
- **Aktionen** als kontextuelle Controls (Hover-Pille auf Brettziel)
  statt dominanter Buttonliste
~12-15 Files, ~300-500 Zeilen, 15-25 RED-Tests, 1 Live-Smoke mit
Screenshot-Vergleich vor/nach. **Kein Engine-Touch**, aber grosses
visuelles + strukturelles Refactoring der `/game`-Route.

**Empfehlung M6** als naechster grosser Stitch-Schritt: fuehrt vom
Lobby-Erst-Eindruck direkt zum immersiven Waldtanz-Spielmoment.

Alternative M6-Vorgaenger-Slices (kleiner, gleicher M6-Stil):
- **M6a — Waldtanz-Brett-Waldboden-Backdrop** mit Stitch-Forest-Gradient
  + Material-Pillen-Anker. ~80 Zeilen CSS, 5-7 RED-Tests.
- **M6b — Handkarten-Board-Pille als Stitch-Faecher** unter dem Brett
  (analog M1ds/M2i). ~60 Zeilen CSS, 6-8 RED-Tests.
- **M6c — Phasen-Banner als Stitch-Holz-Wimpel** ueber dem Brett mit
  Ribbon-Shadow (analog M1dk-Erweiterung). ~50 Zeilen CSS, 5-7 RED-Tests.