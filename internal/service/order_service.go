package service

import (
	"card-shop/internal/model"
	"card-shop/internal/repository"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderService struct {
	repo        *repository.OrderRepository
	productRepo *repository.ProductRepository
	cardRepo    *repository.CardRepository
	db          *gorm.DB
}

func NewOrderService(repo *repository.OrderRepository, productRepo *repository.ProductRepository, cardRepo *repository.CardRepository, db *gorm.DB) *OrderService {
	return &OrderService{repo: repo, productRepo: productRepo, cardRepo: cardRepo, db: db}
}

type CreateOrderRequest struct {
	ProductID  uint    `json:"product_id" binding:"required"`
	Quantity   int     `json:"quantity" binding:"required,min=1"`
	BuyerEmail string  `json:"buyer_email" binding:"required,email"`
	BuyerPhone string  `json:"buyer_phone"`
	CouponCode string  `json:"coupon_code"`
}

type OrderResponse struct {
	*model.Order
	PayURL string `json:"pay_url"`
}

func (s *OrderService) Create(merchantID uint, req *CreateOrderRequest) (*OrderResponse, error) {
	// 获取商品
	product, err := s.productRepo.FindByID(req.ProductID)
	if err != nil {
		return nil, errors.New("商品不存在")
	}

	if product.Status != 1 {
		return nil, errors.New("商品已下架")
	}

	if product.Stock < req.Quantity {
		return nil, errors.New("库存不足")
	}

	// 计算金额
	totalAmount := product.Price * float64(req.Quantity)
	discountAmount := 0.0

	// TODO: 优惠券处理

	orderNo := generateOrderNo()
	order := &model.Order{
		OrderNo:         orderNo,
		MerchantID:      merchantID,
		ProductID:       req.ProductID,
		Quantity:        req.Quantity,
		TotalAmount:     totalAmount,
		PayAmount:       totalAmount - discountAmount,
		DiscountAmount:  discountAmount,
		BuyerEmail:      req.BuyerEmail,
		BuyerPhone:      req.BuyerPhone,
		PayStatus:       0,
	}

	if err := s.repo.Create(order); err != nil {
		return nil, err
	}

	return &OrderResponse{Order: order}, nil
}

func (s *OrderService) GetByOrderNo(orderNo string) (*model.Order, error) {
	return s.repo.FindByOrderNo(orderNo)
}

func (s *OrderService) GetByID(id uint) (*model.Order, error) {
	return s.repo.FindByID(id)
}

func (s *OrderService) ListByMerchant(merchantID uint, page, pageSize int, payStatus *int) ([]model.Order, int64, error) {
	return s.repo.ListByMerchant(merchantID, page, pageSize, payStatus)
}

func (s *OrderService) ListByBuyer(email string, page, pageSize int) ([]model.Order, int64, error) {
	return s.repo.ListByBuyer(email, page, pageSize)
}

// PaymentCallback 支付回调处理
func (s *OrderService) PaymentCallback(orderNo, tradeNo, payMethod string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var order model.Order
		if err := tx.Where("order_no = ?", orderNo).First(&order).Error; err != nil {
			return err
		}

		if order.PayStatus == 1 {
			return nil // 已支付，幂等处理
		}

		// 获取可用卡密
		cards, err := s.cardRepo.GetAvailableCards(order.ProductID, order.Quantity)
		if err != nil {
			return err
		}

		if len(cards) < order.Quantity {
			return errors.New("库存不足")
		}

		// 标记卡密已售
		cardIDs := make([]uint, len(cards))
		for i, card := range cards {
			cardIDs[i] = card.ID
		}
		if err := s.cardRepo.MarkCardsSold(cardIDs, orderNo); err != nil {
			return err
		}

		// 序列化卡密信息
		cardsJSON, _ := json.Marshal(cards)

		now := time.Now()
		order.PayStatus = 1
		order.PayTime = &now
		order.TradeNo = tradeNo
		order.PayMethod = payMethod
		order.Cards = string(cardsJSON)

		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// 更新商品销量和库存
		if err := tx.Model(&model.Product{}).Where("id = ?", order.ProductID).
			Updates(map[string]interface{}{
				"stock":      gorm.Expr("stock - ?", order.Quantity),
				"sold_count": gorm.Expr("sold_count + ?", order.Quantity),
			}).Error; err != nil {
			return err
		}

		// TODO: 发送邮件通知

		return nil
	})
}

func generateOrderNo() string {
	return time.Now().Format("20060102150405") + uuid.New().String()[:8]
}
