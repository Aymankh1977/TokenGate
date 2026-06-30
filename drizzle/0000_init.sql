CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`passwordHash` varchar(255),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`balancePico` bigint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('purchase','usage','refund') NOT NULL,
	`amountUsd` varchar(32) NOT NULL DEFAULT '0',
	`costUsd` varchar(32),
	`description` text,
	`stripePaymentId` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`keyPrefix` varchar(16) NOT NULL,
	`last4` varchar(8) NOT NULL DEFAULT '',
	`name` varchar(255) NOT NULL,
	`lastUsedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `usageLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`apiKeyId` int,
	`model` varchar(255) NOT NULL,
	`service` varchar(100) NOT NULL,
	`chargedUsd` varchar(32) NOT NULL DEFAULT '0',
	`costUsd` varchar(32) NOT NULL DEFAULT '0',
	`requestTokens` int,
	`responseTokens` int,
	`status` enum('success','failed','insufficient_balance') NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usageLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelPricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`model` varchar(255) NOT NULL,
	`service` varchar(100) NOT NULL,
	`inputPicoPerToken` bigint NOT NULL DEFAULT 0,
	`outputPicoPerToken` bigint NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modelPricing_id` PRIMARY KEY(`id`),
	CONSTRAINT `modelPricing_model_unique` UNIQUE(`model`)
);
--> statement-breakpoint
CREATE TABLE `processedStripeEvents` (
	`eventId` varchar(255) NOT NULL,
	`type` varchar(100),
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processedStripeEvents_eventId` PRIMARY KEY(`eventId`)
);
