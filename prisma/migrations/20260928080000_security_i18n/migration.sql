-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `canManageUsers` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `AdminSession` (
    `tokenHash` VARCHAR(64) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `AdminSession_usuarioId_idx`(`usuarioId`),
    INDEX `AdminSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`tokenHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminInvite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `canManageUsers` BOOLEAN NOT NULL DEFAULT false,
    `recovery` BOOLEAN NOT NULL DEFAULT false,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminInvite_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateBucket` (
    `id` VARCHAR(64) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `RateBucket_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entity` VARCHAR(40) NOT NULL,
    `entityId` INTEGER NOT NULL,
    `field` VARCHAR(40) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `sourceHash` VARCHAR(64) NOT NULL,
    `source` LONGTEXT NOT NULL,
    `text` LONGTEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContentTranslation_entity_entityId_field_locale_key`(`entity`, `entityId`, `field`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProtectedTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `term` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ProtectedTerm_term_key`(`term`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VisitorDay` (
    `day` VARCHAR(10) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`day`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VisitorReceipt` (
    `id` VARCHAR(64) NOT NULL,
    `day` VARCHAR(10) NOT NULL,

    INDEX `VisitorReceipt_day_idx`(`day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

