#!/usr/bin/env python3
"""Gemeinsame HTML-Bausteine aller Tagebuchseiten.

Das Gerüst mit Kopf und Gliederung sowie die Bausteine, die mehrere Seiten
teilen (Abbildung, Kennzahlen, Kurzform eines Eintrags). Gelesen und geprüft
wird in tagebuch_quellen.py und tagebuch_modell.py, die einzelnen Seiten
stehen in tagebuch_kapitel.py und tagebuch_verlauf.py. Wird zusammen mit den
übrigen tagebuch_*.py in Zielprojekte kopiert und muss deshalb ohne
Fremdabhängigkeit auskommen.
"""

from __future__ import annotations

import html
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tagebuch_quellen import (KAPITEL, Abbildung, Eintrag, Kennzahl, Projekt,
                              TagebuchFehler)


# (Seite, Beschriftung, Gruppe): links in der Gliederung, Gruppe "" steht oben.
NAVIGATION = (
    (("index.html", "Überblick", ""),)
    + tuple((seite, f"{nummer} {titel}", "")
            for nummer, _datei, titel, seite in KAPITEL)
    + (("verlauf.html", "Verlauf", "nachschlagen"),
       ("abbildungen.html", "Abbildungen", "nachschlagen")))

# Nur mit Testregister: eine eigene Gruppe unter Nachschlagen.
TESTS_NAVIGATION = (("tests.html", "Tests", "pruefen"),
                    ("durchgaenge.html", "Durchgänge", "pruefen"))

GRUPPEN = {"nachschlagen": "Nachschlagen", "pruefen": "Prüfen"}


def html_text(text: str) -> str:
    """Escaped einen einzelnen Wert für die Ausgabe."""
    return html.escape(text)


def eintrag_anker(datei: str) -> str:
    """Anker eines Eintrags im Verlauf: 'e-' und der Dateistamm, escaped.

    Die id im Verlauf und jeder Verweis darauf entstehen hier; liefen sie
    auseinander, führten die Verweise von Überblick und Kapiteln ins Leere.
    """
    return "e-" + html_text(Path(datei).stem)


def eintrag_verweis(datei: str, tiefe: int = 0) -> str:
    """Verweis auf einen Eintrag im Verlauf; tiefe=1 aus einem Unterordner."""
    return f"{'../' * tiefe}verlauf.html#{eintrag_anker(datei)}"


def datum_anzeige(iso: str) -> str:
    """Wandelt JJJJ-MM-TT in TT.MM.JJJJ; alles andere ist ein Fehler."""
    try:
        return datetime.strptime(iso, "%Y-%m-%d").strftime("%d.%m.%Y")
    except ValueError:
        raise TagebuchFehler(
            f"Datum '{iso}' ist nicht im Format JJJJ-MM-TT.") from None


def _navigation(aktiv: str, hoch: str, mit_tests: bool = False) -> str:
    """Gliederung links; jede Gruppe beginnt mit ihrer Überschrift."""
    stuecke = []
    gruppe = ""
    punkte = NAVIGATION + (TESTS_NAVIGATION if mit_tests else ())
    for ziel, beschriftung, art in punkte:
        if art != gruppe:
            gruppe = art
            stuecke.append(f'<li class="gruppe">{GRUPPEN[art]}</li>')
        markierung = ' class="aktiv" aria-current="page"' if ziel == aktiv else ""
        stuecke.append(f'<li><a href="{hoch}{ziel}"{markierung}>'
                       f'{html_text(beschriftung)}</a></li>')
    return '<nav aria-label="Gliederung"><ul>' + "".join(stuecke) + "</ul></nav>"


def seite(titel: str, aktiv: str, projekt: Projekt, aktualisiert: str,
          inhalt: str, tiefe: int = 0, eigen: bool = False,
          mit_tests: bool = False) -> str:
    """Gemeinsames Gerüst: Kopf mit Projektangaben, Gliederung links, Inhalt.

    `aktualisiert` ist ISO-Datum oder leer (dann entfällt die Angabe).
    tiefe=1 für Seiten in einem Unterordner. Der Projektname ist bewusst
    keine h1: die eine h1 je Seite gehört dem Inhalt, sonst trügen alle
    Seiten für Vorleser und Gliederungswerkzeuge denselben Titel.
    `mit_tests` fügt die Gruppe Prüfen hinzu; Seiten unter tests/ übergeben
    "tests.html" als `aktiv` und bekommen die Klasse seite-testfall.
    """
    hoch = "../" * tiefe
    # Die Gestaltung ordnet den Überblick anders an als eine Kapitelseite.
    # In Unterordnern liegen Datensatzseiten (aktiv ist Kapitel 2) und
    # Testfallseiten (aktiv ist tests.html); jede Art teilt sich eine Klasse.
    if tiefe:
        seitenklasse = "testfall" if aktiv == "tests.html" else "datensatz"
    else:
        seitenklasse = Path(aktiv).stem
    body_klasse = (f' class="seite-{html_text(seitenklasse)}"'
                   if seitenklasse else "")
    angaben = [f'<span class="status" data-stand="{html_text(projekt.stand)}">'
               f'{html_text(projekt.stand)}</span>',
               f'<span>seit {datum_anzeige(projekt.start)}</span>']
    if projekt.beteiligte:
        angaben.append(f'<span>{html_text(projekt.beteiligte)}</span>')
    if aktualisiert:
        angaben.append(
            f'<span>zuletzt aktualisiert {datum_anzeige(aktualisiert)}</span>')
    angaben_text = " &middot; ".join(angaben)
    # Nach stil.css eingebunden, damit die Projektfassung gewinnt.
    umbruch = chr(10)
    eigen_verweis = (
        f'{umbruch}<link rel="stylesheet" href="{hoch}eigen.css">'
        if eigen else "")
    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html_text(titel)} — {html_text(projekt.projekt)}</title>
<link rel="stylesheet" href="{hoch}stil.css">{eigen_verweis}
<script src="{hoch}tagebuch.js" defer></script>
</head>
<body{body_klasse}>
<header class="kopf"><div class="innen">
<p class="projektname">{html_text(projekt.projekt)}</p>
<p class="angaben">{angaben_text}</p>
</div></header>
<div class="rahmen">
{_navigation(aktiv, hoch, mit_tests)}
<main>
{inhalt}
</main>
</div>
<footer>Erzeugt aus den Quellen unter <code>tagebuch/</code>. Nicht von Hand bearbeiten.</footer>
</body>
</html>
"""


def abbildung_html(abbildung: Abbildung, nummer: str, tiefe: int = 0) -> str:
    """Eine Abbildung als <figure>: Bild oder Tabelle, dazu Beschriftung."""
    hoch = "../" * tiefe
    if abbildung.art == "tabelle":
        kopf, *zeilen = abbildung.tabelle
        inhalt = (
            "<table><thead><tr>"
            + "".join(f"<th>{html_text(z)}</th>" for z in kopf)
            + "</tr></thead><tbody>"
            + "".join("<tr>" + "".join(f"<td>{html_text(z)}</td>" for z in zeile)
                      + "</tr>" for zeile in zeilen)
            + "</tbody></table>")
    else:
        inhalt = (f'<img loading="lazy" '
                  f'src="{hoch}abbildungen/{html_text(abbildung.datei)}" '
                  f'alt="{html_text(abbildung.titel)}">')
    return (f'<figure id="abb-{html_text(abbildung.name)}" '
            f'data-art="{html_text(abbildung.art)}">{inhalt}'
            f'<figcaption>{html_text(nummer)} &middot; '
            f'{html_text(abbildung.titel)} &middot; '
            f'{html_text(abbildung.quelle)}</figcaption></figure>')


def kennzahlen_html(kennzahlen: list[Kennzahl], als_kacheln: bool) -> str:
    """Kennzahlen als Kacheln (Überblick) oder als Liste (Kapitel)."""
    if not kennzahlen:
        return ""
    klasse = "kennzahlen kacheln" if als_kacheln else "kennzahlen liste"
    stuecke = []
    for kennzahl in kennzahlen:
        herkunft = (f'<em class="herkunft">{html_text(kennzahl.herkunft)}</em>'
                    if kennzahl.herkunft else "")
        stuecke.append(
            f'<div class="kachel"><b class="wert">{html_text(kennzahl.wert)}</b>'
            f'<span class="bezeichnung">{html_text(kennzahl.bezeichnung)}</span>'
            f'{herkunft}</div>')
    return f'<div class="{klasse}">' + "".join(stuecke) + "</div>"


def eintrag_kurz_html(eintrag: Eintrag, tiefe: int = 0) -> str:
    """Kurzform eines Eintrags mit Link auf seine Stelle im Verlauf."""
    hoch = "../" * tiefe
    seite_je_nummer = {nummer: (titel, seite)
                       for nummer, _datei, titel, seite in KAPITEL}
    verweise = ""
    if eintrag.kapitel:
        verweise = '<span class="kapitel">' + ", ".join(
            f'<a href="{hoch}{seite_je_nummer[n][1]}">Kap. {n} '
            f'{html_text(seite_je_nummer[n][0])}</a>'
            for n in eintrag.kapitel) + "</span>"
    return (f'<article class="eintrag-kurz {html_text(eintrag.art)}" '
            f'data-art="{html_text(eintrag.art)}">'
            f'<a class="titel" href="{eintrag_verweis(eintrag.datei, tiefe)}">'
            f'{html_text(eintrag.titel)}</a>'
            f'<span class="art">{html_text(eintrag.art)}</span>'
            f'<time datetime="{html_text(eintrag.datum)}">'
            f'{datum_anzeige(eintrag.datum)}</time>{verweise}</article>')
