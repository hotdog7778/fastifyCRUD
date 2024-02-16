-- tb_post 테이블 생성
CREATE TABLE `tb_post` (
	`post_id` INT NOT NULL AUTO_INCREMENT COMMENT '게시글의 고유키, Auto Increment',
	`post_header` VARCHAR(512) NOT NULL COMMENT '후행 공백을 제거하지 않는점 고려하기',
	`post_body` TEXT NOT NULL,
	`view_count` INT NULL DEFAULT 0,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'DBMS 함수 사용, OS의 타임존이 아닌 MySQL 타임존을 설정할 수 있음',
	`updated_at` DATETIME NULL COMMENT 'ex) 2024-02-15 15:30:00',
	`post_writer` VARCHAR(512) NOT NULL,
	`post_pw` VARCHAR(512) NOT NULL,
	`is_deleted` TINYINT NOT NULL DEFAULT 0,
	`deleted_at` DATETIME NULL COMMENT 'ex) 2024-02-15 15:30:00',
	PRIMARY KEY (`post_id`)
)

-- tb_comment 테이블 생성
CREATE TABLE `tb_comment` (
	`comment_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Auto Increment',
	`post_id` INT NOT NULL COMMENT '게시글의 고유키, Auto Increment',
	`comment_body` TEXT NOT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'DBMS 함수 사용, OS의 타임존이 아닌 MySQL 타임존을 설정할 수 있음',
	`updated_at` DATETIME NULL COMMENT 'ex) 2024-02-15 15:30:00',
	`comment_writer` VARCHAR(512) NOT NULL,
	`comment_pw` VARCHAR(512) NOT NULL,
	`is_deleted` TINYINT NOT NULL DEFAULT 0,
	PRIMARY KEY (`comment_id`),
	CONSTRAINT `FK_TB_COMMENT_TB_POST` FOREIGN KEY (`post_id`) REFERENCES `tb_post` (`post_id`) ON DELETE CASCADE
)