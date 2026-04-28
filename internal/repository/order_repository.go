package repository

import (
	"card-shop/internal/model"

	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(order *model.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepository) FindByID(id uint) (*model.Order, error) {
	var order model.Order
	err := r.db.First(&order, id).Error
	return &order, err
}

func (r *OrderRepository) FindByOrderNo(orderNo string) (*model.Order, error) {
	var order model.Order
	err := r.db.Where("order_no = ?", orderNo).First(&order).Error
	return &order, err
}

func (r *OrderRepository) Update(order *model.Order) error {
	return r.db.Save(order).Error
}

func (r *OrderRepository) ListByMerchant(merchantID uint, page, pageSize int, payStatus *int) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	query := r.db.Model(&model.Order{}).Where("merchant_id = ?", merchantID)
	if payStatus != nil {
		query = query.Where("pay_status = ?", *payStatus)
	}

	query.Count(&total)
	err := query.Preload("Product").Offset((page - 1) * pageSize).Limit(pageSize).Order("id desc").Find(&orders).Error
	return orders, total, err
}

func (r *OrderRepository) ListByBuyer(email string, page, pageSize int) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	query := r.db.Model(&model.Order{}).Where("buyer_email = ?", email)
	query.Count(&total)
	err := query.Preload("Product").Offset((page - 1) * pageSize).Limit(pageSize).Order("id desc").Find(&orders).Error
	return orders, total, err
}
