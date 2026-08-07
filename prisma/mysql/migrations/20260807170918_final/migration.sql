-- AlterTable
ALTER TABLE `bookings` MODIFY `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `deletedAt` DATETIME(3) NULL;
