package storage

import (
	appErr "backend/internal/errors"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	maxPostImageSize   int64 = 5 << 20 // 5 MB
	maxAvatarImageSize int64 = 5 << 20 // 5 MB
)

type ImageStorage struct {
	BasePath string
}

type SaveImageOptions struct {
	Directory string
	MaxSize   int64
}

func NewImageStorage(basePath string) *ImageStorage {
	return &ImageStorage{
		BasePath: basePath,
	}
}

// SavePostImage mantiene intacto el contrato usado actualmente por los posts.
func (s *ImageStorage) SavePostImage(
	file *multipart.FileHeader,
) (string, error) {
	return s.SaveImage(file, SaveImageOptions{
		Directory: "posts",
		MaxSize:   maxPostImageSize,
	})
}

// SaveAvatarImage guarda imágenes de perfil dentro del directorio de avatares.
func (s *ImageStorage) SaveAvatarImage(
	file *multipart.FileHeader,
) (string, error) {
	return s.SaveImage(file, SaveImageOptions{
		Directory: "avatars",
		MaxSize:   maxAvatarImageSize,
	})
}

// SaveImage concentra el guardado común para que otras funcionalidades
// puedan definir su propio directorio y límite de tamaño.
func (s *ImageStorage) SaveImage(
	file *multipart.FileHeader,
	options SaveImageOptions,
) (string, error) {
	if file == nil {
		return "", appErr.NewValidation(map[string]string{
			"image": "required",
		})
	}

	if options.MaxSize <= 0 {
		return "", appErr.NewInternal(
			fmt.Errorf("image max size must be greater than zero"),
		)
	}

	if !isSafeDirectoryName(options.Directory) {
		return "", appErr.NewInternal(
			fmt.Errorf("invalid image directory"),
		)
	}

	if file.Size > options.MaxSize {
		return "", appErr.NewValidation(map[string]string{
			"image": "max_size",
		})
	}

	src, err := file.Open()
	if err != nil {
		return "", appErr.NewInternal(err)
	}
	defer src.Close()

	mimeType, err := detectMimeType(src)
	if err != nil {
		return "", appErr.NewInternal(err)
	}

	ext, ok := allowedImageExtension(mimeType)
	if !ok {
		return "", appErr.NewValidation(map[string]string{
			"image": "invalid_type",
		})
	}

	if _, err := src.Seek(0, io.SeekStart); err != nil {
		return "", appErr.NewInternal(err)
	}

	fileName, err := randomFileName(ext)
	if err != nil {
		return "", appErr.NewInternal(err)
	}

	uploadDir := filepath.Join(
		s.BasePath,
		options.Directory,
	)

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", appErr.NewInternal(err)
	}

	dstPath := filepath.Join(uploadDir, fileName)

	dst, err := os.OpenFile(
		dstPath,
		os.O_WRONLY|os.O_CREATE|os.O_EXCL,
		0644,
	)
	if err != nil {
		return "", appErr.NewInternal(err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		_ = os.Remove(dstPath)
		return "", appErr.NewInternal(err)
	}

	relativePath := filepath.ToSlash(
		filepath.Join(
			s.BasePath,
			options.Directory,
			fileName,
		),
	)

	return relativePath, nil
}

func (s *ImageStorage) Delete(relativePath string) error {
	cleanPath := filepath.Clean(relativePath)
	cleanBasePath := filepath.Clean(s.BasePath)

	if cleanPath == "." || cleanPath == cleanBasePath {
		return nil
	}

	if !strings.HasPrefix(
		cleanPath,
		cleanBasePath+string(os.PathSeparator),
	) {
		return nil
	}

	err := os.Remove(cleanPath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	return nil
}

func isSafeDirectoryName(directory string) bool {
	if directory == "" ||
		directory == "." ||
		directory == ".." {
		return false
	}

	if directory != strings.TrimSpace(directory) {
		return false
	}

	if filepath.IsAbs(directory) {
		return false
	}

	// Solo aceptamos un nombre de directorio, no rutas completas.
	if strings.ContainsAny(directory, `/\`) {
		return false
	}

	return filepath.Clean(directory) == directory
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
