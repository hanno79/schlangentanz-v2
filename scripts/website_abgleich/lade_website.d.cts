// Typen zu scripts/website_abgleich/lade_website.cjs für die Tests.
import type { LaunchOptions, Page } from 'playwright'

export type Dialog = { label: string; md: string }
export type DialogText = { label: string; text: string }
export type Website = {
  seiteMd: string
  seiteText: string
  bundle: string
  dialogeMd: Dialog[]
  dialogeText: DialogText[]
}
export type LeseOptionen = {
  mindestText?: number
  wartezeit?: number
  nachlauf?: number
  offeneAnfragen?: () => string[]
}

export declare function startOptionen(): LaunchOptions & { args: string[] }
export declare function beobachteAnfragen(seite: Page): () => string[]
export declare function liesSeite(seite: Page, optionen?: LeseOptionen): Promise<Website>
export declare function ladeWebsite(): Promise<Website>
