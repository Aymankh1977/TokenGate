CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`keyPrefix` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`lastUsedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `modelPricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`model` varchar(255) NOT NULL,
	`service` varchar(100) NOT NULL,
	`inputTokenPrice` decimal(20,10) NOT NULL,
	`outputTokenPrice` decimal(20,10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modelPricing_id` PRIMARY KEY(`id`),
	CONSTRAINT `modelPricing_model_unique` UNIQUE(`model`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('purchase','usage','refund') NOT NULL,
	`amount` decimal(20,6) NOT NULL,
	`description` text,
	`stripePaymentId` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usageLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`apiKeyId` int,
	`model` varchar(255) NOT NULL,
	`service` varchar(100) NOT NULL,
	`tokensUsed` decimal(20,6) NOT NULL,
	`tokensDeducted` decimal(20,6) NOT NULL,
	`requestTokens` int,
	`responseTokens` int,
	`status` enum('success','failed','insufficient_balance') NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usageLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `tokenBalance` decimal(20,6) DEFAULT '0' NOT NULL;