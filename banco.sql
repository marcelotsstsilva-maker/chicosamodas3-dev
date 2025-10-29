-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: btb6hubdqebszllhbb0i-mysql.services.clever-cloud.com    Database: btb6hubdqebszllhbb0i
-- ------------------------------------------------------
-- Server version	8.0.22-13

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'a05a675a-1414-11e9-9c82-cecd01b08c7e:1-491550428,
a38a16d0-767a-11eb-abe2-cecd029e558e:1-592831354';

--
-- Table structure for table `caixa`
--

DROP TABLE IF EXISTS `caixa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caixa` (
  `idcaixa` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('entrada','saida') NOT NULL,
  `origem` enum('venda','retirada','despesa','ajuste','outros') DEFAULT 'outros',
  `descricao` varchar(200) DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_movimento` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idvenda` int DEFAULT NULL,
  `observacao` text,
  PRIMARY KEY (`idcaixa`),
  KEY `idvenda` (`idvenda`),
  CONSTRAINT `caixa_ibfk_1` FOREIGN KEY (`idvenda`) REFERENCES `venda` (`idvenda`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caixa`
--

LOCK TABLES `caixa` WRITE;
/*!40000 ALTER TABLE `caixa` DISABLE KEYS */;
/*!40000 ALTER TABLE `caixa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `idcliente` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` text,
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idcliente`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Lívia','','','','2025-10-28 10:44:40'),(2,'Celi','','','','2025-10-28 10:44:55'),(3,'Marcelo',NULL,NULL,NULL,'2025-10-28 16:27:35');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estoque`
--

DROP TABLE IF EXISTS `estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estoque` (
  `idestoque` int NOT NULL,
  PRIMARY KEY (`idestoque`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estoque`
--

LOCK TABLES `estoque` WRITE;
/*!40000 ALTER TABLE `estoque` DISABLE KEYS */;
/*!40000 ALTER TABLE `estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fiado`
--

DROP TABLE IF EXISTS `fiado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiado` (
  `idfiado` int NOT NULL AUTO_INCREMENT,
  `idcliente` int NOT NULL,
  `idvenda` int NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `quantidade_parcela` int DEFAULT '1',
  `data_compra` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('aberto','parcial','pago') DEFAULT 'aberto',
  `observacao` text,
  `data_vencimento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `valor_parcela'` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idfiado`),
  KEY `idcliente` (`idcliente`),
  KEY `idvenda` (`idvenda`),
  CONSTRAINT `fiado_ibfk_1` FOREIGN KEY (`idcliente`) REFERENCES `cliente` (`idcliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fiado_ibfk_2` FOREIGN KEY (`idvenda`) REFERENCES `venda` (`idvenda`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fiado`
--

LOCK TABLES `fiado` WRITE;
/*!40000 ALTER TABLE `fiado` DISABLE KEYS */;
/*!40000 ALTER TABLE `fiado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fiado_parcelas`
--

DROP TABLE IF EXISTS `fiado_parcelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiado_parcelas` (
  `idparcela` int NOT NULL AUTO_INCREMENT,
  `idfiado` int NOT NULL,
  `numero_parcela` int NOT NULL,
  `valor_parcela` decimal(10,2) NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `status` enum('pendente','pago') DEFAULT 'pendente',
  `valor_total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idparcela`),
  KEY `idfiado` (`idfiado`),
  CONSTRAINT `fiado_parcelas_ibfk_1` FOREIGN KEY (`idfiado`) REFERENCES `fiado` (`idfiado`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fiado_parcelas`
--

LOCK TABLES `fiado_parcelas` WRITE;
/*!40000 ALTER TABLE `fiado_parcelas` DISABLE KEYS */;
/*!40000 ALTER TABLE `fiado_parcelas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fornecedor`
--

DROP TABLE IF EXISTS `fornecedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fornecedor` (
  `idfornecedor` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` text,
  `observacoes` text,
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idfornecedor`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fornecedor`
--

LOCK TABLES `fornecedor` WRITE;
/*!40000 ALTER TABLE `fornecedor` DISABLE KEYS */;
INSERT INTO `fornecedor` VALUES (1,'100Medida',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(2,'Alice Moda',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(3,'Avon',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(4,'Bella Life',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(5,'Bella Pri',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(6,'Boticário',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(7,'Carol t-shirt',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(8,'Cheia Charme',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(9,'Cherie Bijoux',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(10,'Colzani',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(11,'Crase Atacado',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(12,'Cravina',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(13,'Doce Linda',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(14,'El Fashion Jeans',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(15,'Fenômeno Jean',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(16,'Fianne',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(17,'Flor de Jade',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(18,'Floriza',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(19,'Geração Feminina',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(20,'Hallmak Jean',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(21,'Julia Plus Size',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(22,'Malue',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(23,'Missbelly',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(24,'Myllena',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(25,'Natura',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(26,'Nelly',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(27,'Nikell',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(28,'RC Revenda Cosmeticos',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(29,'Sangily',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(30,'Toda Chic',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(32,'Viakall',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42'),(33,'XHX Jeans',NULL,NULL,NULL,NULL,NULL,'2025-10-25 23:57:42');
/*!40000 ALTER TABLE `fornecedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimentacao_estoque`
--

DROP TABLE IF EXISTS `movimentacao_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimentacao_estoque` (
  `idmov` int NOT NULL AUTO_INCREMENT,
  `idvariacao` int DEFAULT NULL,
  `tipo` enum('entrada','saida','ajuste') NOT NULL,
  `quantidade` int NOT NULL,
  `motivo` varchar(100) DEFAULT NULL,
  `data_mov` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idusuario` int DEFAULT NULL,
  PRIMARY KEY (`idmov`),
  KEY `idvariacao` (`idvariacao`),
  KEY `idusuario` (`idusuario`),
  CONSTRAINT `movimentacao_estoque_ibfk_1` FOREIGN KEY (`idvariacao`) REFERENCES `variacao_produto` (`idvariacao`),
  CONSTRAINT `movimentacao_estoque_ibfk_2` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimentacao_estoque`
--

LOCK TABLES `movimentacao_estoque` WRITE;
/*!40000 ALTER TABLE `movimentacao_estoque` DISABLE KEYS */;
INSERT INTO `movimentacao_estoque` VALUES (1,1,'entrada',4,'Entrada inicial da variação','2025-10-26 04:28:55',NULL),(2,2,'entrada',1,'Entrada inicial da variação','2025-10-26 04:29:53',NULL),(3,3,'entrada',12,'Entrada inicial da variação','2025-10-26 04:30:22',NULL),(4,4,'entrada',8,'Entrada inicial da variação','2025-10-26 04:33:20',NULL),(5,5,'entrada',4,'Entrada inicial da variação','2025-10-26 04:34:56',NULL),(6,6,'entrada',1,'Entrada inicial da variação','2025-10-26 04:36:57',NULL),(7,7,'entrada',1,'Entrada inicial da variação','2025-10-26 04:38:00',NULL),(8,8,'entrada',1,'Entrada inicial da variação','2025-10-26 04:40:30',NULL),(9,7,'saida',1,'Venda ID 1','2025-10-26 17:53:21',NULL),(10,7,'saida',1,'Venda ID 2','2025-10-26 18:26:36',NULL),(11,7,'saida',1,'Venda ID 1','2025-10-27 01:21:08',NULL),(12,9,'entrada',1,'Entrada inicial da variação','2025-10-27 17:19:40',NULL),(13,10,'entrada',1,'Entrada inicial da variação','2025-10-28 10:42:34',NULL),(14,7,'saida',1,'Venda ID 1','2025-10-28 16:27:36',NULL),(15,7,'saida',1,'Venda ID 2','2025-10-28 16:33:06',NULL),(16,7,'saida',1,'Venda ID 3','2025-10-28 16:56:45',NULL),(17,7,'saida',1,'Venda ID 4','2025-10-28 17:01:00',NULL),(18,7,'saida',1,'Venda ID 5','2025-10-28 17:06:59',NULL),(19,7,'saida',1,'Venda ID 6','2025-10-28 17:10:56',NULL),(20,7,'saida',1,'Venda ID 7','2025-10-28 17:38:43',NULL),(21,11,'entrada',2,'Entrada inicial da variação','2025-10-28 19:42:43',NULL);
/*!40000 ALTER TABLE `movimentacao_estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto`
--

DROP TABLE IF EXISTS `produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto` (
  `idproduto` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `idfornecedor` int DEFAULT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `categoria` varchar(50) DEFAULT NULL,
  `genero` enum('feminino','masculino','infantil','unissex') DEFAULT 'unissex',
  `preco_custo` decimal(10,2) DEFAULT NULL,
  `preco_venda` decimal(10,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idproduto`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idfornecedor` (`idfornecedor`),
  CONSTRAINT `produto_ibfk_1` FOREIGN KEY (`idfornecedor`) REFERENCES `fornecedor` (`idfornecedor`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto`
--

LOCK TABLES `produto` WRITE;
/*!40000 ALTER TABLE `produto` DISABLE KEYS */;
INSERT INTO `produto` VALUES (1,'V1028K6',28,'Base Líquida Matte Vai na Bolsa Vivai',NULL,'Cosméticos','feminino',5.00,15.00,0,'2025-10-26 05:13:43'),(2,'965',11,'Básica Babado Slim',NULL,'Blusa','feminino',17.00,35.00,0,'2025-10-26 05:21:07'),(3,'KV112K12',28,'Batom Bastão Kyrav',NULL,'Cosméticos','feminino',1.73,5.00,0,'2025-10-26 05:16:19'),(4,'V3084K12',28,'Batom Bastão Magico 24Hrs Vivai',NULL,'Cosméticos','feminino',1.43,5.00,0,'2025-10-26 05:11:49'),(5,'V3057K6',28,'Batom Líquido Matte Melted Vivai',NULL,'Cosméticos','feminino',4.99,12.00,0,'2025-10-26 05:17:11'),(6,'XJ705',33,'Bermuda Pedal',NULL,'Moda jeans','feminino',32.00,63.90,0,'2025-10-26 05:18:07'),(7,'XJ719',33,'Bermuda Pedal Plus',NULL,'Moda jeans','feminino',37.00,73.90,0,'2025-10-26 05:20:39'),(8,'DAV01',26,'Blusa  de Crepe',NULL,'Blusa','feminino',30.00,60.00,1,'2025-10-26 04:22:17'),(9,'BL003',5,'Blusa Canelada Babado',NULL,'Malha','feminino',12.00,26.00,1,'2025-10-26 04:22:17'),(10,'BCP179',23,'Blusa Canelada plus',NULL,'Plus size','feminino',23.00,50.00,1,'2025-10-26 04:22:17'),(11,'BL2209',22,'Blusa Decote Babado',NULL,'Blusa','feminino',22.00,47.00,1,'2025-10-26 04:22:17'),(12,'BL009',5,'Blusa Forever Gota',NULL,'Blusa','feminino',15.00,35.00,1,'2025-10-26 04:22:17'),(13,'BL022',5,'Blusa Forever Zíper',NULL,'Blusa','feminino',15.00,35.00,1,'2025-10-26 04:22:17'),(14,'WIL01',26,'Blusa Guipir',NULL,'Blusa','feminino',30.00,60.00,1,'2025-10-26 04:22:17'),(15,'BLZT',23,'Blusa Liz Tricô Canelada',NULL,'Moda inverno','feminino',20.00,45.00,1,'2025-10-26 04:22:17'),(16,'BL2228',22,'Blusa Manga Bufante',NULL,'Blusa','feminino',22.00,45.00,1,'2025-10-26 04:22:17'),(17,'BLT002',17,'Blusa Muscle',NULL,'Blusa','feminino',20.00,40.00,1,'2025-10-26 04:22:17'),(18,'CPCP',23,'Blusa Plus Canelada Premium',NULL,'Plus size','feminino',25.00,55.00,1,'2025-10-26 04:22:17'),(19,'MM220K3',28,'Blush Compacto Maça do Amor Mia Make',NULL,'Cosméticos','feminino',6.74,15.00,1,'2025-10-26 04:22:17'),(20,'FBD913',16,'Bolsa Porta Celular 2 zíperes',NULL,'Bolsa','feminino',20.00,35.00,1,'2025-10-26 04:22:17'),(21,'BR01029',9,'Brinco  Ear Cuff Folheado a Ouro 18K Estrela',NULL,'Acessório','feminino',6.99,15.90,1,'2025-10-26 04:22:17'),(22,'CA001',10,'Calça Alfaiataria',NULL,'Calça','feminino',45.00,100.00,1,'2025-10-26 04:22:17'),(23,'CF6003',22,'Calça Cenoura',NULL,'Calça','feminino',35.00,70.00,1,'2025-10-26 04:22:17'),(24,'XJ608',33,'Calça Feminina Plus',NULL,'Calça','feminino',45.00,89.90,1,'2025-10-26 04:22:17'),(25,'XJ853',33,'Calça Flare c/ cinto',NULL,'Moda jeans','feminino',50.00,99.90,1,'2025-10-26 04:22:17'),(26,'XJ531',33,'Calça Flare Escura',NULL,'Moda jeans','feminino',45.00,89.90,1,'2025-10-26 04:22:17'),(27,'XJ584',33,'Calça Jeans Azul Claro',NULL,'Moda jeans','feminino',35.00,69.90,1,'2025-10-26 04:22:17'),(28,'418',15,'Calça Jeans Flare Preta',NULL,'Moda jeans','feminino',49.99,99.90,1,'2025-10-26 04:22:17'),(29,'XJ610',33,'Calça Plus Preta',NULL,'Moda jeans','feminino',45.00,89.90,1,'2025-10-26 04:22:17'),(30,'CB001',17,'Calça Skinny Bengaline',NULL,'Calças','feminino',45.00,90.00,1,'2025-10-26 04:22:17'),(31,'15',4,'Calcinha Bela',NULL,'Lingerie','feminino',2.60,6.00,1,'2025-10-26 04:22:17'),(32,'13',4,'Calcinha Cós Duplo',NULL,'Lingerie','feminino',2.60,6.00,1,'2025-10-26 04:22:17'),(33,'14',4,'Calcinha Gabi',NULL,'Lingerie','feminino',2.60,6.00,1,'2025-10-26 04:22:17'),(34,'12',4,'Calcinha Isa',NULL,'Lingerie','feminino',2.60,6.00,1,'2025-10-26 04:22:17'),(35,'CSCA',23,'Camiseta Cava Americana',NULL,'Malha','feminino',17.00,40.00,1,'2025-10-26 04:22:17'),(36,'59',4,'Camisola Luna',NULL,'Lingerie','feminino',11.00,22.00,1,'2025-10-26 04:22:17'),(37,'CAB001',29,'Cardigan',NULL,'Moda inverno','feminino',23.00,76.00,1,'2025-10-26 04:22:17'),(38,'FBC1366',16,'Carteira Feminina Pequena',NULL,'Carteira','feminino',15.00,25.00,1,'2025-10-26 04:22:17'),(39,'FBC1365',16,'Carteira Grande',NULL,'Carteira','feminino',17.00,35.00,1,'2025-10-26 04:22:17'),(40,'0042-L',4,'Conjunto Sutiã e Calcinha',NULL,'Lingerie','feminino',13.00,25.00,1,'2025-10-26 04:22:17'),(41,'V1205G2K6',28,'Corretivo Líquido Glam Vivai',NULL,'Cosméticos','feminino',7.56,18.00,1,'2025-10-26 04:22:17'),(42,'190152',3,'Creme corporal com ácido hialurônico e oleo de arroz',NULL,'Cosméticos','feminino',14.39,17.99,1,'2025-10-26 04:22:17'),(43,'99818',25,'Creme Desodorante Nutritivo para o corpo Tododia Ameixa e Flor de Baunilha',NULL,'Cosméticos','feminino',42.16,75.90,1,'2025-10-26 04:22:17'),(44,'2814',25,'Creme Desodorante Nutritivo para o Corpo Tododia Macadâmia',NULL,'Cosméticos','feminino',42.16,75.90,1,'2025-10-26 04:22:17'),(45,'152724',3,'Creme Facial Avon Care Hidratante Vitaminado',NULL,'Cosméticos','feminino',15.99,19.99,1,'2025-10-26 04:22:17'),(46,'136026',3,'Creme facial uniformizador',NULL,'Cosméticos','feminino',15.99,29.99,1,'2025-10-26 04:22:17'),(47,'2087681',25,'Creme TodoDia Flor de Pera e Melissa',NULL,'Cosméticos','feminino',42.16,75.90,1,'2025-10-26 04:22:17'),(48,'BL2218',22,'Cropped 3 Babados',NULL,'Blusas','feminino',20.00,40.00,1,'2025-10-26 04:22:17'),(49,'BL2184',22,'Cropped Babados',NULL,'Blusas','feminino',20.00,40.00,1,'2025-10-26 04:22:17'),(50,'BL2214',22,'Cropped Drapeado Frontal',NULL,'Blusas','feminino',20.00,40.00,1,'2025-10-26 04:22:17'),(51,'117126',25,'Demaquilante Faces 55ml',NULL,'Cosméticos','feminino',31.92,39.90,1,'2025-10-26 04:22:17'),(52,'136136',3,'Esmalte color trend capuccino cremoso',NULL,'Cosméticos','feminino',4.79,6.99,1,'2025-10-26 04:22:17'),(53,'136135',3,'Esmalte color trend rosa perolado',NULL,'Cosméticos','feminino',4.79,6.99,1,'2025-10-26 04:22:17'),(54,'ZIQESPGOTK12',28,'Esponja Gota Para Base Líquida',NULL,'Cosméticos','feminino',1.27,6.00,1,'2025-10-26 04:22:17'),(55,'135957',3,'Footworks Creme Desodorante',NULL,'Cosméticos','feminino',7.99,9.99,1,'2025-10-26 04:22:17'),(56,'118910',25,'Gel Booster Hidratante Facial Faces',NULL,'Cosméticos','feminino',49.52,61.90,1,'2025-10-26 04:22:17'),(57,'136027',3,'Gel creme facial hidratante matificante',NULL,'Cosméticos','feminino',15.99,19.99,1,'2025-10-26 04:22:17'),(58,'136034',3,'Gel esfoliante facial',NULL,'Cosméticos','feminino',12.79,15.99,1,'2025-10-26 04:22:17'),(59,'91',11,'Gola V Plus',NULL,'Blusas','feminino',17.00,35.00,1,'2025-10-26 04:22:17'),(60,'LLQBMOO803K12',28,'Kit de  Pincel 5 Make Lolita',NULL,'Cosméticos','feminino',3.36,13.00,1,'2025-10-26 04:22:17'),(61,'MM282K12',28,'Lápis de Olho Preto com Apontador Mia Make',NULL,'Cosméticos','feminino',1.25,5.00,1,'2025-10-26 04:22:17'),(62,'V3212K6',28,'Lip Balm Teen Mundo Animal Vivai',NULL,'Cosméticos','feminino',5.00,12.00,1,'2025-10-26 04:22:17'),(63,'44452',25,'Luna Desodorante Colônia',NULL,'Cosméticos','feminino',135.92,169.90,1,'2025-10-26 04:22:17'),(64,'MC7009',22,'Macacão Curto Babados',NULL,'Jardineira','feminino',38.00,80.00,1,'2025-10-26 04:22:17'),(65,'MA030',13,'Macacão Curto Jeans',NULL,'Moda jeans','feminino',40.00,85.00,1,'2025-10-26 04:22:17'),(66,'208768',25,'Natura TodoDia Flor de Pera e Melissa Desodorante Colônia 200ml',NULL,'Perfume','feminino',70.32,87.90,1,'2025-10-26 04:22:17'),(67,'LNLUA766K12',28,'Necessaire Transparente Compacta com Zíper LUA',NULL,'Cosméticos','feminino',2.70,7.00,1,'2025-10-26 04:22:17'),(68,'SH3006K12',28,'Pó banana Matte Ultra Fino Shine',NULL,'Cosméticos','feminino',4.85,16.00,1,'2025-10-26 04:22:17'),(69,'MSL1010GMK4',28,'Pó Compacto Vegano Teen Miss Lary',NULL,'Cosméticos','feminino',8.00,20.00,1,'2025-10-26 04:22:17'),(70,'136058',3,'Protetor solar renew fps 50 protinol',NULL,'Cosméticos','feminino',27.36,52.90,1,'2025-10-26 04:22:17'),(71,'135890',3,'Pur Blanca Deo Colônia Charm',NULL,'Perfume','feminino',27.92,69.90,1,'2025-10-26 04:22:17'),(72,'135895',3,'Pur Blanca Deo Colônia Serenity',NULL,'Perfume','feminino',27.92,69.90,1,'2025-10-26 04:22:17'),(73,'462',11,'Regata Luisa Listra',NULL,'Blusas','feminino',15.00,35.00,1,'2025-10-26 04:22:17'),(74,'KV740K24',28,'Rímel Preto Isa Beauty',NULL,'Cosméticos','feminino',3.80,10.00,1,'2025-10-26 04:22:17'),(75,'135060',25,'Sabonete em Espuma Limpeza Suave Chronos Derma',NULL,'Cosméticos','feminino',49.52,89.00,1,'2025-10-26 04:22:17'),(76,'136031',3,'Sabonete gel de limpeza facial',NULL,'Cosméticos','feminino',14.39,17.99,1,'2025-10-26 04:22:17'),(77,'S420',12,'Saia Crepe Pipoca',NULL,'Saias','feminino',45.00,85.00,1,'2025-10-26 04:22:17'),(78,'S170',12,'Saia Envelope',NULL,'Saias','feminino',45.00,85.00,1,'2025-10-26 04:22:17'),(79,'HLJ123',20,'Saia Gode Midi Jeans',NULL,'Saias','feminino',45.00,95.00,1,'2025-10-26 04:22:17'),(80,'SJ158',32,'Saia Jeans Barra Babado',NULL,'Saias','feminino',35.00,85.00,1,'2025-10-26 04:22:17'),(81,'1104',32,'Saia Jeans Pregas',NULL,'Saias','feminino',42.00,90.00,1,'2025-10-26 04:22:17'),(82,'SJ024',32,'Saia Jeans Reta Plus Size',NULL,'Moda jeans','feminino',37.00,90.00,1,'2025-10-26 04:22:17'),(83,'SPGF',19,'Saia Longa Plissada Preta',NULL,'Saias','feminino',35.00,75.00,1,'2025-10-26 04:22:17'),(84,'ELFS04',14,'Saia Midi Bengaline',NULL,'Saias','feminino',30.00,65.00,1,'2025-10-26 04:22:17'),(85,'SMDG',19,'Saia Midi Godê',NULL,'Saias','feminino',40.00,85.00,1,'2025-10-26 04:22:17'),(86,'STPGF1',19,'Saia Tule Plissada',NULL,'Saias','feminino',30.00,65.00,1,'2025-10-26 04:22:17'),(87,'SA001',10,'Short Alfaiataria',NULL,'Shorts','feminino',30.00,65.00,1,'2025-10-26 04:22:17'),(88,'LN02207K2',28,'Sombra 4 cores Lua e Neve',NULL,'Cosméticos','feminino',7.33,16.00,1,'2025-10-26 04:22:17'),(89,'0045-L',4,'Sutiã',NULL,'Lingerie','feminino',19.00,40.00,1,'2025-10-26 04:22:17'),(90,'TSA13',7,'Tshirt Acredite',NULL,'Malha','feminino',15.80,35.00,1,'2025-10-26 04:22:17'),(91,'TSCCV',7,'Tshirt Beijo Coreano Vermelha',NULL,'Malha','feminino',17.90,35.00,1,'2025-10-26 04:22:17'),(92,'TSBBL',7,'Tshirt Borboleta Brilhe',NULL,'Malha','feminino',17.90,35.00,1,'2025-10-26 04:22:17'),(93,'TSCF1',7,'Tshirt Cafezim',NULL,'Malha','feminino',15.80,35.00,1,'2025-10-26 04:22:17'),(94,'TSCCA',7,'Tshirt Coroa',NULL,'Malha','feminino',17.90,35.00,1,'2025-10-26 04:22:17'),(95,'TSDBD',7,'Tshirt Debochada',NULL,'Malha','feminino',17.90,35.00,1,'2025-10-26 04:22:17'),(96,'TSD12',7,'Tshirt Disney',NULL,'Malha','feminino',15.80,35.00,1,'2025-10-26 04:22:17'),(97,'TSGPB',7,'Tshirt Girl Power',NULL,'Malha','feminino',17.90,35.00,1,'2025-10-26 04:22:17'),(98,'TSLT1',7,'Tshirt LooneyTunes',NULL,'Malha','feminino',15.80,35.00,1,'2025-10-26 04:22:17'),(99,'TSMOR',7,'Tshirt Minie Oncinha',NULL,'Malha','feminino',17.90,35.00,1,'2025-10-26 04:22:17'),(100,'45',11,'T-shirt Plus Size Gola V',NULL,'Malha','feminino',17.00,35.00,1,'2025-10-26 04:22:17'),(101,'22',11,'T-shirt Princesa Slim',NULL,'Malha','feminino',15.00,35.00,1,'2025-10-26 04:22:17'),(102,'CC421',8,'Vestido 2 Marias Manga Inteira',NULL,'Vestido','feminino',27.00,55.00,1,'2025-10-26 04:22:17'),(103,'AM107',30,'Vestido 3 Marias',NULL,'Vestido','feminino',40.00,80.00,1,'2025-10-26 04:22:17'),(104,'3098',24,'Vestido Cigana',NULL,'Vestido','feminino',45.00,80.00,1,'2025-10-26 04:22:17'),(105,'ELFV03',14,'Vestido Mid Crepe Dion',NULL,'Vestido','feminino',35.00,75.00,1,'2025-10-26 04:22:17'),(106,'LA5194',2,'Vestido Mullet',NULL,'Vestido','feminino',58.00,90.00,1,'2025-10-26 04:22:17'),(107,'CC526',8,'Vestido Mullet Rosas',NULL,'Vestido','feminino',32.00,65.00,1,'2025-10-26 04:22:17'),(108,'RO05',18,'Vestido Princesa',NULL,'Vestido','feminino',48.00,80.00,1,'2025-10-26 04:22:17'),(109,'VE03',18,'Vestido Tubinho Red',NULL,'Vestido','feminino',38.00,80.00,1,'2025-10-26 04:22:17'),(110,'VS4012',22,'Vestido Tubinho Selva',NULL,'Vestido','feminino',40.00,80.00,1,'2025-10-26 04:22:17'),(111,'AM06',18,'Vestido Yellow',NULL,'Vestido','feminino',38.00,80.00,1,'2025-10-26 04:22:17'),(112,'9',4,'Vitória Lisa',NULL,'Lingerie','feminino',2.60,6.00,1,'2025-10-26 04:22:17'),(113,'ELFV01',14,'Vestido Midi Crepe Dion',NULL,'Vestido','feminino',35.00,70.00,1,'2025-10-26 04:22:17'),(114,'ELFV04',14,'Vestido Midi Crepe Dion',NULL,'Vestido','feminino',35.00,70.00,1,'2025-10-26 04:22:17'),(115,'FDJ372',16,'Bolsa transversal de mão ',NULL,'Bolsa','feminino',52.00,83.00,1,'2025-10-28 00:00:00'),(116,'CR180',11,'Blusa Fio Torcido',NULL,'Blusa','feminino',15.00,32.00,1,'2025-10-28 00:00:00'),(117,'CR304',11,'Regata Fio Torcido',NULL,'Regata','feminino',15.00,32.00,1,'2025-10-28 00:00:00'),(118,'CR509',11,'Regata Ribana',NULL,'Regata','feminino',15.90,35.00,1,'2025-10-28 00:00:00');
/*!40000 ALTER TABLE `produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relatorio`
--

DROP TABLE IF EXISTS `relatorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relatorio` (
  `idrelatorio` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) DEFAULT NULL,
  `periodo_inicio` date DEFAULT NULL,
  `periodo_fim` date DEFAULT NULL,
  `criado_por` int DEFAULT NULL,
  `data_geracao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idrelatorio`),
  KEY `criado_por` (`criado_por`),
  CONSTRAINT `relatorio_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuario` (`idusuario`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relatorio`
--

LOCK TABLES `relatorio` WRITE;
/*!40000 ALTER TABLE `relatorio` DISABLE KEYS */;
/*!40000 ALTER TABLE `relatorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taxa_cartao`
--

DROP TABLE IF EXISTS `taxa_cartao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taxa_cartao` (
  `idtaxa` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('debito','credito') NOT NULL,
  `canal` enum('maquineta','celular') DEFAULT NULL,
  `parcelas` tinyint unsigned NOT NULL DEFAULT '1',
  `percentual` decimal(5,2) NOT NULL COMMENT 'Percentual da taxa (ex: 3.50)',
  `observacao` varchar(255) DEFAULT NULL,
  `data_atualizacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idtaxa`),
  UNIQUE KEY `unico_tipo_canal_parcelas` (`tipo`,`canal`,`parcelas`),
  UNIQUE KEY `uk_tipo_canal_parcelas` (`tipo`,`canal`,`parcelas`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxa_cartao`
--

LOCK TABLES `taxa_cartao` WRITE;
/*!40000 ALTER TABLE `taxa_cartao` DISABLE KEYS */;
INSERT INTO `taxa_cartao` VALUES (1,'debito','celular',1,0.99,NULL,'2025-10-23 01:22:00'),(2,'credito','celular',1,3.09,NULL,'2025-10-23 01:23:05'),(3,'credito','celular',2,6.29,NULL,'2025-10-23 01:23:33'),(4,'credito','celular',3,7.49,NULL,'2025-10-23 01:24:18'),(5,'credito','celular',4,8.49,NULL,'2025-10-23 01:27:28'),(6,'credito','celular',5,9.49,NULL,'2025-10-23 01:29:41'),(7,'credito','celular',6,10.49,NULL,'2025-10-23 01:32:09'),(8,'credito','celular',7,11.49,NULL,'2025-10-23 01:32:42'),(9,'credito','celular',8,11.99,NULL,'2025-10-23 01:32:55'),(10,'credito','celular',9,12.19,NULL,'2025-10-23 01:33:19'),(11,'credito','celular',10,12.38,NULL,'2025-10-23 01:33:34'),(12,'credito','celular',11,12.38,NULL,'2025-10-23 01:34:04'),(13,'credito','celular',12,12.38,NULL,'2025-10-23 01:34:18'),(23,'credito','maquineta',1,4.86,NULL,'2025-10-23 02:14:41'),(24,'credito','maquineta',2,10.86,NULL,'2025-10-23 02:15:43'),(25,'credito','maquineta',3,12.24,'','2025-10-23 02:17:23'),(26,'credito','maquineta',4,13.59,'','2025-10-23 02:17:41'),(27,'credito','maquineta',5,14.92,'','2025-10-23 02:18:00'),(28,'credito','maquineta',6,16.22,'','2025-10-23 02:18:13'),(29,'credito','maquineta',7,17.50,'','2025-10-23 02:18:28'),(30,'credito','maquineta',8,18.76,'','2025-10-23 02:18:50'),(31,'credito','maquineta',9,19.99,'','2025-10-23 02:19:03'),(32,'credito','maquineta',10,21.19,'','2025-10-23 02:19:18'),(33,'credito','maquineta',11,21.39,'','2025-10-23 02:19:37'),(35,'credito','maquineta',12,21.39,'','2025-10-23 02:20:39'),(36,'debito','maquineta',1,1.98,'','2025-10-23 02:26:15');
/*!40000 ALTER TABLE `taxa_cartao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idusuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  `usuario` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `senha` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`idusuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Marcelo','Marcelo','marcelo.tsst@gmail.com','123'),(2,'Allyne','Allyne','lynelype@gmail.com','123');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variacao_produto`
--

DROP TABLE IF EXISTS `variacao_produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variacao_produto` (
  `idvariacao` int NOT NULL AUTO_INCREMENT,
  `idproduto` int NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `tamanho` varchar(10) DEFAULT NULL,
  `cor` varchar(30) DEFAULT NULL,
  `tecido` varchar(50) DEFAULT NULL,
  `quantidade` int DEFAULT '0',
  PRIMARY KEY (`idvariacao`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idproduto` (`idproduto`),
  CONSTRAINT `variacao_produto_ibfk_1` FOREIGN KEY (`idproduto`) REFERENCES `produto` (`idproduto`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variacao_produto`
--

LOCK TABLES `variacao_produto` WRITE;
/*!40000 ALTER TABLE `variacao_produto` DISABLE KEYS */;
INSERT INTO `variacao_produto` VALUES (1,1,NULL,'ÚNICO ',NULL,NULL,4),(2,2,NULL,'ÚNICO ',NULL,NULL,1),(3,3,NULL,'ÚNICO ',NULL,NULL,12),(4,4,NULL,'ÚNICO ',NULL,NULL,8),(5,5,NULL,'ÚNICO ',NULL,NULL,4),(6,6,NULL,'38','Azul',NULL,1),(7,6,NULL,'42','Azul',NULL,1),(8,7,NULL,'38','Azul l',NULL,1),(9,96,NULL,'M','Vermelho',NULL,1),(10,115,NULL,'M','Preta',NULL,1),(11,116,NULL,'Único','Rosa, Azul',NULL,2);
/*!40000 ALTER TABLE `variacao_produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venda`
--

DROP TABLE IF EXISTS `venda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venda` (
  `idvenda` int NOT NULL AUTO_INCREMENT,
  `idusuario` int DEFAULT NULL,
  `idcliente` int DEFAULT NULL,
  `forma_pagamento` enum('dinheiro','credito','debito','pix','fiado','cartao','outros') NOT NULL,
  `taxa_aplicada` decimal(5,2) NOT NULL DEFAULT '0.00',
  `lucro_liquido` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_bruto` decimal(10,2) DEFAULT NULL,
  `data_venda` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `desconto` decimal(10,2) DEFAULT '0.00',
  `acrescimo` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`idvenda`),
  KEY `idusuario` (`idusuario`),
  KEY `idcliente` (`idcliente`),
  CONSTRAINT `venda_ibfk_1` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`idusuario`),
  CONSTRAINT `venda_ibfk_2` FOREIGN KEY (`idcliente`) REFERENCES `cliente` (`idcliente`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venda`
--

LOCK TABLES `venda` WRITE;
/*!40000 ALTER TABLE `venda` DISABLE KEYS */;
/*!40000 ALTER TABLE `venda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venda_itens`
--

DROP TABLE IF EXISTS `venda_itens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venda_itens` (
  `iditem` int NOT NULL AUTO_INCREMENT,
  `idvenda` int DEFAULT NULL,
  `idvariacao` int DEFAULT NULL,
  `quantidade` int NOT NULL,
  `preco_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`iditem`),
  KEY `idvenda` (`idvenda`),
  KEY `idvariacao` (`idvariacao`),
  CONSTRAINT `venda_itens_ibfk_1` FOREIGN KEY (`idvenda`) REFERENCES `venda` (`idvenda`),
  CONSTRAINT `venda_itens_ibfk_2` FOREIGN KEY (`idvariacao`) REFERENCES `variacao_produto` (`idvariacao`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venda_itens`
--

LOCK TABLES `venda_itens` WRITE;
/*!40000 ALTER TABLE `venda_itens` DISABLE KEYS */;
/*!40000 ALTER TABLE `venda_itens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'btb6hubdqebszllhbb0i'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 20:40:08
