ALTER TABLE `setlist_items` ADD `item_type` text DEFAULT 'song' NOT NULL;--> statement-breakpoint
ALTER TABLE `template_items` ADD `item_type` text DEFAULT 'song' NOT NULL;
