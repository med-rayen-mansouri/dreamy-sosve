-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('MOTHER', 'ADMIN') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Child` (
    `id` VARCHAR(191) NOT NULL,
    `motherId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `birthDate` DATE NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `personalityTags` JSON NULL,
    `interests` JSON NULL,
    `favoriteActivities` JSON NULL,
    `favoriteColors` JSON NULL,
    `birthdayThemes` JSON NULL,
    `giftWishes` JSON NULL,
    `comfortPreferences` JSON NULL,
    `approvedPlanningSummary` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Child_motherId_idx`(`motherId`),
    INDEX `Child_birthDate_idx`(`birthDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildNote` (
    `id` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `motherId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `inputMethod` ENUM('TEXT', 'VOICE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChildNote_childId_createdAt_idx`(`childId`, `createdAt`),
    INDEX `ChildNote_motherId_idx`(`motherId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('BIRTHDAY', 'SOS_EVENT') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(191) NULL,
    `eventDate` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `birthdayChildId` VARCHAR(191) NULL,
    `theme` VARCHAR(191) NULL,
    `plannedActivities` JSON NULL,
    `suggestedGiftIdeas` JSON NULL,
    `preparationNotes` TEXT NULL,
    `status` ENUM('DRAFT', 'AWAITING_APPROVAL', 'CHANGES_REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `organizerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Event_eventDate_status_idx`(`eventDate`, `status`),
    INDEX `Event_organizerId_idx`(`organizerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `motherId` VARCHAR(191) NOT NULL,
    `approvalStatus` ENUM('PENDING', 'APPROVED', 'DECLINED', 'CHANGES_REQUESTED') NOT NULL DEFAULT 'PENDING',
    `motherComment` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,

    INDEX `EventParticipant_motherId_approvalStatus_idx`(`motherId`, `approvalStatus`),
    UNIQUE INDEX `EventParticipant_eventId_childId_key`(`eventId`, `childId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventTask` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventTask_eventId_position_idx`(`eventId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventFeedback` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `childId` VARCHAR(191) NOT NULL,
    `motherId` VARCHAR(191) NOT NULL,
    `enjoyed` BOOLEAN NOT NULL,
    `favoriteActivity` VARCHAR(191) NULL,
    `comfortable` BOOLEAN NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EventFeedback_motherId_idx`(`motherId`),
    UNIQUE INDEX `EventFeedback_eventId_childId_key`(`eventId`, `childId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AiRequest_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Child` ADD CONSTRAINT `Child_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildNote` ADD CONSTRAINT `ChildNote_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildNote` ADD CONSTRAINT `ChildNote_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_birthdayChildId_fkey` FOREIGN KEY (`birthdayChildId`) REFERENCES `Child`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipant` ADD CONSTRAINT `EventParticipant_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipant` ADD CONSTRAINT `EventParticipant_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventParticipant` ADD CONSTRAINT `EventParticipant_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventTask` ADD CONSTRAINT `EventTask_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventFeedback` ADD CONSTRAINT `EventFeedback_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventFeedback` ADD CONSTRAINT `EventFeedback_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `Child`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventFeedback` ADD CONSTRAINT `EventFeedback_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AiRequest` ADD CONSTRAINT `AiRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

