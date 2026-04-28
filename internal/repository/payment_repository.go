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
	return r.db.Save(config).Error
}

func (r *PaymentConfigRepository) Delete(id uint) error {
	return r.db.Delete(&model.PaymentConfig{}, id).Error
}
