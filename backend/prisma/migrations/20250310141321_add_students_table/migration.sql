-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `matricule` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `campus` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Student_matricule_key`(`matricule`),
    UNIQUE INDEX `Student_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
