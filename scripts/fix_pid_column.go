//go:build ignore

package main

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:root@tcp(127.0.0.1:3306)/card_shop?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Rename column p_id → pid
	if err := db.Exec("ALTER TABLE payment_configs CHANGE COLUMN p_id pid VARCHAR(50) NOT NULL").Error; err != nil {
		log.Fatal("ALTER TABLE failed:", err)
	}
	fmt.Println("Column renamed: p_id → pid")

	// Verify
	var results []map[string]interface{}
	db.Raw("DESCRIBE payment_configs").Scan(&results)
	for _, r := range results {
		fmt.Printf("%v\n", r)
	}
}
