package repository

import (
	"card-shop/internal/model"

	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(product *model.Product) error {
	return r.db.Create(product).Error
}

func (r *ProductRepository) FindByID(id uint) (*model.Product, error) {
	var product model.Product
	err := r.db.Preload("Category").First(&product, id).Error
	return &product, err
}

func (r *ProductRepository) Update(product *model.Product) error {
	return r.db.Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.Delete(&model.Product{}, id).Error
}

func (r *ProductRepository) ListByMerchant(merchantID uint, page, pageSize int) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := r.db.Model(&model.Product{}).Where("merchant_id = ?", merchantID)
	query.Count(&total)
	err := query.Preload("Category").Offset((page - 1) * pageSize).Limit(pageSize).Order("sort_order desc, id desc").Find(&products).Error
	return products, total, err
}

func (r *ProductRepository) ListPublic(page, pageSize int) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := r.db.Model(&model.Product{}).Where("status = ?", 1)
	query.Count(&total)
	err := query.Preload("Category").Offset((page - 1) * pageSize).Limit(pageSize).Order("sort_order desc, id desc").Find(&products).Error
	return products, total, err
}

func (r *ProductRepository) UpdateStock(id uint, quantity int) error {
	return r.db.Model(&model.Product{}).Where("id = ?", id).
		UpdateColumn("stock", gorm.Expr("stock + ?", quantity)).Error
}

// IncreaseStock 增加库存
func (r *ProductRepository) IncreaseStock(id uint, quantity int) error {
	return r.db.Model(&model.Product{}).Where("id = ?", id).
		UpdateColumn("stock", gorm.Expr("stock + ?", quantity)).Error
}
