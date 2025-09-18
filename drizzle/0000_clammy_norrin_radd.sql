CREATE VIRTUAL TABLE IF NOT EXISTS `geolocation` USING rtree(
  id,
  minX, maxX,
  minY, maxY
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` integer PRIMARY KEY NOT NULL,
	`d` text
);
--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS `textsearch` USING fts5(
  id,
  name,
  place,
  deity,
  sect,
  typeof
);
--> statement-breakpoint
-- CREATE VIRTUAL TABLE IF NOT EXISTS `vocab` USING spellfix1;
