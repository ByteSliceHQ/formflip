CREATE TABLE `form_mappings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`swirls_form_id` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `form_mappings_swirls_form_id_unique` ON `form_mappings` (`swirls_form_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `form_mappings_slug_unique` ON `form_mappings` (`slug`);--> statement-breakpoint
DROP TABLE `form_fields`;--> statement-breakpoint
DROP TABLE `form_submission_values`;--> statement-breakpoint
DROP TABLE `form_submissions`;--> statement-breakpoint
DROP TABLE `forms`;