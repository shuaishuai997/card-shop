package main

import (
	"fmt"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	ID       uint
	Username string
	Role     string
}

func main() {
	viper.SetConfigFile("configs/config.yaml")
	viper.ReadInConfig()
	dsn := viper.GetString("database.dsn")
	db, _ := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	var users []User
	db.Find(&users)
	for _, u := range users {
		fmt.Printf("id=%d username=%s role=%s\n", u.ID, u.Username, u.Role)
	}
}
