package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Payment  PaymentConfig
}

type ServerConfig struct {
	Port    int
	Mode    string // debug, release
	BaseURL string
}

type DatabaseConfig struct {
	Type     string // sqlite, mysql
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret     string
	ExpireTime time.Duration
}

type PaymentConfig struct {
	NotifyURL string
}

var GlobalConfig *Config

func Init(configPath string) error {
	viper.SetConfigFile(configPath)
	viper.SetConfigType("yaml")

	// 默认值
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.mode", "debug")
	viper.SetDefault("server.base_url", "http://localhost:8080")
	viper.SetDefault("database.type", "sqlite")
	viper.SetDefault("database.dbname", "card_shop.db")

	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("读取配置文件失败: %w", err)
	}

	GlobalConfig = &Config{
		Server: ServerConfig{
			Port:    viper.GetInt("server.port"),
			Mode:    viper.GetString("server.mode"),
			BaseURL: viper.GetString("server.base_url"),
		},
		Database: DatabaseConfig{
			Type:     viper.GetString("database.type"),
			Host:     viper.GetString("database.host"),
			Port:     viper.GetInt("database.port"),
			User:     viper.GetString("database.user"),
			Password: viper.GetString("database.password"),
			DBName:   viper.GetString("database.dbname"),
		},
		JWT: JWTConfig{
			Secret:     viper.GetString("jwt.secret"),
			ExpireTime: viper.GetDuration("jwt.expire_time") * time.Hour,
		},
		Payment: PaymentConfig{
			NotifyURL: viper.GetString("payment.notify_url"),
		},
	}

	return nil
}
