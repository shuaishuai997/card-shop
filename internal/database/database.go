package database

import (
	"fmt"

	"card-shop/internal/config"
	"card-shop/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	var err error
	var dialector gorm.Dialector

	switch cfg.Database.Type {
	case "mysql":
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.Database.User,
			cfg.Database.Password,
			cfg.Database.Host,
			cfg.Database.Port,
			cfg.Database.DBName,
		)
		dialector = mysql.Open(dsn)
	case "sqlite":
		dialector = sqlite.Open(cfg.Database.DBName)
	default:
		dialector = sqlite.Open(cfg.Database.DBName)
	}

	DB, err = gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	// 自动迁移
	err = DB.AutoMigrate(
		&model.User{},
		&model.Product{},
		&model.Card{},
		&model.Order{},
		&model.Category{},
		&model.Coupon{},
		&model.PaymentConfig{},
		&model.SystemConfig{},
	)
	if err != nil {
		return fmt.Errorf("数据库迁移失败: %w", err)
	}

	// 创建默认管理员
	createDefaultAdmin()

	return nil
}

func createDefaultAdmin() {
	var count int64
	DB.Model(&model.User{}).Where("role = ?", "admin").Count(&count)
	if count == 0 {
		// 默认密码 admin123
		password := "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH"
		admin := &model.User{
			Username: "admin",
			Password: password,
			Role:     "admin",
			Status:   1,
		}
		DB.Create(admin)
	}
}