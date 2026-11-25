import { vi } from 'vitest'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Fabrik } from '../src/ki/strategien/strategie'
import { WURZEL } from './probebaum'

/** Wo eine Registry steht: Datei relativ zur Wurzel und Name des Exports. */
export interface RegistryQuelle {
  pfad: string
  registry: string
}

/** Die Registry der Strategien im Repo (U5, P0.3d). */
export const STRATEGIEN_REGISTRY: RegistryQuelle = { pfad: 'src/ki/strategien/index.ts', registry: 'STRATEGIEN' }

/**
 * Eine Registry, frisch geladen: `vi.resetModules()` lässt auch alle Strategien und
 * ihre Abhängigkeiten neu laden (Isolationstest P0.3d, Messläufe K5).
 */
export async function ladeRegistry({ pfad, registry }: RegistryQuelle): Promise<Readonly<Record<string, Fabrik>>> {
  vi.resetModules()
  const modul: Record<string, unknown> = await import(/* @vite-ignore */ pathToFileURL(join(WURZEL, pfad)).href)
  const eintraege = modul[registry]
  if (typeof eintraege !== 'object' || eintraege === null) throw new Error(`Registry laden: ${pfad} exportiert keine Registry ${registry}`)
  return eintraege as Readonly<Record<string, Fabrik>>
}

/** Die Fabrik `eintrag` aus einer frisch geladenen Registry; fehlt sie dort, ein Fehler mit Grund. */
export async function ladeFrischeFabrik(quelle: RegistryQuelle, eintrag: string): Promise<Fabrik> {
  const fabrik = (await ladeRegistry(quelle))[eintrag]
  if (fabrik === undefined) throw new Error(`Registry laden: Die Strategie ${eintrag} steht nicht in der Registry ${quelle.pfad}.`)
  return fabrik
}
