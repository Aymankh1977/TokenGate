-- 0002_credits_fix.sql
-- Migrates the broken "decimal token balance" model to integer pico-USD,
-- hashed API keys, integer pico/token pricing, and webhook idempotency.
-- Review before running in production; back up first.

-- 1) users: integer pico-USD balance
ALTER TABLE `users` ADD COLUMN `balancePico` BIGINT NOT NULL DEFAULT 0;
-- Old `tokenBalance` is left in place (deprecated). Balances in the old build
-- were not meaningful (unit bug), so do NOT auto-convert; reconcile manually if
-- real money was involved, then: ALTER TABLE `users` DROP COLUMN `tokenBalance`;

-- 2) transactions: human-readable USD ledger + provider cost
ALTER TABLE `transactions` ADD COLUMN `amountUsd` VARCHAR(32) NOT NULL DEFAULT '0';
ALTER TABLE `transactions` ADD COLUMN `costUsd` VARCHAR(32) NULL;
-- (optional cleanup later) ALTER TABLE `transactions` DROP COLUMN `amount`;

-- 3) apiKeys: store hash only + display fields
ALTER TABLE `apiKeys` ADD COLUMN `last4` VARCHAR(8) NOT NULL DEFAULT '';
-- keyHash already exists and is UNIQUE; we now actually put an HMAC hash there.

-- 4) modelPricing: integer pico-USD per token
ALTER TABLE `modelPricing` ADD COLUMN `inputPicoPerToken` BIGINT NOT NULL DEFAULT 0;
ALTER TABLE `modelPricing` ADD COLUMN `outputPicoPerToken` BIGINT NOT NULL DEFAULT 0;
-- (optional cleanup later) ALTER TABLE `modelPricing`
--   DROP COLUMN `inputTokenPrice`, DROP COLUMN `outputTokenPrice`;

-- 5) usageLogs: USD figures (rename/replace the old token columns)
ALTER TABLE `usageLogs` ADD COLUMN `chargedUsd` VARCHAR(32) NOT NULL DEFAULT '0';
ALTER TABLE `usageLogs` ADD COLUMN `costUsd` VARCHAR(32) NOT NULL DEFAULT '0';
-- (optional cleanup later) ALTER TABLE `usageLogs`
--   DROP COLUMN `tokensUsed`, DROP COLUMN `tokensDeducted`;

-- 6) webhook idempotency
CREATE TABLE `processedStripeEvents` (
  `eventId` VARCHAR(255) NOT NULL,
  `type` VARCHAR(100),
  `processedAt` TIMESTAMP NOT NULL DEFAULT (now()),
  CONSTRAINT `processedStripeEvents_eventId` PRIMARY KEY(`eventId`)
);
