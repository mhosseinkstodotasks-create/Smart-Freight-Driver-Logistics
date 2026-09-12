-- =====================================================================
-- DATABASE INSPECTION SCRIPT FOR EXISTING LOGISTICS SYSTEM
-- Run this script in phpMyAdmin, MySQL Workbench, or CLI to discover:
-- 1. All existing table names
-- 2. Column names, data types, nullability, defaults
-- 3. Primary keys, foreign keys, and unique indexes
-- 4. Potential matches for Drivers, Fleets, Freights, and Trips
-- =====================================================================

-- Replace 'freight_logistics' with your actual database name if different:
SET @TARGET_DB = DATABASE();

SELECT CONCAT('Current Database: ', IFNULL(@TARGET_DB, 'None selected')) AS Status;

-- 1. List all tables in the database with row counts and comments
SELECT 
    TABLE_NAME, 
    TABLE_ROWS, 
    CREATE_TIME, 
    UPDATE_TIME, 
    TABLE_COMMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = @TARGET_DB 
ORDER BY TABLE_NAME;

-- 2. Detailed Column Analysis for all tables
SELECT 
    TABLE_NAME, 
    ORDINAL_POSITION, 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY, 
    COLUMN_DEFAULT, 
    EXTRA, 
    COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @TARGET_DB 
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 3. Primary & Foreign Keys and Relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = @TARGET_DB 
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. Unique and Performance Indexes
SELECT 
    TABLE_NAME, 
    INDEX_NAME, 
    NON_UNIQUE, 
    SEQ_IN_INDEX, 
    COLUMN_NAME, 
    INDEX_TYPE 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = @TARGET_DB 
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 5. Auto-Discovery Query for Potential Logistics Entities:
-- Look for tables or columns containing keywords: driver, ranandeh, fleet, navgan, kamion, plate, pelak, freight, bar, ealam, trip, safar
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    COLUMN_TYPE 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @TARGET_DB 
  AND (
      COLUMN_NAME LIKE '%driver%' OR COLUMN_NAME LIKE '%ranand%' OR
      COLUMN_NAME LIKE '%fleet%'  OR COLUMN_NAME LIKE '%navgan%' OR COLUMN_NAME LIKE '%kamion%' OR COLUMN_NAME LIKE '%pelak%' OR
      COLUMN_NAME LIKE '%freight%' OR COLUMN_NAME LIKE '%bar%' OR COLUMN_NAME LIKE '%ealam%' OR
      COLUMN_NAME LIKE '%trip%'   OR COLUMN_NAME LIKE '%safar%' OR COLUMN_NAME LIKE '%national%' OR COLUMN_NAME LIKE '%meli%'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
