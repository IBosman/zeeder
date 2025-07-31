CREATE TABLE `companies` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_users` (
	`company_id` int NOT NULL,
	`user_id` int NOT NULL,
	CONSTRAINT `company_users_company_id_user_id_pk` PRIMARY KEY(`company_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `company_voices` (
	`company_id` int NOT NULL,
	`voice_id` varchar(255) NOT NULL,
	CONSTRAINT `company_voices_company_id_voice_id_pk` PRIMARY KEY(`company_id`,`voice_id`)
);
--> statement-breakpoint
CREATE TABLE `voices` (
	`voice_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voices_voice_id` PRIMARY KEY(`voice_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `first_name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `active` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `company_users` ADD CONSTRAINT `fk_company_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_users` ADD CONSTRAINT `fk_company_users_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_voices` ADD CONSTRAINT `fk_company_voices_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_voices` ADD CONSTRAINT `fk_company_voices_voice` FOREIGN KEY (`voice_id`) REFERENCES `voices`(`voice_id`) ON DELETE no action ON UPDATE no action;