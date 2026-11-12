#!/usr/bin/env python3
"""Setzt Überblick und Kapitelseiten des Projekttagebuchs in HTML um.

Der Überblick ist der Steckbrief des Projekts: Kurzfassung, Kennzahlen,
Meilenstein-Strahl, Stand heute, zuletzt Passiertes, nächste Schritte und
die neuesten Abbildungen. Dazu kommen die Kapitelseiten samt ihren Zusätzen
(Datengrundlage, Entscheidungen, Ergebnisse, offene Punkte). Die Datei liest
nichts und rechnet nichts aus; sie setzt um, was tagebuch_modell.py
abgeleitet hat. Wird zusammen mit den übrigen tagebuch_*.py in Zielprojekte
kopiert und muss deshalb ohne Fremdabhängigkeit auskommen.

regelcheck: laenge-bewusst Katalog und Datensatzseite teilen Zellen-, Datums-
und Namensbausteine mit den Kapitelseiten; ein eigenes Modul dafür wäre eine
weitere Datei, die beim Kopieren in Zielprojekte vollständig mitgehen muss.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import tagebuch_markdown
from tagebuch_modell import Strahlpunkt, rolle
from tagebuch_quellen import (DATUM_MUSTER, PFLICHTABSCHNITTE, Abbildung,
                              Datensatz, Eintrag, Kapitel, Plan, Projekt,
                              TagebuchFehler, reihenfolge)
from tagebuch_seiten import (abbildung_html, datum_anzeige, eintrag_anker,
                             eintrag_kurz_html, eintrag_verweis, html_text,
                             kennzahlen_html)

ZULETZT_PASSIERT = 3
ALS_NAECHSTES = 5
CAROUSEL_BILDER = 12


def _bereich(klasse: str, titel: str, inhalt: str) -> str:
    return (f'<section class="{klasse}"><h2>{html_text(titel)}</h2>'
            f'{inhalt}</section>')


def _strahl(strahl: list[Strahlpunkt]) -> str:
    """Erreichte Punkte, dann die Heute-Marke, dann die geplanten.

    Die Marke steht nur, wenn es beide Sorten gibt; sonst gäbe es nichts, was
    sie trennen könnte.
    """
    stuecke = []
    erreicht_vorher = False
    for punkt in strahl:
        erreicht = bool(punkt.erreicht)
        if erreicht_vorher and not erreicht:
            stuecke.append('<li class="heute" aria-hidden="true">heute</li>')
        erreicht_vorher = erreicht
        if erreicht:
            titel = html_text(punkt.titel)
            if punkt.eintrag:
                titel = f'<a href="{eintrag_verweis(punkt.eintrag)}">{titel}</a>'
            zeit = f"erreicht {datum_anzeige(punkt.erreicht)}"
            status = "erreicht"
        else:
            titel = html_text(punkt.titel)
            zeit = f"geplant {html_text(punkt.geplant)}" if punkt.geplant else "geplant"
            status = "geplant"
        stuecke.append(f'<li class="strahlpunkt" data-status="{status}">'
                       f'<span class="titel">{titel}</span>'
                       f'<small class="zeit">{zeit}</small></li>')
    return '<ol class="strahl">' + "".join(stuecke) + "</ol>"


def _zuletzt(eintraege: list[Eintrag]) -> str:
    neueste = sorted(eintraege, key=reihenfolge,
                     reverse=True)[:ZULETZT_PASSIERT]
    if neueste:
        inhalt = ('<div class="zuletzt">'
                  + "".join(eintrag_kurz_html(e) for e in neueste) + "</div>")
    else:
        inhalt = '<p class="leer">Noch keine Einträge.</p>'
    return _bereich("zuletzt-passiert", "Zuletzt passiert",
                    inhalt + '<a class="mehr" href="verlauf.html">ganzer Verlauf</a>')


def _naechstes(plan: Plan) -> str:
    if not plan.offen:
        return _bereich("als-naechstes", "Als Nächstes",
                        '<p class="leer">Keine offenen Punkte.</p>')
    zeilen = []
    for punkt in plan.offen[:ALS_NAECHSTES]:
        details = []
        if punkt.wer:
            details.append(f'<span class="wer">{html_text(punkt.wer)}</span>')
        if punkt.blockiert:
            details.append('<span class="blockiert">blockiert '
                           f'{html_text(punkt.blockiert)}</span>')
        if punkt.seit:
            details.append(f'<span class="seit">seit {html_text(punkt.seit)}</span>')
        klein = f"<small>{' &middot; '.join(details)}</small>" if details else ""
        zeilen.append(f'<li><span class="punkt">{html_text(punkt.punkt)}</span>'
                      f'{klein}</li>')
    # Ohne Verweis hielte man die gekürzte Liste für vollständig.
    mehr = ""
    if len(plan.offen) > ALS_NAECHSTES:
        mehr = (f'<a class="mehr" href="offen.html">alle {len(plan.offen)} '
                f'offenen Punkte</a>')
    return _bereich("als-naechstes", "Als Nächstes",
                    "<ol>" + "".join(zeilen) + "</ol>" + mehr)


def _carousel(abbildungen: list[Abbildung], nummern: dict[str, str]) -> str:
    neueste = sorted(abbildungen, key=lambda a: (a.datum, a.name),
                     reverse=True)[:CAROUSEL_BILDER]
    folien = "".join(
        f'<div class="folie">{abbildung_html(a, nummern[a.name])}</div>'
        for a in neueste)
    return (
        '<section class="abbildungen"><h2>Abbildungen</h2>'
        '<div class="carousel" data-carousel>'
        '<button type="button" data-zurueck aria-label="Zurück">&lsaquo;</button>'
        f'<div class="folien">{folien}</div>'
        '<button type="button" data-weiter aria-label="Weiter">&rsaquo;</button>'
        '</div><a class="mehr" href="abbildungen.html">alle Abbildungen</a>'
        '</section>')


def ueberblick(projekt: Projekt, plan: Plan, strahl: list[Strahlpunkt],
               eintraege: list[Eintrag], abbildungen: list[Abbildung],
               nummern: dict[str, str], test_kachel: str = "") -> str:
    """Inhalt der Seite index.html. Bereiche ohne Inhalt entfallen ganz.

    `test_kachel` ist das fertige HTML der Durchgangskachel aus dem
    Testregister; ohne Register bleibt sie leer und entfällt.
    """
    teile = [f'<section class="kurzfassung">'
             f'{tagebuch_markdown.nach_html(projekt.kurzfassung)}</section>']
    if projekt.kennzahlen:
        teile.append(kennzahlen_html(projekt.kennzahlen, als_kacheln=True))
    if test_kachel:
        teile.append(f'<div class="testregister">{test_kachel}</div>')
    if strahl:
        teile.append(_bereich("meilensteine", "Meilensteine", _strahl(strahl)))
    # Mit `stand_vom` sieht man dem Stand an, wann er geschrieben wurde; ohne
    # das Datum hiesse auch ein Wochen alter Text "Stand heute".
    titel = (f"Stand vom {datum_anzeige(projekt.stand_vom)}"
             if projekt.stand_vom else "Stand heute")
    teile.append(_bereich("stand-heute", titel,
                          tagebuch_markdown.nach_html(projekt.stand_heute)))
    teile.append(_zuletzt(eintraege))
    teile.append(_naechstes(plan))
    if abbildungen:
        teile.append(_carousel(abbildungen, nummern))
    return "\n".join(teile)


def kapitelseite(kapitel: Kapitel, eintraege: list[Eintrag],
                 abbildungen: dict[str, Abbildung], nummern: dict[str, str],
                 zusatz: str = "") -> str:
    """Inhalt einer Kapitelseite: Text, Zusatz der Seite, Einträge des Kapitels.

    Ein leeres Kapitel wird sichtbar als leer angezeigt statt weggelassen,
    damit eine Lücke im Tagebuch auffällt.
    """
    if kapitel.rumpf.strip():
        text = tagebuch_markdown.nach_html(
            kapitel.rumpf,
            lambda name: abbildung_html(abbildungen[name], nummern[name]))
    else:
        text = '<p class="leer">Dieses Kapitel ist noch leer.</p>'
    eigene = sorted((e for e in eintraege if kapitel.nummer in e.kapitel),
                    key=reihenfolge, reverse=True)
    if eigene:
        liste = "".join(eintrag_kurz_html(e) for e in eigene)
    else:
        liste = '<p class="leer">Noch keine Einträge.</p>'
    return (f'<section class="kapitel-text">{text}</section>\n{zusatz}\n'
            f'<section class="kapitel-eintraege">'
            f'<h2>Einträge zu diesem Kapitel</h2>{liste}</section>')


def _zelle(wert: str) -> str:
    """Leere Zellen zeigen einen Strich, damit Lücken als Lücken sichtbar sind."""
    return html_text(wert) if wert else "–"


def _datum(wert: str) -> str:
    """Ein ISO-Datum als TT.MM.JJJJ wie überall auf der Seite, sonst unverändert.

    Umgestellte v1-Datensätze dürfen '2026-10' oder 'Herbst 2026' tragen; das
    ist kein Tagesdatum, aber auch kein Fehler im Datensatz, und bleibt
    deshalb so stehen, wie es geschrieben ist.
    """
    if not re.fullmatch(DATUM_MUSTER, wert):
        return wert
    try:
        return datum_anzeige(wert)
    except TagebuchFehler:
        # '2026-13-45' hat die Form eines Datums, ist aber kein Tag. Hier wird
        # nur entschieden, ob umgeschrieben wird, nicht geprüft.
        return wert


def _umbruchstellen(name: str) -> str:
    """Datensatznamen brechen nur nach '_' oder '-', nie mitten im Wort.

    Namen bestehen nach NAME_MUSTER nur aus Buchstaben, Ziffern, '_' und '-';
    das Escapen vorher ändert an ihnen nichts.
    """
    return html_text(name).replace("_", "_<wbr>").replace("-", "-<wbr>")


KATALOG_SPALTEN = ("Datensatz", "Herkunft", "Stand", "Bezogen", "Format", "KBS",
                   "Umfang", "Lizenz", "Rolle")
ROLLEN = (("original", "Originale"), ("aufbereitet", "Aufbereitet"),
          ("ergebnis", "Ergebnis"))


def _knoten(datensatz: Datensatz) -> str:
    klasse = "knoten geplant" if datensatz.status == "geplant" else "knoten"
    zusatz = " (geplant)" if datensatz.status == "geplant" else ""
    return (f'<a class="{klasse}" href="daten/{html_text(datensatz.name)}.html">'
            f'{html_text(datensatz.name)}{zusatz}</a>')


def _datenfluss(datensaetze: list[Datensatz], rueck: dict[str, list[str]]) -> str:
    spalten = []
    for art, beschriftung in ROLLEN:
        knoten = "".join(_knoten(d) for d in datensaetze
                         if rolle(d, rueck) == art)
        spalten.append(f'<div class="spalte" data-rolle="{art}">'
                       f'<span class="k">{beschriftung}</span>{knoten}</div>')
    return ('<section class="datenfluss"><h2>Datenfluss</h2>'
            f'<div class="fluss">{"".join(spalten)}</div></section>')


def _katalog(datensaetze: list[Datensatz], rueck: dict[str, list[str]]) -> str:
    kopf = "".join(f"<th>{s}</th>" for s in KATALOG_SPALTEN)
    zeilen = []
    for d in datensaetze:
        weitere = d.weitere
        zellen = [
            f'<a href="daten/{html_text(d.name)}.html">{_umbruchstellen(d.name)}</a>',
            _zelle(weitere.get("anbieter") or d.quelle), _zelle(_datum(d.stand)),
            _zelle(_datum(d.bezogen_am)), _zelle(d.format),
            _zelle(weitere.get("koordinatensystem", "")),
            _zelle(weitere.get("umfang", "")), _zelle(weitere.get("lizenz", "")),
            _zelle(rolle(d, rueck))]
        klasse = ' class="geplant"' if d.status == "geplant" else ""
        zeilen.append(f"<tr{klasse}>" + "".join(f"<td>{z}</td>" for z in zellen)
                      + "</tr>")
    return ('<section class="katalog"><h2>Datenkatalog</h2><table><thead><tr>'
            f'{kopf}</tr></thead><tbody>{"".join(zeilen)}</tbody></table>'
            '</section>')


def datengrundlage_zusatz(datensaetze: list[Datensatz],
                          rueck: dict[str, list[str]]) -> str:
    """Datenfluss in drei Spalten (nach Rolle) und Katalog-Tabelle."""
    if not datensaetze:
        return ('<section class="katalog"><h2>Datenkatalog</h2>'
                '<p class="leer">Noch keine Datensätze.</p></section>')
    return _datenfluss(datensaetze, rueck) + "\n" + _katalog(datensaetze, rueck)


ZAHL = r"-?\d+(?:\.\d+)?"
AUSDEHNUNG = re.compile(
    rf"\s*({ZAHL})\s*,\s*({ZAHL})\s*,\s*({ZAHL})\s*,\s*({ZAHL})"
    r"(?:\s+(EPSG:\d+))?\s*")
# Unter dieser Spanne wäre der Rahmen im Gradnetz der Erde nur ein Punkt.
GRADNETZ_AB_GRAD = 2.0


def _ausdehnung(wert: str) -> str:
    """Vier Zahlen (west, süd, ost, nord) als Tabelle, grosse Gebiete auch als Bild.

    Das Rahmenbild steht nur bei Grad (ohne Angabe oder EPSG:4326) und ab
    GRADNETZ_AB_GRAD Spanne: eine Gemeinde wäre im Gradnetz ein Punkt, und
    Meter lassen sich ohne Umrechnung nicht ehrlich einzeichnen. Ein Wert in
    anderer Schreibweise bleibt Text.
    """
    treffer = AUSDEHNUNG.fullmatch(wert)
    if not treffer:
        return f'<p class="ausdehnung-text">{html_text(wert)}</p>'
    *zahlen, kbs = treffer.groups()
    kopf = ["West", "Süd", "Ost", "Nord"] + (["KBS"] if kbs else [])
    zellen = zahlen + ([kbs] if kbs else [])
    tabelle = (
        '<table class="ausdehnung-werte"><thead><tr>'
        + "".join(f"<th>{k}</th>" for k in kopf) + "</tr></thead><tbody><tr>"
        + "".join(f"<td>{html_text(z)}</td>" for z in zellen)
        + "</tr></tbody></table>")
    west, sued, ost, nord = (float(z) for z in zahlen)
    in_grad = kbs in (None, "EPSG:4326") and (
        -180 <= west < ost <= 180 and -90 <= sued < nord <= 90)
    gross = max(ost - west, nord - sued) >= GRADNETZ_AB_GRAD
    if not (in_grad and gross):
        return tabelle
    svg = (
        '<svg class="ausdehnung" viewBox="0 0 360 180" role="img" '
        'aria-label="Ausdehnung im Gradnetz der Erde">'
        '<rect class="rahmen" x="0" y="0" width="360" height="180" fill="none" '
        'stroke="currentColor"/>'
        f'<rect class="ausdehnung-flaeche" x="{west + 180:g}" y="{90 - nord:g}" '
        f'width="{ost - west:g}" height="{nord - sued:g}" fill="currentColor" '
        'fill-opacity="0.4" stroke="currentColor"/></svg>')
    return tabelle + svg


# Kopffelder sind ohne Umlaute geschrieben, damit sie sich tippen lassen; auf
# der Seite stehen sie als Wörter. Fehlt ein Feld hier, erscheint es mit
# grossem Anfangsbuchstaben.
FELD_BESCHRIFTUNG = {"schluesselfeld": "Schlüsselfeld", "pruefsumme": "Prüfsumme"}


def datensatzseite(datensatz: Datensatz, rueck: dict[str, list[str]]) -> str:
    """Seite eines Datensatzes unter daten/; Verweise auf Nachbarseiten.

    Der Name ist die h1 der Seite; das Gerüst setzt keine eigene.
    """
    felder = [("Quelle", datensatz.quelle), ("Bezogen am", datensatz.bezogen_am),
              ("Stand", datensatz.stand), ("Format", datensatz.format),
              ("Ablage", datensatz.ablage)]
    felder += [(FELD_BESCHRIFTUNG.get(name, name.capitalize()), wert)
               for name, wert in datensatz.weitere.items()]
    if datensatz.status:
        felder.append(("Status", datensatz.status))
    liste = "".join(f"<dt>{html_text(n)}</dt><dd>{html_text(_datum(w))}</dd>"
                    for n, w in felder)

    def verweise(namen: list[str]) -> str:
        if not namen:
            return "<p>–</p>"
        return "<p>" + ", ".join(
            f'<a href="{html_text(n)}.html">{html_text(n)}</a>'
            for n in namen) + "</p>"

    ausdehnung = datensatz.weitere.get("ausdehnung", "")
    abschnitt = (f'<section class="ausdehnung-abschnitt"><h2>Ausdehnung</h2>'
                 f'{_ausdehnung(ausdehnung)}</section>' if ausdehnung else "")
    return (f'<h1 class="seitentitel">{html_text(datensatz.name)}</h1>'
            f'<dl class="felder">{liste}</dl>'
            f'<section class="herkunft"><h2>Ausgangspunkt</h2>'
            f"{verweise(datensatz.basiert_auf)}</section>"
            f'<section class="herkunft"><h2>Fliesst ein in</h2>'
            f"{verweise(rueck.get(datensatz.name, []))}</section>"
            f"{abschnitt}"
            f"{tagebuch_markdown.nach_html(datensatz.rumpf)}")


def _eintrag_kopf(eintrag: Eintrag) -> str:
    return (f'<h2 id="{eintrag_anker(eintrag.datei)}">'
            f'<a href="{eintrag_verweis(eintrag.datei)}">'
            f'{html_text(eintrag.titel)}</a></h2>'
            f'<p class="kopf"><time datetime="{html_text(eintrag.datum)}">'
            f'{datum_anzeige(eintrag.datum)}</time> &middot; '
            f'{html_text(eintrag.wer)}</p>')


def _neueste(eintraege: list[Eintrag], art: str) -> list[Eintrag]:
    return sorted((e for e in eintraege if e.art == art),
                  key=reihenfolge, reverse=True)


# Auf den Seiten Entscheidungen und Ergebnisse ist der Eintragstitel h2 und
# ein Abschnitt h3; ein v1-Rumpf und Unterüberschriften beginnen bei h3.
LISTE_EBENE = 3


def _abschnitt(eintrag: Eintrag, titel: str) -> str:
    text = eintrag.abschnitte.get(titel, "")
    return (f'<section class="abschnitt"><h3>{html_text(titel)}</h3>'
            f'{tagebuch_markdown.nach_html(text, erste_ebene=LISTE_EBENE)}'
            '</section>')


def entscheidungen_zusatz(eintraege: list[Eintrag]) -> str:
    """Alle Entscheidungen, neueste zuerst; v1 ohne Abschnitte mit ihrem Rumpf."""
    gefunden = _neueste(eintraege, "entscheidung")
    if not gefunden:
        return '<p class="leer">Noch keine Entscheidungen.</p>'
    stuecke = []
    for e in gefunden:
        if e.v1:
            inhalt = tagebuch_markdown.nach_html(e.rumpf, erste_ebene=LISTE_EBENE)
        else:
            inhalt = "".join(_abschnitt(e, t)
                             for t in PFLICHTABSCHNITTE["entscheidung"])
        stuecke.append(f'<article class="entscheidung">{_eintrag_kopf(e)}'
                       f'{inhalt}</article>')
    return '<section class="entscheidungen">' + "".join(stuecke) + "</section>"


# Der Abschnitt einer Auswertung, der allein in Kapitel 4 erscheint:
# 'Ergebnis', der mittlere ihrer drei Pflichtabschnitte.
ERGEBNIS = PFLICHTABSCHNITTE["auswertung"][1]


def ergebnisse_zusatz(eintraege: list[Eintrag]) -> str:
    """Alle Auswertungen, neueste zuerst, mit Kennzahlen und Ergebnis."""
    gefunden = _neueste(eintraege, "auswertung")
    if not gefunden:
        return '<p class="leer">Noch keine Auswertungen.</p>'
    stuecke = []
    for e in gefunden:
        inhalt = (tagebuch_markdown.nach_html(e.rumpf, erste_ebene=LISTE_EBENE)
                  if e.v1 else _abschnitt(e, ERGEBNIS))
        stuecke.append(
            f'<article class="auswertung">{_eintrag_kopf(e)}'
            f'{kennzahlen_html(e.kennzahlen, als_kacheln=False)}{inhalt}'
            '</article>')
    return '<section class="auswertungen">' + "".join(stuecke) + "</section>"


def offen_zusatz(plan: Plan, strahl: list[Strahlpunkt]) -> str:
    """Alle offenen Punkte als Tabelle, darunter die unerreichten Meilensteine."""
    if plan.offen:
        zeilen = "".join(
            f"<tr><td>{_zelle(p.punkt)}</td><td>{_zelle(p.wer)}</td>"
            f"<td>{_zelle(p.blockiert)}</td><td>{_zelle(p.seit)}</td></tr>"
            for p in plan.offen)
        punkte = ('<section class="offene-punkte"><h2>Offene Punkte</h2><table>'
                  '<thead><tr><th>Punkt</th><th>wer</th><th>blockiert</th>'
                  f'<th>seit</th></tr></thead><tbody>{zeilen}</tbody></table>'
                  '</section>')
    else:
        punkte = ('<section class="offene-punkte"><h2>Offene Punkte</h2>'
                  '<p class="leer">Keine offenen Punkte.</p></section>')
    unerreicht = [p for p in strahl if not p.erreicht]
    if not unerreicht:
        return punkte
    zeilen = "".join(
        '<li class="strahlpunkt" data-status="geplant">'
        f'<span class="titel">{html_text(p.titel)}</span>'
        f'<small class="zeit">geplant'
        f'{" " + html_text(p.geplant) if p.geplant else ""}</small></li>'
        for p in unerreicht)
    return (punkte + '\n<section class="meilensteine"><h2>Noch nicht erreichte '
            f'Meilensteine</h2><ul>{zeilen}</ul></section>')
