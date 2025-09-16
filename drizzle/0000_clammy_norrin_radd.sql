CREATE TABLE `geolocation` (
	`id` integer PRIMARY KEY NOT NULL,
	`minX` real NOT NULL,
	`maxX` real NOT NULL,
	`minY` real NOT NULL,
	`maxY` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` integer PRIMARY KEY NOT NULL,
	`d` text
);
--> statement-breakpoint
CREATE TABLE `text` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`place` text,
	`deity` text,
	`sect` text,
	`typeof` text
);
--> statement-breakpoint
CREATE TABLE `vocab` (
	`word` text NOT NULL,
	`rank` integer DEFAULT 1,
	`langid` integer DEFAULT 0,
	`soundslike` text
);
