-- Add new columns to users table if they don't exist
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `email` varchar(255) NOT NULL AFTER `username`,
ADD COLUMN IF NOT EXISTS `first_name` varchar(255) AFTER `email`,
ADD COLUMN IF NOT EXISTS `last_name` varchar(255) AFTER `first_name`,
ADD COLUMN IF NOT EXISTS `active` int NOT NULL DEFAULT 1 AFTER `role`;

-- Add unique constraint on email
ALTER TABLE `users` 
ADD UNIQUE INDEX IF NOT EXISTS `users_email_unique` (`email`);

-- Create company_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `company_users` (
  `company_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`company_id`, `user_id`),
  CONSTRAINT `fk_company_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_company_users_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
