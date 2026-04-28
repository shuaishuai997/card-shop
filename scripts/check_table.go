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

	var results []map[string]interface{}
	db.Raw("DESCRIBE payment_configs").Scan(&results)
	for _, r := range results {
		fmt.Printf("%v\n", r)
	}
}
