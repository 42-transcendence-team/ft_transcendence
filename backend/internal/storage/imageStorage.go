package storage

import (
	"backend/internal/errors"
	"crypto/rand"
	"encoding/hex"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const maxPostImageSize int64 = 5 << 20 // 5 MB

type ImageStorage struct {
	BasePath string
}

func NewImageStorage(basePath string) *ImageStorage {
	return &ImageStorage{
		BasePath: basePath,
	}
}

func (s *ImageStorage) SavePostImage(file *multipart.FileHeader) (string, error) {
	if file == nil {
		return "", errors.NewValidation(map[string]string{
			"image": "required",
		})
	}

	if file.Size > maxPostImageSize {
		return "", errors.NewValidation(map[string]string{
			"image": "max_size",
		})
	}

	src, err := file.Open()
	if err != nil {
		return "", errors.NewInternal(err)
	}
	defer src.Close()

	mimeType, err := detectMimeType(src)
	if err != nil {
		return "", errors.NewInternal(err)
	}

	ext, ok := allowedImageExtension(mimeType)
	if !ok {
		return "", errors.NewValidation(map[string]string{
			"image": "invalid_type",
		})
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		return "", errors.NewInternal(err)
	}

	fileName, err := randomFileName(ext)
	if err != nil {
		return "", errors.NewInternal(err)
	}

	postUploadDir := filepath.Join(s.BasePath, "posts")

	if err := os.MkdirAll(postUploadDir, 0755); err != nil {
		return "", errors.NewInternal(err)
	}

	dstPath := filepath.Join(postUploadDir, fileName)

	dst, err := os.OpenFile(dstPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
	if err != nil {
		return "", errors.NewInternal(err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		_ = os.Remove(dstPath)
		return "", errors.NewInternal(err)
	}

	relativePath := filepath.ToSlash(filepath.Join(s.BasePath, "posts", fileName))

	return relativePath, nil
}

func (s *ImageStorage) Delete(relativePath string) error {
	cleanPath := filepath.Clean(relativePath)
	cleanBasePath := filepath.Clean(s.BasePath)

	if cleanPath == "." || cleanPath == cleanBasePath {
		return nil
	}

	if !strings.HasPrefix(cleanPath, cleanBasePath+string(os.PathSeparator)) {
		return nil
	}

	err := os.Remove(cleanPath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	return nil
}

func detectMimeType(file multipart.File) (string, error) {
	buffer := make([]byte, 512)

	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return "", err
	}

	return http.DetectContentType(buffer[:n]), nil
}

func allowedImageExtension(mimeType string) (string, bool) {
	switch mimeType {
	case "image/jpeg":
		return ".jpg", true
	case "image/png":
		return ".png", true
	case "image/webp":
		return ".webp", true
	default:
		return "", false
	}
}

func randomFileName(ext string) (string, error) {
	bytes := make([]byte, 16)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes) + ext, nil
}
