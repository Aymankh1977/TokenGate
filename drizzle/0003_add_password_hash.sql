-- 0003_add_password_hash.sql
-- Adds passwordHash column to users table to support local email/password auth.

ALTER TABLE `users` ADD COLUMN `passwordHash` VARCHAR(255) NULL;
