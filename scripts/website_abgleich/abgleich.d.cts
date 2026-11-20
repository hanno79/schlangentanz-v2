// Typen zu scripts/website_abgleich/abgleich.cjs für die Tests.
import type { DialogText } from './lade_website.cjs'

export type Abdeckung = { geprueft: number; fehlend: string[]; formatiert: string[] }

export declare function pruefeAbdeckung(website: { seiteText: string; dialogeText: DialogText[] }, spec: string): Abdeckung
export declare const TEIL_A_KOPF: string
