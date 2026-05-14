package models

import "gorm.io/gorm"

type Post struct {
	gorm.Model

	AuthorID uint `gorm:"not null;index"`
	Author   User `gorm:"foreignKey:AuthorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Body *string `gorm:"type:text"`

	Media    []PostMedia `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Comments []Comment   `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type PostMedia struct {
	gorm.Model

	PostID uint `gorm:"not null;index"`
	Post   Post `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	UploaderID uint `gorm:"not null;index"`
	Uploader   User `gorm:"foreignKey:UploaderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	FileURL      string `gorm:"not null"`
	StoragePath  string `gorm:"not null"`
	OriginalName string
	MimeType     string `gorm:"not null"`
	SizeBytes    int64  `gorm:"not null"`
}

type Comment struct {
	gorm.Model

	PostID uint `gorm:"not null;index"`
	Post   Post `gorm:"foreignKey:PostID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	AuthorID uint `gorm:"not null;index"`
	Author   User `gorm:"foreignKey:AuthorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Body string `gorm:"type:text;not null"`
}
