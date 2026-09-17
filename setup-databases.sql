-- ==========================================================
-- Enterprise CRM: Database Initialization Script
-- Compatible with MySQL 8.x and SQLyog
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `crm_admin`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `crm_customer`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Verification
SHOW DATABASES LIKE 'crm_%';
