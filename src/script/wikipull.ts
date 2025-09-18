import { Item } from '../schema/item.ts'
import { Geolocation } from '../schema/geolocation.ts'
import { Text } from '../schema/text.ts'

import { shrinkWikiItem } from '../helper/wikiitem.ts'
import { db } from '../db.ts'
import { readdir } from 'fs/promises'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import transliterate from '@sindresorhus/transliterate';
import { clampLatLng } from '../helper/utilmaths.ts'

async function processWikiFiles() {
  try {
    // Get the path to the atlas-data/wiki directory
    const wikiDir = resolve('./atlas-data/wiki')
    console.log('Processing files from:', wikiDir)

    // Loop through all the files in the ../atlas-data/wiki directory
    // Only if the file extension is `.jsonl`
    const files = await readdir(wikiDir)
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'))

    console.log(`Found ${jsonlFiles.length} JSONL files to process`)

    // Delete all the data from the `item`, `geolocation` and `text` tables
    console.log('Clearing existing data from item, geolocation, and text tables...')
    await db.delete(Item)
    await db.delete(Geolocation)
    await db.delete(Text)
    console.log('Existing data cleared.')

    let totalProcessed = 0

    // For each file, read the file line by line
    for (const filename of jsonlFiles) {
      console.log(`Processing ${filename}...`)
      const filePath = join(wikiDir, filename)

      try {
        // Read the entire file content
        const fileContent = readFileSync(filePath, 'utf-8')
        const lines = fileContent.trim().split('\n')

        let fileProcessed = 0

        // For each line, parse the JSON
        for (const line of lines) {
          if (!line.trim()) { continue; }
          try {
            const wikiItem = JSON.parse(line)
            // shrink the JSON using the helper function
            const shrunkItem = shrinkWikiItem(wikiItem)

            // Insert or update the JSON into the SQLite database `item` table
            await db.insert(Item).values({
              id: shrunkItem.id,
              d: shrunkItem,
            })

            if (shrunkItem.location?.latitude) {
              const insertUpdateObjGeo = {
                minX: clampLatLng(shrunkItem.location.longitude - 0.0001),
                maxX: clampLatLng(shrunkItem.location.longitude + 0.0001),
                minY: clampLatLng(shrunkItem.location.latitude - 0.0001),
                maxY: clampLatLng(shrunkItem.location.latitude + 0.0001),
              }

              await db.insert(Geolocation).values({
                id: shrunkItem.id,
                ...insertUpdateObjGeo,
              })

            } // End of location check

            const insertUpdateObjText = {
              name: transliterate(`$${shrunkItem.name} ${shrunkItem.alias}`).replaceAll(',', ' ').toLocaleLowerCase(),
              place: (shrunkItem.claims?.P4 || []).join(' '),
              deity: (shrunkItem.claims?.P20 || []).join(' '),
              sect: (shrunkItem.claims?.P16 || []).join(' '),
              typeof: (shrunkItem.claims?.P1 || []).join(' '),
            }

            await db.insert(Text).values({
              id: shrunkItem.id,
              ...insertUpdateObjText,
            })

            fileProcessed++
            totalProcessed++

            if (fileProcessed % 100 === 0) {
              console.log(`  Processed ${fileProcessed} items from ${filename}`)
            }
          } catch (jsonError) {
            console.error(`Error parsing JSON in ${filename}:`, jsonError)
            console.error('Problematic line:', line.substring(0, 200) + '...')
          }
        }

        console.log(`✅ Completed ${filename}: ${fileProcessed} items processed`)
      } catch (fileError) {
        console.error(`Error reading file ${filename}:`, fileError)
      }
    }

    console.log(`🎉 All files processed! Total items: ${totalProcessed}`)
  } catch (error) {
    console.error('Error processing wiki files:', error)
    throw error
  }
}

// Run the script if this file is executed directly
if (import.meta.main) {
  processWikiFiles().catch(console.error)
}
