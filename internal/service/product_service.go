package service

import (
	"card-shop/internal/model"
	"card-shop/internal/repository"
	"encoding/csv"
	"fmt"
	"io"
	"strings"
)

type ProductService struct {
	repo     *repository.ProductRepository
	cardRepo *repository.CardRepository
}

func NewProductService(repo *repository.ProductRepository, cardRepo *repository.CardRepository) *ProductService {
	return &ProductService{repo: repo, cardRepo: cardRepo}
}

type CreateProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	CategoryID  uint    `json:"category_id"`
	Image       string  `json:"image"`
	SortOrder   int     `json:"sort_order"`
}

func (s *ProductService) Create(merchantID uint, req *CreateProductRequest) (*model.Product, error) {
	product := &model.Product{
		MerchantID:  merchantID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		CategoryID:  req.CategoryID,
		Image:       req.Image,
		SortOrder:   req.SortOrder,
		Status:      1,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) GetByID(id uint) (*model.Product, error) {
	return s.repo.FindByID(id)
}

func (s *ProductService) Update(id uint, req *CreateProductRequest) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	product.Name = req.Name
	product.Description = req.Description
	product.Price = req.Price
	product.CategoryID = req.CategoryID
	product.Image = req.Image
	product.SortOrder = req.SortOrder

	return s.repo.Update(product)
}

func (s *ProductService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *ProductService) ListByMerchant(merchantID uint, page, pageSize int) ([]model.Product, int64, error) {
	return s.repo.ListByMerchant(merchantID, page, pageSize)
}

func (s *ProductService) ListPublic(page, pageSize int) ([]model.Product, int64, error) {
	return s.repo.ListPublic(page, pageSize)
}

func (s *ProductService) UpdateStatus(id uint, status int) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	product.Status = status
	return s.repo.Update(product)
}

// ImportCards 导入卡密
func (s *ProductService) ImportCards(productID uint, csvData string) (int, error) {
	reader := csv.NewReader(strings.NewReader(csvData))

	var cards []model.Card
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return 0, err
		}

		if len(record) == 0 {
			continue
		}

		card := model.Card{
			ProductID: productID,
			CardNo:    record[0],
			Status:    0,
		}
		if len(record) > 1 {
			card.CardPwd = record[1]
		}

		cards = append(cards, card)
	}

	if len(cards) == 0 {
		return 0, fmt.Errorf("没有有效的卡密数据")
	}

	if err := s.cardRepo.BatchCreate(cards); err != nil {
		return 0, err
	}

	// 更新库存
	s.repo.IncreaseStock(productID, len(cards))

	return len(cards), nil
}
