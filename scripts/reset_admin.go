package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:root@tcp(127.0.0.1:3306)/card_shop?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("连接失败:", err)
	}

	// 生成正确的 bcrypt hash
	password := "admin123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("生成hash失败:", err)
	}

	fmt.Println("密码 admin123 的正确hash:", string(hash))

	// 更新数据库中的admin密码
	result := db.Exec("UPDATE users SET password = ? WHERE username = 'admin'", string(hash))
	if result.Error != nil {
		log.Fatal("更新密码失败:", result.Error)
	}

	fmt.Println("✓ 管理员密码已重置为 admin123")
}