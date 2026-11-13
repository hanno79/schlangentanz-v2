#!/usr/bin/env python3
"""Lädt die Kartenbilder von schlangentanz.ch und schneidet sie für das Spiel zu.

Quelle ist allein die Website des Autors (docs/UMSETZUNGSPLAN.md 2.3). Die
Bilder dort sind 604×900 Pixel gross. Farb- und Sonderkarten liegen auf einem
einfarbigen grauen Rand; der wird weggeschnitten und die runden Ecken werden
durchsichtig. Aufgaben, Comeback- und Risiko-Belohnungs-Karte sind randlos
gestaltet (Goldrahmen, Verlauf); sie werden nur mittig auf dasselbe
Seitenverhältnis gebracht wie die Farbkarten, damit alle Karten am Tisch gleich
gross sind, und bekommen dieselben runden Ecken.

Aufruf:
    python scripts/kartenbilder_zuschneiden.py --roh <ordner> [--laden]
    python scripts/kartenbilder_zuschneiden.py --nur-klein

--roh       Ordner für die Rohbilder der Website (ausserhalb des Repos, etwa im
            Scratchpad). Mit --laden werden sie dorthin heruntergeladen, sonst
            müssen sie dort schon liegen.
--nur-klein Baut nur die kleinen Fassungen aus den schon zugeschnittenen
            Bildern unter public/karten/ neu; ohne Rohbilder und ohne Netz.
Ziel ist immer public/karten/ (Karten und Logo) sowie public/favicon.ico und
public/apple-touch-icon.png. Dazu kommt von jeder Karte eine kleine Fassung,
240 Pixel breit, unter public/karten-klein/: Am Tisch sind die Karten 30 bis
96 Pixel breit, und der Browser wählt die kleine Fassung über `srcset`, solange
sie für die Pixeldichte reicht (src/ui/karten/Karte.tsx).

Braucht Pillow nur lokal (pip install Pillow); es ist keine Abhängigkeit des
Repos, weil die fertigen Bilder eingecheckt sind.
"""

from __future__ import annotations

import argparse
import sys
import urllib.request
from pathlib import Path

WEBSITE = "https://schlangentanz.ch/images/"
WURZEL = Path(__file__).resolve().parent.parent
ZIEL = WURZEL / "public" / "karten"
ZIEL_KLEIN = WURZEL / "public" / "karten-klein"
# Breite der kleinen Fassung: reicht für 96 px breite Handkarten bei
# zweifacher und für 80 px bei dreifacher Pixeldichte.
KLEINE_BREITE = 240
OEFFENTLICH = WURZEL / "public"

# Seitenverhältnis der zugeschnittenen Farbkarten (470×766 Pixel).
SEITENVERHAELTNIS = 470 / 766
# Eckradius der Farbkarten im Verhältnis zur Kartenbreite (gemessen: 24 px bei 470 px).
ECKRADIUS_ANTEIL = 24 / 470
# Ab dieser Abweichung vom Randgrau gilt ein Pixel als Teil der Karte.
SCHWELLE = 28
# So viele Pixel an der Bildkante werden übergangen: Einzelne Bilder tragen dort
# eine helle Linie, die sonst als Karte zählte (Schlangenhäutung).
KANTE = 4
# Hintergrund für das Apple-Touch-Icon: --farbe-grund aus src/ui/tokens.css.
GRUND = (251, 246, 238)

# Name im Spiel → Datei auf der Website. Die Zuordnung der Dateinamen steht im
# Quelltext der Regelseite (Bild neben Überschrift und Kartentext).
RANDKARTEN = {
    "farbe-blau": "01-bluesnake.webp",
    "farbe-rot": "01-redsnake.webp",
    "farbe-gelb": "01-yellowsnake.webp",
    "farbe-violett": "02-violetsnake.webp",
    "farbe-braun": "02-brownsnake.webp",
    "farbe-gruen": "03-greensnake.webp",
    "sonder-farbenschutz": "farbenschutz.webp",
    "sonder-regenbogenschlange": "regenbogenschlange.webp",
    "sonder-schlangenfrass": "bild-66658355.webp",
    "sonder-schlangenblockade": "bild-8a15ae0d.webp",
    "sonder-farbendieb": "bild-c340c00a.webp",
    "sonder-schlangengrube": "bild-7f3efeb8.webp",
    "sonder-farbenfusion": "farbenfusion.webp",
    "sonder-verdoppler": "verdoppler.webp",
    "sonder-schlangenhaeutung": "schlangenhaeutung.webp",
    "sonder-schlangenkorb-des-gluecks": "schlangenkorb.webp",
}

RANDLOSE_KARTEN = {
    "comeback": "comeback.webp",
    "risiko-belohnung": "bild-0bbf239a.webp",
    "aufgabe-farbenpracht": "bild-b88a1d80.webp",
    "aufgabe-farbharmonie": "bild-a0ea7ad9.webp",
    "aufgabe-farbkombination": "bild-9e90a863.webp",
    "aufgabe-farbvielfalt": "bild-2fcbed0e.webp",
    "aufgabe-vielfaltskoenig": "aufgabe-vielfaltskoenig.webp",
    "aufgabe-farbwechsler": "bild-34b6c905.webp",
    "aufgabe-fusionsexperte": "bild-70901105.webp",
    "aufgabe-schlangenbeschwoerer": "bild-70609541.webp",
    "aufgabe-schlangenmeister": "bild-18b9e1d8.webp",
    "aufgabe-schlangenrepertoire": "bild-f3dc4fee.webp",
    "aufgabe-schlangenbaendiger": "bild-0a48ad41.webp",
    "aufgabe-schlangentanz": "bild-55f3fe2f.webp",
    "aufgabe-symmetriemeister": "bild-e4f9f334.webp",
    "aufgabe-gelber-schatz": "bild-f32118ed.webp",
    "aufgabe-lila-riese": "bild-ae4c2ec2.webp",
}

LOGO = "logo.webp"
# Quadrat um den Schlangenkopf im zugeschnittenen Logo (links, oben, rechts, unten).
FAVICON_AUSSCHNITT = (300, 0, 500, 200)


def lade_pillow():
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        sys.exit("Pillow fehlt. Einmal lokal installieren: python -m pip install --user Pillow")
    return Image, ImageDraw


def lade_rohbilder(roh: Path) -> None:
    roh.mkdir(parents=True, exist_ok=True)
    for datei in [*RANDKARTEN.values(), *RANDLOSE_KARTEN.values(), LOGO]:
        anfrage = urllib.request.Request(WEBSITE + datei, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(anfrage, timeout=30) as antwort:
            (roh / datei).write_bytes(antwort.read())
        print(f"geladen: {datei}")


def randfarbe(bild) -> tuple[int, int, int]:
    """Häufigste Farbe auf einem Ring 3 bis 8 Pixel innerhalb der Bildkante."""
    breite, hoehe = bild.size
    zaehler: dict[tuple[int, int, int], int] = {}
    for abstand in range(3, 9):
        for x in range(0, breite, 4):
            for punkt in ((x, abstand), (x, hoehe - 1 - abstand)):
                zaehler[bild.getpixel(punkt)] = zaehler.get(bild.getpixel(punkt), 0) + 1
        for y in range(0, hoehe, 4):
            for punkt in ((abstand, y), (breite - 1 - abstand, y)):
                zaehler[bild.getpixel(punkt)] = zaehler.get(bild.getpixel(punkt), 0) + 1
    return max(zaehler, key=zaehler.get)


def ist_karte(pixel, rand) -> bool:
    return max(abs(a - b) for a, b in zip(pixel, rand)) > SCHWELLE


def kartenkasten(bild, rand) -> tuple[int, int, int, int]:
    """Kasten der Karte: Spalten und Zeilen, die zur Hälfte aus Kartenpixeln bestehen.

    Über Anteile statt über das erste abweichende Pixel, weil Teile einer Karte
    fast so grau sind wie der Rand (Schlangenhäutung, rechte Seite).
    """
    breite, hoehe = bild.size
    def spalte_gehoert(x):
        treffer = sum(ist_karte(bild.getpixel((x, y)), rand) for y in range(hoehe // 5, hoehe * 4 // 5, 3))
        return treffer > len(range(hoehe // 5, hoehe * 4 // 5, 3)) // 2
    def zeile_gehoert(y):
        treffer = sum(ist_karte(bild.getpixel((x, y)), rand) for x in range(breite // 5, breite * 4 // 5, 3))
        return treffer > len(range(breite // 5, breite * 4 // 5, 3)) // 2
    links = next(x for x in range(KANTE, breite) if spalte_gehoert(x))
    rechts = next(x for x in range(breite - 1 - KANTE, -1, -1) if spalte_gehoert(x))
    oben = next(y for y in range(KANTE, hoehe) if zeile_gehoert(y))
    unten = next(y for y in range(hoehe - 1 - KANTE, -1, -1) if zeile_gehoert(y))
    # Ein Pixel nach innen: Die Kante selbst ist mit dem Grau verwischt.
    return links + 1, oben + 1, rechts, unten


def eckradius(bild, rand, kasten) -> int:
    """Eckradius aus dem ersten Kartenpixel auf der Diagonale der Ecke oben links."""
    links, oben, _, _ = kasten
    schritt = next(t for t in range(200) if ist_karte(bild.getpixel((links + t, oben + t)), rand))
    # Auf der Diagonalen liegt der Kreisbogen bei r·(1 − 1/√2) vom Eckpunkt.
    return round(schritt / (1 - 2 ** -0.5)) + 1


def runde_ecken(bild, radius: int, Image, ImageDraw):
    """Durchsichtige Ecken mit vierfach überabgetasteter, weicher Kante."""
    faktor = 4
    breite, hoehe = bild.size
    maske = Image.new("L", (breite * faktor, hoehe * faktor), 0)
    ImageDraw.Draw(maske).rounded_rectangle(
        (0, 0, breite * faktor - 1, hoehe * faktor - 1), radius=radius * faktor, fill=255
    )
    ergebnis = bild.convert("RGBA")
    ergebnis.putalpha(maske.resize((breite, hoehe), Image.LANCZOS))
    return ergebnis


def speichere(bild, name: str) -> None:
    pfad = ZIEL / f"{name}.webp"
    bild.save(pfad, "WEBP", quality=86, method=6)
    print(f"{pfad.relative_to(WURZEL)}: {bild.size[0]}×{bild.size[1]}, {pfad.stat().st_size // 1024} KB")


def schneide_randkarte(roh: Path, name: str, datei: str, Image, ImageDraw) -> None:
    bild = Image.open(roh / datei).convert("RGB")
    rand = randfarbe(bild)
    kasten = kartenkasten(bild, rand)
    radius = eckradius(bild, rand, kasten)
    speichere(runde_ecken(bild.crop(kasten), radius, Image, ImageDraw), name)


def schneide_randlose_karte(roh: Path, name: str, datei: str, Image, ImageDraw) -> None:
    bild = Image.open(roh / datei).convert("RGB")
    breite, hoehe = bild.size
    neue_breite = round(hoehe * SEITENVERHAELTNIS)
    links = (breite - neue_breite) // 2
    karte = bild.crop((links, 0, links + neue_breite, hoehe))
    speichere(runde_ecken(karte, round(neue_breite * ECKRADIUS_ANTEIL), Image, ImageDraw), name)


def logo_und_favicon(roh: Path, Image) -> None:
    logo = Image.open(roh / LOGO).convert("RGBA")
    kasten = logo.getchannel("A").point(lambda wert: 255 if wert > 8 else 0).getbbox()
    logo = logo.crop(kasten)
    speichere(logo, "logo")

    # Im Browser-Tab (16 bis 64 px) ist vom ganzen Logo nur ein Karton zu erkennen;
    # deshalb trägt das Favicon allein den Schlangenkopf.
    kopf = logo.crop(FAVICON_AUSSCHNITT)
    kopf.save(OEFFENTLICH / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    seite = max(logo.size)
    quadrat = Image.new("RGBA", (seite, seite), (0, 0, 0, 0))
    quadrat.paste(logo, ((seite - logo.size[0]) // 2, (seite - logo.size[1]) // 2))
    # Apple setzt durchsichtige Flächen schwarz; deshalb auf dem Seitengrund und mit Rand.
    symbol = Image.new("RGB", (180, 180), GRUND)
    klein = quadrat.resize((150, 150), Image.LANCZOS)
    symbol.paste(klein, (15, 15), klein)
    symbol.save(OEFFENTLICH / "apple-touch-icon.png", optimize=True)
    print("public/favicon.ico, public/apple-touch-icon.png")


def kleine_fassungen(Image) -> None:
    """Jede Karte unter public/karten/ (ohne Logo) noch einmal, KLEINE_BREITE Pixel breit."""
    ZIEL_KLEIN.mkdir(parents=True, exist_ok=True)
    for veraltet in ZIEL_KLEIN.glob("*.webp"):
        veraltet.unlink()
    for gross in sorted(ZIEL.glob("*.webp")):
        if gross.name == LOGO:
            continue
        bild = Image.open(gross).convert("RGBA")
        hoehe = round(bild.size[1] * KLEINE_BREITE / bild.size[0])
        klein = bild.resize((KLEINE_BREITE, hoehe), Image.LANCZOS)
        pfad = ZIEL_KLEIN / gross.name
        klein.save(pfad, "WEBP", quality=75, method=6)
        print(f"{pfad.relative_to(WURZEL)}: {KLEINE_BREITE}×{hoehe}, {pfad.stat().st_size // 1024} KB")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--roh", type=Path, help="Ordner für die Rohbilder der Website")
    parser.add_argument("--laden", action="store_true", help="Rohbilder vorher von schlangentanz.ch laden")
    parser.add_argument("--nur-klein", action="store_true", help="nur die kleinen Fassungen neu bauen")
    argumente = parser.parse_args()

    Image, ImageDraw = lade_pillow()
    if argumente.nur_klein:
        kleine_fassungen(Image)
        return 0
    if argumente.roh is None:
        parser.error("--roh fehlt (oder --nur-klein angeben)")
    if argumente.laden:
        lade_rohbilder(argumente.roh)
    fehlend = [d for d in [*RANDKARTEN.values(), *RANDLOSE_KARTEN.values(), LOGO] if not (argumente.roh / d).exists()]
    if fehlend:
        print(f"Im Ordner {argumente.roh} fehlen: {', '.join(fehlend)}. Mit --laden holen.", file=sys.stderr)
        return 1

    ZIEL.mkdir(parents=True, exist_ok=True)
    for name, datei in RANDKARTEN.items():
        schneide_randkarte(argumente.roh, name, datei, Image, ImageDraw)
    for name, datei in RANDLOSE_KARTEN.items():
        schneide_randlose_karte(argumente.roh, name, datei, Image, ImageDraw)
    logo_und_favicon(argumente.roh, Image)
    kleine_fassungen(Image)
    return 0


if __name__ == "__main__":
    sys.exit(main())
