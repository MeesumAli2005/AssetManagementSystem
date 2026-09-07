-- MySQL dump 10.13  Distrib 9.7.2, for Linux (x86_64)
--
-- Host: localhost    Database: asset_management
-- ------------------------------------------------------
-- Server version	9.7.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asset_assignments`
--

DROP TABLE IF EXISTS `asset_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_assignments_asset` (`asset_id`),
  KEY `fk_assignments_employee` (`employee_id`),
  KEY `fk_assignments_admin` (`assigned_by`),
  CONSTRAINT `fk_assignments_admin` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_assignments_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_assignments_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_assignments`
--

LOCK TABLES `asset_assignments` WRITE;
/*!40000 ALTER TABLE `asset_assignments` DISABLE KEYS */;
INSERT INTO `asset_assignments` VALUES (1,10,13,7,'2026-08-18 11:13:14','2026-08-18 11:13:23','2026-08-18 11:13:31',0),(2,10,11,7,'2026-08-18 11:13:31',NULL,'2026-08-18 11:13:36',0),(3,10,11,7,'2026-08-18 11:23:53',NULL,'2026-08-18 11:24:12',0),(4,10,13,7,'2026-08-19 14:07:43',NULL,'2026-08-19 14:08:09',0),(6,10,13,7,'2026-08-19 14:09:08',NULL,'2026-08-19 14:09:16',0),(7,12,12,7,'2026-08-19 14:56:30','2026-08-19 15:09:44','2026-08-20 12:48:55',0),(8,10,13,7,'2026-08-19 15:03:03',NULL,'2026-08-19 15:03:03',0),(9,10,13,7,'2026-08-19 15:16:12',NULL,'2026-08-19 15:16:29',0),(10,10,13,7,'2026-08-19 15:27:23',NULL,NULL,1),(11,8,13,7,'2026-08-19 15:27:29',NULL,NULL,1),(16,13,12,7,'2026-08-20 12:46:49','2026-08-20 12:47:56',NULL,1),(17,12,12,7,'2026-08-20 12:48:55','2026-08-20 13:59:49',NULL,1),(18,7,12,7,'2026-08-20 13:59:15','2026-08-20 13:59:48','2026-08-24 06:56:56',0),(21,7,12,7,'2026-08-24 07:35:38','2026-08-24 08:01:20',NULL,1),(23,28,23,7,'2026-08-27 07:28:51','2026-08-27 08:10:35',NULL,1),(24,30,13,7,'2026-08-28 10:36:00',NULL,NULL,1),(25,29,12,7,'2026-08-28 10:49:25','2026-08-28 10:54:22',NULL,1);
/*!40000 ALTER TABLE `asset_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_documents`
--

DROP TABLE IF EXISTS `asset_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `document_type` enum('receipt','repair_record','other') NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_documents_asset` (`asset_id`),
  KEY `fk_documents_user` (`uploaded_by`),
  CONSTRAINT `fk_documents_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_documents_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_documents`
--

LOCK TABLES `asset_documents` WRITE;
/*!40000 ALTER TABLE `asset_documents` DISABLE KEYS */;
INSERT INTO `asset_documents` VALUES (1,2,'receipt','/uploads/asset-documents/1786450753382-receipt.pdf',2,'2026-08-11 12:19:13'),(2,2,'repair_record','/uploads/asset-documents/1786456499565-bingus.jpeg',2,'2026-08-11 13:54:59'),(3,4,'receipt','/uploads/asset-documents/1786971147677-test.pdf',7,'2026-08-17 12:52:27');
/*!40000 ALTER TABLE `asset_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_history`
--

DROP TABLE IF EXISTS `asset_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `performed_by` int DEFAULT NULL,
  `event_type` enum('purchase','assignment','return','repair','status_change','condition_change','retirement','disposal','acknowledgement','usage_state_change') NOT NULL,
  `description` text,
  `asset_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_history_asset` (`asset_id`),
  KEY `fk_history_user` (`performed_by`),
  CONSTRAINT `fk_history_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_history`
--

LOCK TABLES `asset_history` WRITE;
/*!40000 ALTER TABLE `asset_history` DISABLE KEYS */;
INSERT INTO `asset_history` VALUES (1,2,'purchase','Asset \"Dell Laptop\" (LAP-001) added to inventory',2,'2026-08-11 12:17:35'),(2,2,'status_change','Status changed from \"available\" to \"assigned\"',2,'2026-08-11 12:18:00'),(3,2,'condition_change','Condition changed from \"new\" to \"good\"',2,'2026-08-11 12:18:00'),(4,2,'retirement','End of life',2,'2026-08-11 12:22:49'),(5,7,'purchase','Asset \"MacBook Pro 14\"\" (LAP-002) added to inventory',4,'2026-08-13 12:55:18'),(6,7,'purchase','Asset \"Dell UltraSharp 27\"\" (MON-001) added to inventory',5,'2026-08-13 12:55:18'),(7,7,'purchase','Asset \"Ergo Office Chair\" (CHR-001) added to inventory',6,'2026-08-13 12:55:18'),(8,7,'status_change','Assigned to sara.malik@eyratech.com',6,'2026-08-13 12:55:18'),(9,7,'purchase','Asset \"iPhone 13\" (PHN-001) added to inventory',7,'2026-08-13 12:55:18'),(10,7,'status_change','Status changed from \"available\" to \"under_repair\"',4,'2026-08-17 12:52:27'),(11,7,'condition_change','Condition changed from \"new\" to \"fair\"',4,'2026-08-17 12:52:27'),(12,7,'retirement','testing retire flow',4,'2026-08-17 12:52:27'),(13,7,'status_change','Status changed from \"available\" to \"assigned\"',5,'2026-08-17 13:03:13'),(14,7,'status_change','Status changed from \"available\" to \"assigned\"',7,'2026-08-17 13:07:50'),(15,7,'condition_change','Condition changed from \"fair\" to \"good\"',7,'2026-08-17 13:07:50'),(16,7,'status_change','Status changed from \"assigned\" to \"available\"',7,'2026-08-17 13:07:50'),(17,7,'status_change','Status changed from \"available\" to \"assigned\"',7,'2026-08-17 13:08:36'),(18,7,'assignment','Assigned to Haider Abbas',7,'2026-08-17 13:08:36'),(19,7,'status_change','Status changed from \"assigned\" to \"available\"',7,'2026-08-17 13:08:36'),(20,7,'assignment','Asset unassigned',7,'2026-08-17 13:08:36'),(21,7,'status_change','Status changed from \"assigned\" to \"available\"',5,'2026-08-17 13:09:27'),(22,7,'status_change','Status changed from \"available\" to \"assigned\"',5,'2026-08-17 13:09:37'),(23,7,'status_change','Status changed from \"available\" to \"assigned\"',7,'2026-08-17 13:09:51'),(24,7,'assignment','Assigned to Haider Abbas',5,'2026-08-17 13:13:15'),(25,7,'status_change','Status changed from \"assigned\" to \"available\"',7,'2026-08-17 13:13:45'),(26,7,'purchase','Asset \"Test Laptop From UI Flow\" (TEST-UI-001) added to inventory',8,'2026-08-17 13:16:56'),(27,7,'status_change','Status changed from \"available\" to \"assigned\"',8,'2026-08-17 13:28:14'),(28,7,'assignment','Assigned to Haider Abbas',8,'2026-08-17 13:28:14'),(29,7,'purchase','Asset \"vdvd\" (SOmething) added to inventory',10,'2026-08-17 13:29:02'),(30,7,'status_change','Status changed from \"assigned\" to \"available\"',8,'2026-08-17 15:18:10'),(31,7,'assignment','Asset unassigned',8,'2026-08-17 15:18:10'),(32,7,'purchase','Asset \"Jabra Speaker\" (Nil) added to inventory',11,'2026-08-18 08:04:43'),(33,7,'status_change','Status changed from \"available\" to \"assigned\"',11,'2026-08-18 08:26:39'),(34,7,'assignment','Assigned to Amir Salman',11,'2026-08-18 08:26:39'),(35,7,'status_change','Status changed from \"available\" to \"assigned\"',10,'2026-08-18 11:13:14'),(36,7,'assignment','Assigned to Amir Salman',10,'2026-08-18 11:13:14'),(37,13,'acknowledgement','Employee acknowledged receipt of this asset',10,'2026-08-18 11:13:23'),(38,13,'usage_state_change','Marked as dormant by employee',10,'2026-08-18 11:13:23'),(39,7,'assignment','Assigned to Haider Abbas',10,'2026-08-18 11:13:31'),(40,7,'status_change','Status changed from \"assigned\" to \"available\"',10,'2026-08-18 11:13:36'),(41,7,'assignment','Asset unassigned',10,'2026-08-18 11:13:36'),(42,7,'assignment','Assigned to Haider Abbas',10,'2026-08-18 11:23:53'),(43,7,'status_change','Status changed from \"assigned\" to \"under_repair\"',10,'2026-08-18 11:23:53'),(44,7,'assignment','Asset unassigned',10,'2026-08-18 11:24:12'),(45,7,'status_change','Status changed from \"under_repair\" to \"available\"',10,'2026-08-18 11:24:13'),(46,11,'usage_state_change','Marked as dormant by employee',5,'2026-08-18 11:28:42'),(47,11,'usage_state_change','Marked as active by employee',5,'2026-08-18 11:28:44'),(48,7,'assignment','Assigned to Amir Salman',10,'2026-08-19 14:07:43'),(49,7,'repair','Repair approved via request #2',10,'2026-08-19 14:07:55'),(50,7,'status_change','Status changed from \"under_repair\" to \"available\"',10,'2026-08-19 14:08:09'),(51,7,'return','Return approved via request #3',10,'2026-08-19 14:08:09'),(53,7,'assignment','Assigned to Amir Salman',10,'2026-08-19 14:09:08'),(54,7,'assignment','Asset unassigned',10,'2026-08-19 14:09:16'),(55,7,'purchase','Asset \"gggtb\" (gg) added to inventory',12,'2026-08-19 14:55:48'),(56,7,'condition_change','Condition changed from \"new\" to \"good\"',12,'2026-08-19 14:56:16'),(57,7,'assignment','Assigned to Meesum Ali',12,'2026-08-19 14:56:30'),(58,7,'condition_change','Condition changed from \"good\" to \"new\"',12,'2026-08-19 14:56:36'),(59,7,'purchase','Asset \"hh\" (hh) added to inventory',13,'2026-08-19 14:58:37'),(60,7,'assignment','Assigned to Amir Salman',10,'2026-08-19 15:03:03'),(61,7,'assignment','Asset unassigned',10,'2026-08-19 15:03:03'),(62,12,'acknowledgement','Employee acknowledged receipt of this asset',12,'2026-08-19 15:09:44'),(63,7,'purchase','Asset \"vfv\" (ffv) added to inventory',14,'2026-08-19 15:10:49'),(64,7,'status_change','Status changed from \"available\" to \"under_repair\"',14,'2026-08-19 15:11:01'),(65,7,'condition_change','Condition changed from \"new\" to \"fair\"',14,'2026-08-19 15:11:01'),(66,7,'status_change','Status changed from \"under_repair\" to \"available\"',14,'2026-08-19 15:11:04'),(67,7,'assignment','Assigned to Amir Salman',10,'2026-08-19 15:16:12'),(68,7,'assignment','Asset unassigned',10,'2026-08-19 15:16:29'),(69,7,'assignment','Assigned to Amir Salman',10,'2026-08-19 15:27:23'),(70,7,'assignment','Assigned to Amir Salman',8,'2026-08-19 15:27:29'),(71,12,'usage_state_change','Marked as dormant by employee',12,'2026-08-20 11:23:06'),(72,12,'usage_state_change','Marked as active by employee',12,'2026-08-20 11:23:07'),(85,7,'repair','Repair approved via request #12 — sent for repair',12,'2026-08-20 12:46:36'),(86,7,'assignment','Assigned to Meesum Ali',13,'2026-08-20 12:46:49'),(87,12,'acknowledgement','Employee acknowledged receipt of this asset',13,'2026-08-20 12:47:56'),(88,7,'assignment','Assigned to Meesum Ali',12,'2026-08-20 12:48:55'),(89,7,'repair','Repair completed: this is repaired, enjoy',12,'2026-08-20 12:48:55'),(90,7,'assignment','Assigned to Meesum Ali',7,'2026-08-20 13:59:15'),(91,12,'acknowledgement','Employee acknowledged receipt of this asset',7,'2026-08-20 13:59:48'),(92,12,'acknowledgement','Employee acknowledged receipt of this asset',12,'2026-08-20 13:59:49'),(93,7,'repair','Repair approved via request #14 — sent for repair',7,'2026-08-20 14:15:29'),(103,7,'assignment','Asset unassigned',7,'2026-08-24 06:56:56'),(104,7,'return','Return marked complete: it has been returned',7,'2026-08-24 06:59:34'),(106,12,'acknowledgement','Employee confirmed the asset was sent back',7,'2026-08-24 07:31:50'),(107,7,'assignment','Assigned to Meesum Ali',7,'2026-08-24 07:35:38'),(108,7,'repair','Repair completed, returned to employee',7,'2026-08-24 07:35:38'),(109,12,'acknowledgement','Employee acknowledged receipt of this asset',7,'2026-08-24 08:01:20'),(114,7,'purchase','Asset \"Lenovo laptop #28\" (AST-28) added to inventory',28,'2026-08-25 12:17:58'),(115,12,'usage_state_change','Marked as dormant by employee',12,'2026-08-25 13:49:37'),(116,12,'usage_state_change','Marked as active by employee',12,'2026-08-25 13:49:38'),(117,12,'usage_state_change','Marked as dormant by employee',12,'2026-08-25 13:49:39'),(118,12,'usage_state_change','Marked as active by employee',12,'2026-08-25 13:49:39'),(119,12,'usage_state_change','Marked as dormant by employee',12,'2026-08-25 13:49:40'),(120,12,'usage_state_change','Marked as active by employee',12,'2026-08-25 13:49:40'),(121,12,'usage_state_change','Marked as dormant by employee',12,'2026-08-25 13:49:41'),(122,12,'usage_state_change','Marked as active by employee',12,'2026-08-25 13:49:41'),(123,7,'assignment','Assigned to Taimur Fazli',28,'2026-08-27 07:28:51'),(124,7,'disposal','Asset disposed of',10,'2026-08-27 07:38:40'),(125,23,'acknowledgement','Employee acknowledged receipt of this asset',28,'2026-08-27 08:10:35'),(126,7,'purchase','Asset \"Samsung phone #29\" (AST-29) added to inventory',29,'2026-08-28 09:07:51'),(127,7,'purchase','Asset \"Lenovo laptop #30\" added to inventory',30,'2026-08-28 10:35:38'),(128,7,'assignment','Assigned to Amir Salman',30,'2026-08-28 10:36:00'),(129,7,'purchase','Asset \"Dell monitor #31\" added to inventory',31,'2026-08-28 10:45:22'),(130,7,'assignment','Assigned to Meesum Ali',29,'2026-08-28 10:49:25'),(131,12,'acknowledgement','Employee acknowledged receipt of this asset',29,'2026-08-28 10:54:22');
/*!40000 ALTER TABLE `asset_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_spec_values`
--

DROP TABLE IF EXISTS `asset_spec_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_spec_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `category_spec_id` int NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_id` (`asset_id`,`category_spec_id`),
  KEY `fk_specvalues_spec` (`category_spec_id`),
  CONSTRAINT `fk_specvalues_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_specvalues_spec` FOREIGN KEY (`category_spec_id`) REFERENCES `category_specs` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_spec_values`
--

LOCK TABLES `asset_spec_values` WRITE;
/*!40000 ALTER TABLE `asset_spec_values` DISABLE KEYS */;
INSERT INTO `asset_spec_values` VALUES (1,2,1,'16GB','2026-08-11 12:17:35','2026-08-11 12:17:35'),(2,2,2,'512GB SSD','2026-08-11 12:17:35','2026-08-11 12:17:35'),(3,4,14,'16GB','2026-08-13 12:55:18','2026-08-13 12:55:18'),(4,4,15,'1TB SSD','2026-08-13 12:55:18','2026-08-13 12:55:18'),(5,5,5,'27in','2026-08-13 12:55:18','2026-08-13 12:55:18'),(6,5,6,'2560x1440','2026-08-13 12:55:18','2026-08-13 12:55:18'),(7,6,7,'true','2026-08-13 12:55:18','2026-08-13 12:55:18'),(8,6,8,'true','2026-08-13 12:55:18','2026-08-13 12:55:18'),(9,7,9,'128GB','2026-08-13 12:55:18','2026-08-13 12:55:18'),(10,7,10,'356938035643809','2026-08-13 12:55:18','2026-08-13 12:55:18'),(11,8,14,'32GB','2026-08-17 13:16:56','2026-08-17 13:16:56'),(12,8,15,'1TB SSD','2026-08-17 13:16:56','2026-08-17 13:16:56'),(13,10,9,'33fcccccc','2026-08-17 13:29:02','2026-08-17 13:29:02'),(14,10,10,'evfd1312312','2026-08-17 13:29:02','2026-08-17 13:29:02'),(15,11,21,'Jabra','2026-08-18 08:04:43','2026-08-18 08:04:43'),(16,11,22,'ab123','2026-08-18 08:04:43','2026-08-18 08:04:43'),(17,11,23,'123456','2026-08-18 08:04:43','2026-08-18 08:04:43'),(18,11,24,'true','2026-08-18 08:04:43','2026-08-18 08:04:43'),(19,12,21,'6tgtg','2026-08-19 14:55:48','2026-08-19 14:55:48'),(20,12,22,'gtg','2026-08-19 14:55:48','2026-08-19 14:55:48'),(21,12,23,'tgttg','2026-08-19 14:55:48','2026-08-19 14:55:48'),(22,12,24,'false','2026-08-19 14:55:48','2026-08-19 14:55:48'),(23,13,5,'hh','2026-08-19 14:58:37','2026-08-19 14:58:37'),(24,13,6,'hy','2026-08-19 14:58:37','2026-08-19 14:58:37'),(25,14,21,'vfv','2026-08-19 15:10:49','2026-08-19 15:10:49'),(26,14,22,'vf','2026-08-19 15:10:49','2026-08-19 15:10:49'),(27,14,23,'vfvf','2026-08-19 15:10:49','2026-08-19 15:10:49'),(28,14,24,'false','2026-08-19 15:10:49','2026-08-19 15:10:49'),(29,28,14,'30GB','2026-08-25 12:17:58','2026-08-25 12:17:58'),(30,28,15,'512GB','2026-08-25 12:17:58','2026-08-25 12:17:58'),(31,28,16,'-','2026-08-25 12:17:58','2026-08-25 12:17:58'),(32,29,9,'64GB','2026-08-28 09:07:51','2026-08-28 09:07:51'),(33,29,10,'123456789','2026-08-28 09:07:51','2026-08-28 09:07:51'),(34,30,14,'16GB','2026-08-28 10:35:38','2026-08-28 10:35:38'),(35,30,15,'256GB','2026-08-28 10:35:38','2026-08-28 10:35:38'),(36,30,16,'-','2026-08-28 10:35:38','2026-08-28 10:35:38'),(37,30,17,'-','2026-08-28 10:35:38','2026-08-28 10:35:38'),(38,31,5,'20in','2026-08-28 10:45:22','2026-08-28 10:45:22');
/*!40000 ALTER TABLE `asset_spec_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_tag` varchar(100) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `category_id` int NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(10,2) DEFAULT NULL,
  `status` enum('available','assigned','under_repair','retired','disposed') NOT NULL DEFAULT 'available',
  `condition` enum('new','good','fair','damaged') DEFAULT 'good',
  `usage_state` enum('active','dormant') NOT NULL DEFAULT 'active',
  `current_assignee_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `disposed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_tag` (`asset_tag`),
  KEY `fk_assets_category` (`category_id`),
  KEY `fk_assets_assignee` (`current_assignee_id`),
  CONSTRAINT `fk_assets_assignee` FOREIGN KEY (`current_assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (2,'LAP-001','Dell Laptop',1,NULL,'2026-01-15',1200.50,'retired','good','active',NULL,'2026-08-11 12:17:35','2026-08-11 12:22:49',NULL),(4,'LAP-002','MacBook Pro 14\"',7,NULL,'2026-08-13',899.00,'retired','fair','active',NULL,'2026-08-13 12:55:18','2026-08-17 12:52:27',NULL),(5,'MON-001','Dell UltraSharp 27\"',2,NULL,'2026-08-13',899.00,'assigned','good','active',11,'2026-08-13 12:55:18','2026-08-18 11:28:44',NULL),(6,'CHR-001','Ergo Office Chair',3,NULL,'2026-08-13',899.00,'assigned','good','active',9,'2026-08-13 12:55:18','2026-08-13 12:55:18',NULL),(7,'PHN-001','iPhone 13',4,NULL,'2026-08-13',899.00,'assigned','good','active',NULL,'2026-08-13 12:55:18','2026-08-24 07:35:38',NULL),(8,'TEST-UI-001','Test Laptop From UI Flow',7,NULL,'2026-08-17',1200.00,'assigned','new','active',13,'2026-08-17 13:16:56','2026-08-19 15:27:29',NULL),(10,'SOmething','vdvd',4,NULL,'2026-12-12',3333.00,'disposed','good','active',13,'2026-08-17 13:29:02','2026-08-27 07:38:40','2026-08-27 07:38:40'),(11,'Nil','Jabra Speaker',11,NULL,NULL,NULL,'assigned','new','active',13,'2026-08-18 08:04:43','2026-08-18 08:26:39',NULL),(12,'gg','gggtb',11,NULL,NULL,NULL,'assigned','new','active',12,'2026-08-19 14:55:48','2026-08-25 13:49:41',NULL),(13,'hh','hh',2,NULL,'2026-07-30',55.00,'assigned','new','active',12,'2026-08-19 14:58:37','2026-08-20 12:46:49',NULL),(14,'ffv','vfv',11,NULL,NULL,NULL,'available','fair','active',NULL,'2026-08-19 15:10:49','2026-08-19 15:11:04',NULL),(28,'AST-28','Lenovo laptop #28',7,'Lenovo',NULL,566.00,'assigned','fair','active',23,'2026-08-25 12:17:58','2026-08-27 07:28:51',NULL),(29,'AST-29','Samsung phone #29',4,'Samsung','2026-08-06',300.00,'assigned','new','active',12,'2026-08-28 09:07:51','2026-08-28 10:49:25',NULL),(30,'AST-30','Lenovo laptop #30',7,'Lenovo','2026-08-06',30000.00,'assigned','new','active',13,'2026-08-28 10:35:38','2026-08-28 10:36:00',NULL),(31,'AST-31','Dell monitor #31',2,'Dell',NULL,NULL,'available','new','active',NULL,'2026-08-28 10:45:22','2026-08-28 10:45:22',NULL);
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_admin` (`admin_id`),
  CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (3,'desk_chair'),(7,'laptop'),(2,'monitor'),(12,'pen'),(4,'phone'),(11,'speaker'),(6,'test category'),(1,'tester'),(9,'tissue box');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_specs`
--

DROP TABLE IF EXISTS `category_specs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_specs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `spec_name` varchar(100) NOT NULL,
  `spec_type` enum('text','number','boolean','dropdown') NOT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_id` (`category_id`,`spec_name`),
  CONSTRAINT `fk_category_specs_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_specs`
--

LOCK TABLES `category_specs` WRITE;
/*!40000 ALTER TABLE `category_specs` DISABLE KEYS */;
INSERT INTO `category_specs` VALUES (1,1,'RAM','text',1,'2026-08-11 12:14:33'),(2,1,'Storage','text',1,'2026-08-11 12:14:33'),(3,1,'Processor','text',0,'2026-08-11 12:14:33'),(4,1,'Operating System','dropdown',0,'2026-08-11 12:14:33'),(5,2,'Screen Size','text',1,'2026-08-11 12:14:33'),(6,2,'Resolution','text',0,'2026-08-11 12:14:33'),(7,3,'Has Headrest','boolean',0,'2026-08-11 12:14:33'),(8,3,'Adjustable Height','boolean',0,'2026-08-11 12:14:33'),(9,4,'Storage','text',1,'2026-08-11 12:14:33'),(10,4,'IMEI','text',1,'2026-08-11 12:14:33'),(12,6,'ram storage','text',1,'2026-08-11 13:52:49'),(13,6,'something','text',0,'2026-08-11 13:52:49'),(14,7,'RAM','text',1,'2026-08-13 12:55:18'),(15,7,'Storage','text',1,'2026-08-13 12:55:18'),(16,7,'Processor','text',0,'2026-08-13 12:55:18'),(17,7,'Operating System','dropdown',0,'2026-08-13 12:55:18'),(19,9,'dimensions','text',1,'2026-08-18 07:52:06'),(21,11,'brand','text',1,'2026-08-18 07:57:53'),(22,11,'model','text',1,'2026-08-18 07:57:53'),(23,11,'Serial_Number','text',1,'2026-08-18 07:57:53'),(24,11,'wired','boolean',1,'2026-08-18 07:57:53'),(25,12,'length','text',1,'2026-08-25 11:40:01');
/*!40000 ALTER TABLE `category_specs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Engineering',1,'2026-08-12 11:11:36'),(3,'Tester_Department',1,'2026-08-12 13:31:59'),(4,'Sales',1,'2026-08-13 12:55:18'),(5,'HR',1,'2026-08-13 12:55:18'),(6,'Marketing',1,'2026-08-13 12:55:18');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_departments`
--

DROP TABLE IF EXISTS `employee_departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `department_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`department_id`),
  KEY `fk_empdept_department` (`department_id`),
  CONSTRAINT `fk_empdept_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_empdept_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_departments`
--

LOCK TABLES `employee_departments` WRITE;
/*!40000 ALTER TABLE `employee_departments` DISABLE KEYS */;
INSERT INTO `employee_departments` VALUES (2,8,1,'2026-08-13 12:55:18'),(4,10,5,'2026-08-13 12:55:18'),(16,3,3,'2026-08-17 14:23:01'),(19,9,4,'2026-08-17 14:23:19'),(20,11,1,'2026-08-17 15:17:57'),(21,11,6,'2026-08-17 15:17:57'),(22,13,1,'2026-08-18 08:13:11'),(23,6,3,'2026-08-18 12:45:57'),(24,12,1,'2026-08-20 13:59:07'),(25,23,3,'2026-08-27 06:58:16');
/*!40000 ALTER TABLE `employee_departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_notes`
--

DROP TABLE IF EXISTS `request_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `note` text NOT NULL,
  `status_at_time` enum('pending','approved','rejected','completed','sent_for_repair') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `request_notes_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`),
  CONSTRAINT `request_notes_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_notes`
--

LOCK TABLES `request_notes` WRITE;
/*!40000 ALTER TABLE `request_notes` DISABLE KEYS */;
INSERT INTO `request_notes` VALUES (2,14,7,'this asset has been returned','sent_for_repair','2026-08-24 07:33:43'),(3,23,7,'new hire, he needs a laptop','pending','2026-08-27 07:28:10'),(4,21,7,'I gave a new samsung phone','completed','2026-08-28 10:50:26');
/*!40000 ALTER TABLE `request_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_type` enum('asset','return','repair') NOT NULL,
  `employee_id` int NOT NULL,
  `asset_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `reason` text,
  `repair_details` text,
  `completion_notes` text,
  `review_notes` text,
  `status` enum('pending','approved','rejected','completed','sent_for_repair') DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `resulting_asset_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by` int DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_requests_employee` (`employee_id`),
  KEY `fk_requests_asset` (`asset_id`),
  KEY `fk_requests_category` (`category_id`),
  KEY `fk_requests_reviewed_by` (`reviewed_by`),
  KEY `resulting_asset_id` (`resulting_asset_id`),
  CONSTRAINT `fk_requests_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_requests_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_requests_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_result_asset` FOREIGN KEY (`resulting_asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_requests_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (6,'asset',12,NULL,3,'efefef',NULL,NULL,NULL,'approved',7,NULL,'2026-08-19 14:53:13','2026-08-19 14:54:20',NULL,NULL,NULL),(7,'repair',12,12,NULL,'not working properly',NULL,NULL,NULL,'rejected',7,NULL,'2026-08-20 11:23:20','2026-08-20 12:42:15',NULL,NULL,NULL),(11,'asset',12,NULL,2,'need one',NULL,NULL,NULL,'completed',7,13,'2026-08-20 12:41:18','2026-08-20 12:42:13',NULL,NULL,NULL),(12,'repair',12,12,NULL,'ts needs a repair badly',NULL,NULL,NULL,'completed',7,NULL,'2026-08-20 12:45:59','2026-08-20 12:46:36',NULL,NULL,NULL),(13,'return',12,7,NULL,'android chaye',NULL,'it has been returned','Your req has been approved','completed',7,NULL,'2026-08-20 14:03:52','2026-08-24 06:56:56',NULL,NULL,'2026-08-24 07:31:50'),(14,'repair',12,7,NULL,'wapis lelooo',NULL,NULL,NULL,'completed',7,NULL,'2026-08-20 14:10:50','2026-08-20 14:15:29',NULL,NULL,NULL),(21,'asset',12,NULL,4,'need itt',NULL,NULL,'approved from my side\n','completed',7,29,'2026-08-24 08:34:16','2026-08-24 10:31:49','2026-08-28 10:49:25',7,NULL),(23,'asset',23,NULL,7,'I need a laptop\n',NULL,NULL,NULL,'completed',7,28,'2026-08-27 07:26:28','2026-08-27 07:28:37','2026-08-27 07:28:51',7,NULL);
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('employee','administrator') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User','testuser@example.com','$2b$10$yhOy3KGp7Li/iyEXzpyuwuXHOrOS7HlKYtyQXElIi5rGFu35MPlEu','employee',1,'2026-08-10 13:40:51','2026-08-10 13:41:14'),(2,'Admin User','admin@example.com','$2b$10$QvOW70wHxw2ii7zOPnqu9ep0Oa1oH5fEHKSyzutFV/jomedUj5ZHu','administrator',1,'2026-08-10 13:44:25','2026-08-10 13:44:25'),(3,'New Employee','newemp@example.com','$2b$10$R1rBYzQK6cAyTdco5fjNzuVGOs7aT9/glYu433vxrb6vHOdYgCAlm','employee',0,'2026-08-10 13:52:06','2026-08-27 08:42:26'),(4,'New Admin','newadmin@example.com','$2b$10$G7wfAfhtWA5nypdIc0P50.ysv3DQIh1eKwUFcRYfbg10yFoP48YIu','administrator',1,'2026-08-10 13:52:07','2026-08-10 13:52:07'),(5,'Meesum User','meesum@example.com','$2b$10$UdIQcDs3jfrRQbvNcP2gz.e2v2YoJBmCyiNH8ibNQvmQc9DEL8pmm','employee',1,'2026-08-10 14:27:57','2026-08-10 14:32:15'),(6,'Torres','jane.doe@example.com','$2b$10$4Cpa22qJHHtby2pPveX3q.92RNbeFX0777VP0KOxXFhy2H1LsGbkO','employee',1,'2026-08-12 11:11:46','2026-08-18 12:45:57'),(7,'Afaq','admin@eyratech.com','$2b$10$DHmJoF7zK1G.p43ZLfyHOejSxRHU1ycvN27Fu/5NdISeT.0i6kAaC','administrator',1,'2026-08-13 12:55:18','2026-08-13 12:58:27'),(8,'Raza','raza@eyratech.com','$2b$10$dL/Pr0Z2f1KcAGq1ZMhTGOPQN1P6nNP02gyASDAUeCLkOQ3SQG5OW','employee',1,'2026-08-13 12:55:18','2026-08-13 12:58:27'),(9,'Jhn','tariq@eyratech.com','$2b$10$Bzs3W3Hp3w9Uc3CBOS0Y/Ol0v/hm65NVAWsTea5oti10n15zq327m','employee',1,'2026-08-13 12:55:18','2026-08-17 15:22:21'),(10,'Usman Tariq','usman.tariq@eyratech.com','$2b$10$iPLfKjHEL08w35xMOdNwVe66T8cHDoGSkio52eQuY0/EE7EZTBLUW','employee',1,'2026-08-13 12:55:18','2026-08-13 12:55:18'),(11,'Haider Abbas','haider.abbas@eyratech.com','$2b$10$fZRxq0Q5VilNA/u6jMRNhO1R69WBy3f1soJVmo.2vAVWQfYYWyNzi','employee',1,'2026-08-13 12:55:18','2026-08-18 07:29:13'),(12,'Meesum Ali','meesum@eyra.com','$2b$10$RyS1B94Lrz7evEVQpv46W.9yaE/Vfuu0dbfgz.R.543aW2AoUw9JC','employee',1,'2026-08-18 07:20:52','2026-08-18 07:20:52'),(13,'Amir Salman','amir@eyratech.com','$2b$10$ckFHk8sQ9ctJDZAqPY7g6OEPUcNRMZ85BcIUB9/OnFPzXm72jB4ki','employee',1,'2026-08-18 08:13:06','2026-08-18 11:13:07'),(23,'Taimur Fazli','taimur@example.com','$2b$10$9h1wjR18bSmMdlHERJuRpug2fz9VjIGFIsCT9u4HuwZniZniKQEQ.','employee',1,'2026-08-27 06:57:54','2026-08-27 06:57:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 13:28:14
