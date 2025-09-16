import { Item } from '../schema/item.ts'
import { Geolocation } from '../schema/geolocation.ts'
import { shrinkWikiItem } from '../helper/wikiitem.ts'
import { db } from '../db.ts'
import { readdir } from 'fs/promises'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'
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
            }).onConflictDoUpdate({
              target: Item.id,
              set: {
                d: shrunkItem,
              }
            })

            if (shrunkItem.location?.latitude) {
              await db.insert(Geolocation).values({
                id: shrunkItem.id,
                minX: clampLatLng(shrunkItem.location.latitude - 0.0001),
                maxX: clampLatLng(shrunkItem.location.latitude + 0.0001),
                minY: clampLatLng(shrunkItem.location.longitude - 0.0001),
                maxY: clampLatLng(shrunkItem.location.longitude + 0.0001),
              }).onConflictDoUpdate({
                target: Geolocation.id,
                set: {
                  minX: clampLatLng(shrunkItem.location.latitude - 0.0001),
                  maxX: clampLatLng(shrunkItem.location.latitude + 0.0001),
                  minY: clampLatLng(shrunkItem.location.longitude - 0.0001),
                  maxY: clampLatLng(shrunkItem.location.longitude + 0.0001),
                }
              })
            }

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
