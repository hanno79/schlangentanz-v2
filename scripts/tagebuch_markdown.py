#!/usr/bin/env python3
"""Setzt eine kleine Markdown-Untermenge nach HTML um.

Bewusst klein und ohne Fremdabhängigkeit: diese Datei wird zusammen mit
tagebuch_bauen.py in Zielprojekte kopiert. Was nicht zur Untermenge gehört,
erscheint als Text — nie als HTML.

Unterstützt: Überschriften (## bis ####), Absätze, Aufzählungen, nummerierte
Listen, fett, kursiv, Code in der Zeile, Codeblöcke, Verweise, einfache
Tabellen, waagerechte Linien, Abbildungen (eigene Zeile `![[name]]`, nur
mit Rückruf; sonst bleibt die Zeile Text).
"""

from __future__ import annotations

import html
import re
from typing import Callable

UEBERSCHRIFT = re.compile(r"^(#{2,4}) +(.*)$")
# Führende Leerzeichen geben die Ebene an: zwei je Stufe.
AUFZAEHLUNG = re.compile(r"^( *)- +(.*)$")
NUMMERIERT = re.compile(r"^( *)(\d+)\. +(.*)$")
TABELLENZEILE = re.compile(r"^\|(.+)\|$")
EINBETTUNG = re.compile(r"^!\[\[([A-Za-z0-9_-]+)\]\]$")
TRENNZEILE = re.compile(r"^\|\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|$")

CODE = re.compile(r"`([^`]+)`")
DREIFACH = re.compile(r"\*\*\*(.+?)\*\*\*")
FETT = re.compile(r"\*\*(.+?)\*\*")
KURSIV = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")
# Das Ziel darf eine Ebene runder Klammern enthalten, etwa Wikipedia-Titel wie A_(B).
VERWEIS = re.compile(r"\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)")


def zeilen(text: str) -> list[str]:
    """Zeilen nur an \\n getrennt; U+2028 und ähnliche Zeichen bleiben Teil des Textes."""
    return text.split("\n")


def zellen_teilen(inhalt: str) -> list[str]:
    """Teilt den Inhalt einer Tabellenzeile an | ausser in Code und bei \\|."""
    zellen: list[str] = []
    aktuell: list[str] = []
    im_code = False
    stelle = 0
    while stelle < len(inhalt):
        zeichen_ = inhalt[stelle]
        if zeichen_ == "\\" and inhalt[stelle + 1:stelle + 2] == "|":
            aktuell.append("|")
            stelle += 2
            continue
        if zeichen_ == "`":
            im_code = not im_code
        if zeichen_ == "|" and not im_code:
            zellen.append("".join(aktuell).strip())
            aktuell = []
        else:
            aktuell.append(zeichen_)
        stelle += 1
    zellen.append("".join(aktuell).strip())
    return zellen


def _ist_sicheres_ziel(url: str) -> bool:
    """Prüft, ob ein Verweis-Ziel sicher ist.

    Nur relative Pfade, http:, https: und mailto: werden akzeptiert.
    Javascript: und andere Protokolle sind nicht erlaubt.
    """
    url = url.strip()
    if url.startswith("#"):
        return True  # Anker auf derselben Seite, auch mit Doppelpunkt im Namen
    return (
        not url.startswith("javascript:")
        and not url.startswith("data:")
        and (
            url.startswith("/")
            or url.startswith("http://")
            or url.startswith("https://")
            or url.startswith("mailto:")
            or (not ":" in url.split("/")[0])  # Relative Pfade ohne Protokoll
        )
    )


def zeichen(text: str) -> str:
    """Auszeichnungen innerhalb einer Zeile.

    Der übergebene Text ist bereits HTML-escaped. Verwendet eine
    Platzhalter-Strategie: Code und Verweise werden zuerst herausgenommen,
    dann Betonungen angewendet, dann wieder eingesetzt. So können Sternchen
    im Code oder in Verweis-Zielen nicht als Fettung gedeutet werden.
    """
    # Schritt 1: NUL-Zeichen aus Eingabe entfernen
    text = text.replace("\x00", "")

    # Schritt 2: Code-Abschnitte durch Platzhalter ersetzen
    code_merker: dict[str, str] = {}
    zaehler = 0

    def code_sub(treffer: re.Match[str]) -> str:
        nonlocal zaehler
        platzhalter = f"\x00{zaehler}\x00"
        code_merker[platzhalter] = f"<code>{treffer.group(1)}</code>"
        zaehler += 1
        return platzhalter

    text = CODE.sub(code_sub, text)

    # Schritt 3: Verweise durch Platzhalter ersetzen (mit Sicherheitsprüfung)
    verweis_merker: dict[str, str] = {}

    def verweis_sub(treffer: re.Match[str]) -> str:
        nonlocal zaehler
        ankertext = treffer.group(1)
        ziel = treffer.group(2)

        if _ist_sicheres_ziel(ziel):
            html_link = f'<a href="{ziel}">{ankertext}</a>'
        else:
            # Unsichere Ziele werden als Text beibehalten: "Ankertekt (Ziel)"
            html_link = f"{ankertext} ({ziel})"

        platzhalter = f"\x00{zaehler}\x00"
        verweis_merker[platzhalter] = html_link
        zaehler += 1
        return platzhalter

    text = VERWEIS.sub(verweis_sub, text)

    # Schritt 4: Betonungen anwenden (***fett+kursiv*** zuerst)
    text = DREIFACH.sub(lambda t: f"<strong><em>{t.group(1)}</em></strong>", text)
    text = FETT.sub(lambda t: f"<strong>{t.group(1)}</strong>", text)
    text = KURSIV.sub(lambda t: f"<em>{t.group(1)}</em>", text)

    # Schritt 5: Platzhalter zurücksetzen. Erst die Verweise, denn ihr Linktext
    # kann selbst noch einen Code-Platzhalter enthalten.
    for platzhalter, wert in verweis_merker.items():
        text = text.replace(platzhalter, wert)
    for platzhalter, wert in code_merker.items():
        text = text.replace(platzhalter, wert)

    return text


def nach_html(markdown: str,
              abbildung: Callable[[str], str] | None = None,
              erste_ebene: int = 2) -> str:
    """Setzt einen Textblock nach HTML um. Alles wird zuerst escaped.

    Mit `abbildung` wird eine Zeile `![[name]]` durch dessen Rückgabe ersetzt;
    der Baustein stammt vom Generator und wird unverändert eingesetzt.

    `erste_ebene` ist die HTML-Ebene für `##`; `###` und `####` folgen
    darunter, höchstens h6. Ein Text, der unter einer h3 steht (Eintrag im
    Verlauf), beginnt so mit h4 statt mit einer h2, die die Gliederung der
    Seite verdrehte.
    """
    teile: list[str] = []
    absatz: list[str] = []
    # Je Punkt: Ebene, Listenart (ul/ol), Text und Startnummer.
    liste: list[tuple[int, str, str, int]] = []
    listenart = ""
    tabelle: list[list[str]] = []
    code: list[str] | None = None

    def absatz_schliessen() -> None:
        nonlocal absatz
        if absatz:
            teile.append("<p>" + zeichen(" ".join(absatz)) + "</p>")
            absatz = []

    def liste_bauen(stelle: int, ebene: int) -> tuple[str, int]:
        art, start = liste[stelle][1], liste[stelle][3]
        kopf = f'<{art} start="{start}">' if art == "ol" and start != 1 else f"<{art}>"
        punkte = []
        while stelle < len(liste) and liste[stelle][0] == ebene:
            punkt = "<li>" + zeichen(liste[stelle][2])
            stelle += 1
            if stelle < len(liste) and liste[stelle][0] > ebene:
                unterliste, stelle = liste_bauen(stelle, ebene + 1)
                punkt += unterliste
            punkte.append(punkt + "</li>")
        return kopf + "".join(punkte) + f"</{art}>", stelle

    def liste_schliessen() -> None:
        nonlocal liste, listenart
        if liste:
            teile.append(liste_bauen(0, 0)[0])
            liste = []
            listenart = ""

    def listenpunkt(einzug: str, art: str, text: str, start: int) -> None:
        nonlocal listenart
        absatz_schliessen()
        tabelle_schliessen()
        # Höchstens eine Ebene tiefer als der vorige Punkt; die erste Ebene bestimmt die Listenart.
        ebene = min(len(einzug) // 2, liste[-1][0] + 1) if liste else 0
        if ebene == 0 and listenart != art:
            liste_schliessen()
            listenart = art
        liste.append((ebene, art, text, start))

    def tabelle_schliessen() -> None:
        nonlocal tabelle
        if tabelle:
            kopf, *rumpf = tabelle
            kopfzellen = "".join(f"<th>{zeichen(z)}</th>" for z in kopf)
            reihen = "".join(
                "<tr>" + "".join(f"<td>{zeichen(z)}</td>" for z in reihe) + "</tr>"
                for reihe in rumpf)
            teile.append(f"<table><thead><tr>{kopfzellen}</tr></thead>"
                         f"<tbody>{reihen}</tbody></table>")
            tabelle = []

    def alles_schliessen() -> None:
        absatz_schliessen()
        liste_schliessen()
        tabelle_schliessen()

    for roh in zeilen(markdown):
        if roh.strip().startswith("```"):
            if code is None:
                alles_schliessen()
                code = []
            else:
                teile.append("<pre><code>"
                             + html.escape("\n".join(code))
                             + "</code></pre>")
                code = None
            continue
        if code is not None:
            code.append(roh)
            continue

        zeile = html.escape(roh.rstrip())
        nackt = zeile.strip()

        if not nackt:
            alles_schliessen()
            continue
        if nackt == "---":
            alles_schliessen()
            teile.append("<hr>")
            continue

        if abbildung is not None:
            treffer = EINBETTUNG.match(roh.strip())
            if treffer:
                alles_schliessen()
                teile.append(abbildung(treffer.group(1)))
                continue

        treffer = UEBERSCHRIFT.match(zeile)
        if treffer:
            alles_schliessen()
            stufe = min(6, erste_ebene + len(treffer.group(1)) - 2)
            teile.append(f"<h{stufe}>{zeichen(treffer.group(2))}</h{stufe}>")
            continue

        # Trennzeile gilt nur direkt nach dem Kopf (erste Zeile der Tabelle);
        # ohne Kopf ist sie gewöhnlicher Text und keine Tabelle.
        if TRENNZEILE.match(nackt):
            if len(tabelle) == 1:
                continue
            if not tabelle:
                liste_schliessen()
                absatz.append(nackt)
                continue
        treffer = TABELLENZEILE.match(nackt)
        if treffer:
            absatz_schliessen()
            liste_schliessen()
            tabelle.append(zellen_teilen(treffer.group(1)))
            continue

        treffer = AUFZAEHLUNG.match(zeile)
        if treffer:
            listenpunkt(treffer.group(1), "ul", treffer.group(2), 1)
            continue

        treffer = NUMMERIERT.match(zeile)
        if treffer:
            listenpunkt(treffer.group(1), "ol", treffer.group(3), int(treffer.group(2)))
            continue

        liste_schliessen()
        tabelle_schliessen()
        absatz.append(nackt)

    if code is not None:
        teile.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
    alles_schliessen()
    return "\n".join(teile)
