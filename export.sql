-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: localhost    Database: CSCI3100GRP18
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `post` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `USER` bigint(20) NOT NULL,
  `TITLE` varchar(60) DEFAULT NULL,
  `CONTENT` text NOT NULL,
  `REPLY` int(11) NOT NULL,
  `CODE` bigint(20) DEFAULT NULL,
  `CREATE_TIME` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `USER` (`USER`),
  KEY `CODE` (`CODE`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `user` (`ID`),
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`CODE`) REFERENCES `src_code` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,1,'Welcome to Forum','Welcome to forum, you can post and comment on others code freely',0,1,'2020-03-25 13:32:05'),(2,1,NULL,'Please feel free to post anything related to code here',1,NULL,'2020-03-25 13:33:09'),(4,1,'Intro to C++','Website for introduction to C++\nhttps://www.tutorialspoint.com/cplusplus/index.htm\nWell, there are plenty of guides available on google also, so pls google it if you don\'t like it',0,1,'2020-04-19 16:35:34'),(5,1,NULL,'The C++ Programming Language written by Bjarne Stroustrup is also a good book to begin with',4,NULL,'2020-04-19 17:07:00'),(6,1,NULL,'Enjoy programming!',1,NULL,'2020-04-19 16:39:39'),(12,1,NULL,'Well, sadly this online IDE is not supporting C++, but C',4,NULL,'2020-04-22 04:12:11'),(13,1,'Intro to C','Again, tutorialspoint provide a good introduction to programming in C.\r\nhttps://www.tutorialspoint.com/cprogramming/index.htm',0,1,'2020-04-22 07:06:22');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `rating` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `USERID` bigint(20) NOT NULL,
  `POSTID` bigint(20) NOT NULL,
  `RATE` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `USERID` (`USERID`),
  KEY `POSTID` (`POSTID`),
  CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`USERID`) REFERENCES `user` (`ID`),
  CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`POSTID`) REFERENCES `post` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating`
--

LOCK TABLES `rating` WRITE;
/*!40000 ALTER TABLE `rating` DISABLE KEYS */;
INSERT INTO `rating` VALUES (1,1,1,5);
/*!40000 ALTER TABLE `rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `src_code`
--

DROP TABLE IF EXISTS `src_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `src_code` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(20) NOT NULL,
  `USER` bigint(20) NOT NULL,
  `SRC` text,
  `SRC_SZ` int(11) DEFAULT '0',
  `BLK` blob,
  `BLK_SZ` int(11) DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `USER` (`USER`),
  CONSTRAINT `src_code_ibfk_1` FOREIGN KEY (`USER`) REFERENCES `user` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `src_code`
--

LOCK TABLES `src_code` WRITE;
/*!40000 ALTER TABLE `src_code` DISABLE KEYS */;
INSERT INTO `src_code` VALUES (1,'hello_world.c',1,'#include <stdio.h>\n\nint main(void)\n{\n   printf(\"Hello world\\n\");\n   return 0;\n}\n',130,NULL,3),(4,'hello_world.cpp',1,'#include <iostream>\n\nusing namespace std;\n\nint main(void)\n{\n   cout << \"Hello world\" << endl;\n   return 0;\n}\n',130,NULL,0);
/*!40000 ALTER TABLE `src_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `USERNAME` varchar(20) NOT NULL,
  `EMAIL` varchar(60) NOT NULL,
  `PASSWORD` varchar(20) NOT NULL,
  `ACC_TYPE` int(1) NOT NULL,
  `DESC` text,
  `GROUP` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`),
  UNIQUE KEY `USERNAME_UNIQUE` (`USERNAME`),
  UNIQUE KEY `EMAIL_UNIQUE` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'ADMIN','CSCI3100GRP18@localhost.net','CSCI3100GRP18',0,NULL,NULL),(7,'TEST','test@test.com','ABC',0,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-22 20:49:44
