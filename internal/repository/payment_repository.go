package repository

import (
	"card-shop/internal/model"
	"gorm.io/gorm"
)

type PaymentConfigRepository struct {
	db *gorm.DB
}

func NewPaymentConfigRepository(db *gorm.DB) *PaymentConfigRepository {
	return &PaymentConfigRepository{db: db}
}

func (r *PaymentConfigRepository) Create(config *model.PaymentConfig) error {
	return r.db.Create(config).Error
}

func (r *PaymentConfigRepository) FindByID(id uint) *gorm.DB {
	return r.db.First(&model.PaymentConfig{}, id)
}

func (r *PaymentConfigRepository) FindByMerchantAndType(merchantID uint, payType string) (*model.PaymentConfig, error) {
	var config model.PaymentConfig
	err := r.db.Where("merchant_id = ? AND pay_type = ?", merchantID, payType).First(&config).Error
	return &config, err
}

func (r *PaymentConfigRepository) ListByMerchant(merchantID uint) ([]model.PaymentConfig, error) {
	var configs []model.PaymentConfig
	err := r.db.Where("merchant_id = ?", merchantID).Find(&configs).Error
	return configs, err
}

func (r *PaymentConfigRepository) Update(config *model.PaymentConfig) error {
	return r.db.Model(config).Select("pay_type", "gateway_url", "pid", "key", "notify_url", "return_url", "status", "merchant_id").Updates(config).Error
}

func (r *PaymentConfigRepository) Delete(id uint) error {
	return r.db.Delete(&model.PaymentConfig{}, id).Error
}
