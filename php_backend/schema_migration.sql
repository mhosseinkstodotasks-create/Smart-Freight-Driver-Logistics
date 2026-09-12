-- =====================================================================
-- FREIGHT LOGISTICS COMPANY - MYSQL SCHEMA & SEED DATA
-- Charset: utf8mb4 / Persian Collation utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `freight_logistics` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `freight_logistics`;

-- -------------------------------------------------------------
-- 1. DRIVERS TABLE (رانندگان)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `drivers` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NULL,
    `full_name` VARCHAR(200) NOT NULL,
    `national_id` VARCHAR(10) NULL UNIQUE,
    `mobile_number` VARCHAR(15) NULL UNIQUE,
    `score` DECIMAL(3, 1) DEFAULT 5.0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_driver_national_id` (`national_id`),
    INDEX `idx_driver_mobile` (`mobile_number`),
    INDEX `idx_driver_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. FLEETS TABLE (ناوگانها / خودروها)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fleets` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `license_plate` VARCHAR(50) NOT NULL,
    `smart_fleet_number` VARCHAR(50) NULL UNIQUE,
    `vehicle_type` VARCHAR(100) DEFAULT 'کامیون',
    `vehicle_turn` VARCHAR(50) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_fleet_plate` (`license_plate`),
    INDEX `idx_fleet_smart` (`smart_fleet_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. FREIGHT ANNOUNCEMENTS TABLE (اعلام بارها)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `freight_announcements` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `announcement_number` VARCHAR(50) NOT NULL,
    `announcement_type` VARCHAR(50) DEFAULT 'نوع اول',
    `customer_reference` VARCHAR(255) NULL,
    `origin` VARCHAR(150) NOT NULL,
    `destination` VARCHAR(150) NOT NULL,
    `cargo_type` VARCHAR(150) DEFAULT 'کاشی/سرامیک',
    `weight` VARCHAR(50) NULL,
    `net_price` VARCHAR(100) NULL,
    `total_price` VARCHAR(100) NULL,
    `commission` VARCHAR(100) NULL,
    `bill_of_lading_company` VARCHAR(150) DEFAULT 'ایمان بار',
    `agent_name` VARCHAR(150) DEFAULT 'محمدحسین کرم سیچانی',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_freight_num` (`announcement_number`),
    INDEX `idx_freight_route` (`origin`, `destination`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 4. TRIPS TABLE (سفرها)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trips` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `trip_number` VARCHAR(50) NOT NULL,
    `driver_id` INT UNSIGNED NOT NULL,
    `fleet_id` INT UNSIGNED NOT NULL,
    `freight_id` INT UNSIGNED NOT NULL,
    `status` VARCHAR(50) DEFAULT 'فعال',
    `operator_name` VARCHAR(100) DEFAULT 'ناصر مدیر',
    `trip_date` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`fleet_id`) REFERENCES `fleets`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`freight_id`) REFERENCES `freight_announcements`(`id`) ON DELETE RESTRICT,
    INDEX `idx_trip_status` (`status`),
    INDEX `idx_trip_number` (`trip_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 5. CHAT HISTORY TABLE (تاریخچه و لاگ استخراج هوش مصنوعی)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_history` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(100) NOT NULL,
    `raw_message` TEXT NOT NULL,
    `extracted_json` JSON NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- SEED DATA MATCHING REAL COMPANY SYSTEM (FROM SCREENSHOTS)
-- -------------------------------------------------------------
INSERT INTO `drivers` (`id`, `first_name`, `last_name`, `full_name`, `national_id`, `mobile_number`, `score`) VALUES
(1, 'اسماعیل', 'حاتمی', 'اسماعیل حاتمی', '4640119402', '09162961902', 4.8),
(2, 'مسعود', 'عقراوی', 'مسعود عقراوی', '1810567890', '09132668653', 5.0),
(3, 'علی', 'اقبالی', 'علی اقبالی', '1289654321', '09145769715', 4.9),
(4, 'شاپور', 'معبودی', 'شاپور معبودی', '1987654320', '09145396757', 4.7),
(5, 'رحیم', 'عبدالوند', 'رحیم عبدالوند', '2564789123', '09167131483', 5.0)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `fleets` (`id`, `license_plate`, `smart_fleet_number`, `vehicle_type`, `vehicle_turn`) VALUES
(1, '۱۶ ع ۱۵۴ ایران ۴۳', '4248993', 'کامیون ده چرخ', 'ماشین چهارم'),
(2, '۱۱ ع ۱۲۵ ایران ۱۳', '3982104', 'تریلی کفی', 'ماشین اول'),
(3, '۷۳ ع ۲۹۷ ایران ۹۱', '5129482', 'کامیون تک', 'ماشین دوم'),
(4, '۹۴ ع ۲۳۴ ایران ۹۱', '4876123', 'تریلی چادری', 'ماشین سوم'),
(5, '۵۹ ع ۵۹۹ ایران ۳۱', '6192834', 'کامیون جفت', 'ماشین اول')
ON DUPLICATE KEY UPDATE `license_plate` = VALUES(`license_plate`);

INSERT INTO `freight_announcements` (`id`, `announcement_number`, `announcement_type`, `customer_reference`, `origin`, `destination`, `cargo_type`, `weight`, `net_price`, `total_price`, `commission`, `bill_of_lading_company`, `agent_name`) VALUES
(1, '249', 'نوع اول', 'حواله آقای میر هاشمی', 'کاشی اصفهان (نجف آباد)', 'گمرک شلمچه', 'پالت کاشی میرجلیلی', '24 تن', '46 م', '53 م', '500', 'ایمان بار', 'محمدحسین کرم سیچانی'),
(2, '249', 'نوع دوم', 'حواله آقای میر هاشمی', 'نجف آباد', 'گمرک شلمچه', 'پالت کاشی میرجلیلی', '22 تن', '45 م', '52 م', '500', 'ایمان بار', 'محمدحسین کرم سیچانی'),
(3, '237', 'نوع دوم', 'حافظی پالت کاشی نیلو', 'نجف آباد', 'چذابه', 'پالت کاشی نیلو', '25 تن', '48 م', '55 م', '—', 'ایمان بار', 'مژگان مغازه ای')
ON DUPLICATE KEY UPDATE `announcement_number` = VALUES(`announcement_number`);

INSERT INTO `trips` (`id`, `trip_number`, `driver_id`, `fleet_id`, `freight_id`, `status`, `operator_name`, `trip_date`, `notes`) VALUES
(984, 'سفر ۹۸۴#', 1, 1, 1, 'لغو سفر', 'ناصر کرمی', '1405/06/20 22:36', 'اعلامیه 249 نوع اول - ماشین چهارم - اسماعیل حاتمی'),
(983, 'سفر ۹۸۳#', 2, 2, 2, 'لغو سفر', 'ناصر کرمی', '1405/06/20 22:35', 'سفر مسعود عقراوی'),
(982, 'سفر ۹۸۲#', 3, 3, 2, 'لغو سفر', 'ناصر کرمی', '1405/06/20 22:33', 'سفر علی اقبالی'),
(981, 'سفر ۹۸۱#', 4, 4, 2, 'فعال', 'ناصر کرمی', '1405/06/20 22:32', 'سفر شاپور معبودی'),
(980, 'سفر ۹۸۰#', 5, 5, 3, 'فعال', 'مژگان مغازه ای', '1405/06/20 19:38', 'سفر رحیم عبدالوند')
ON DUPLICATE KEY UPDATE `trip_number` = VALUES(`trip_number`);
