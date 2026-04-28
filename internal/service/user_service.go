package service

import (
	"errors"

	"card-shop/internal/model"
	"card-shop/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (s *UserService) Register(req *RegisterRequest) (*model.User, error) {
	// 检查用户名是否存在
	_, err := s.repo.FindByUsername(req.Username)
	if err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Email:    req.Email,
		Phone:    req.Phone,
		Role:     "merchant",
		Status:   1,
		APIKey:   uuid.New().String(),
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) Login(req *LoginRequest) (*model.User, error) {
	user, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	if user.Status != 1 {
		return nil, errors.New("账号已被禁用")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	return user, nil
}

func (s *UserService) GetByID(id uint) (*model.User, error) {
	return s.repo.FindByID(id)
}

func (s *UserService) Update(user *model.User) error {
	return s.repo.Update(user)
}

func (s *UserService) ChangePassword(id uint, oldPassword, newPassword string) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("原密码错误")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return s.repo.Update(user)
}

func (s *UserService) RegenerateAPIKey(id uint) (string, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return "", err
	}

	user.APIKey = uuid.New().String()
	if err := s.repo.Update(user); err != nil {
		return "", err
	}

	return user.APIKey, nil
}

// List 获取用户列表
func (s *UserService) List(page, pageSize int, role string) ([]model.User, int64, error) {
	return s.repo.List(page, pageSize, role)
}

// SetStatus 设置用户状态
func (s *UserService) SetStatus(id uint, status int) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	user.Status = status
	return s.repo.Update(user)
}
