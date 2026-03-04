package handlers

import (
	"gorm.io/gorm"
)

type TodoHandler struct {
	db *gorm.DB
}

func NewTodoHandler(db *gorm.DB) *TodoHandler {
	return &TodoHandler{db: db}
}

// func (h *TodoHandler) TodoCreate(c *gin.Context) {
// 	var body struct {
// 		Content string
// 		Status  bool
// 	}
// 	if err := c.BindJSON(&body); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	todo := models.Todo{Content: body.Content, Status: body.Status}
// 	if err := h.db.Create(&todo).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusCreated, todo)
// }
