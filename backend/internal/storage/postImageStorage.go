package storage

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	MaxPostImageSize = 1 * 1024 * 1024 // 1 MB
)

type SavedPostImage struct {
	URL          string
	StoragePath  string
	OriginalName string
	MimeType     string
	SizeBytes    int64
}

type PostImageStorage struct {
	baseDir      string
	publicPrefix string
}

func NewPostImageStorage(baseDir string, publicPrefix string) *PostImageStorage {
	return &PostImageStorage{
		baseDir:      baseDir,
		publicPrefix: publicPrefix,
	}
}

func (s *PostImageStorage) SavePostImage(postID uint, fileHeader *multipart.FileHeader) (*SavedPostImage, error) {
	if fileHeader == nil {
		return nil, fmt.Errorf("missing image")
	}

	if fileHeader.Size > MaxPostImageSize {
		return nil, fmt.Errorf("image size must be less than 1MB")
	}

	mimeType := fileHeader.Header.Get("Content-Type")
	if !isAllowedPostImageMime(mimeType) {
		return nil, fmt.Errorf("invalid image type")
	}

	src, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("open uploaded image: %w", err)
	}
	defer src.Close()

	ext := extensionFromMime(mimeType)
	if ext == "" {
		return nil, fmt.Errorf("unsupported image extension")
	}

	postDir := filepath.Join(s.baseDir, "posts", fmt.Sprintf("%d", postID))
	if err := os.MkdirAll(postDir, 0755); err != nil {
		return nil, fmt.Errorf("create post image directory: %w", err)
	}

	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	storagePath := filepath.Join(postDir, filename)

	dst, err := os.Create(storagePath)
	if err != nil {
		return nil, fmt.Errorf("create image file: %w", err)
	}
	defer dst.Close()

	if _, err := dst.ReadFrom(src); err != nil {
		_ = os.Remove(storagePath)
		return nil, fmt.Errorf("save image file: %w", err)
	}

	fileURL := strings.TrimRight(s.publicPrefix, "/") + "/posts/" + fmt.Sprintf("%d", postID) + "/" + filename

	return &SavedPostImage{
		URL:          fileURL,
		StoragePath:  storagePath,
		OriginalName: fileHeader.Filename,
		MimeType:     mimeType,
		SizeBytes:    fileHeader.Size,
	}, nil
}

func (s *PostImageStorage) DeleteFile(path string) error {
	if path == "" {
		return nil
	}

	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}

	return nil
}

func isAllowedPostImageMime(mimeType string) bool {
	return mimeType == "image/jpeg" ||
		mimeType == "image/png" ||
		mimeType == "image/webp"
}

func extensionFromMime(mimeType string) string {
	switch mimeType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	default:
		return ""
	}
}
