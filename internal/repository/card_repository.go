package repository

import (
	"card-shop/internal/model"
	"time"

	"gorm.io/gorm"
)

type CardRepository struct {
	db *gorm.DB
}

func NewCardRepository(db *gorm.DB) *CardRepository {
	return &CardRepository{db: db}
}

func (r *CardRepository) Create(card *model.Card) error {
	return r.db.Create(card).Error
}

func (r *CardRepository) BatchCreate(cards []model.Card) error {
	return r.db.Create(&cards).Error
}

func (r *CardRepository) FindByID(id uint) (*model.Card, error) {
	var card model.Card
	err := r.db.First(&card, id).Error
	return &card, err
}

func (r *CardRepository) Delete(id uint) error {
	return r.db.Delete(&model.Card{}, id).Error
}

func (r *CardRepository) ListByProduct(productID uint, page, pageSize int, status *int) ([]model.Card, int64, error) {
	var cards []model.Card
	var total int64

	query := r.db.Model(&model.Card{}).Where("product_id = ?", productID)
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	query.Count(&total)
	err := query.Offset((page - 1) * pageSize).Limit(pageSize).Order("id desc").Find(&cards).Error
	return cards, total, err
}

// GetAvailableCards 获取可用卡密
func (r *CardRepository) GetAvailableCards(productID uint, quantity int) ([]model.Card, error) {
	var cards []model.Card
	err := r.db.Where("product_id = ? AND status = 0", productID).
		Limit(quantity).
		Find(&cards).Error
	return cards, err
}

// MarkCardsSold 标记卡密为已售
func (r *CardRepository) MarkCardsSold(cardIDs []uint, orderNo string) error {
	now := time.Now()
	return r.db.Model(&model.Card{}).Where("id IN ?", cardIDs).
		Updates(map[string]interface{}{
			"status":   1,
			"order_no": orderNo,
			"sold_at":  now,
		}).Error
}

func (r *CardRepository) CountByProduct(productID uint) (int64, int64, error) {
	var total, available int64
	r.db.Model(&model.Card{}).Where("product_id = ?", productID).Count(&total)
	r.db.Model(&model.Card{}).Where("product_id = ? AND status = 0", productID).Count(&available)
	return total, available, nil
}
