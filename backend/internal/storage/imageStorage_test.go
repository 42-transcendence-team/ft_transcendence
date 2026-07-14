package storage

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func createTestFileHeader(
	t *testing.T,
	filename string,
	content []byte,
) *multipart.FileHeader {
	t.Helper()

	body := bytes.NewBuffer(nil)
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("image", filename)
	if err != nil {
		t.Fatalf("cannot create multipart file: %v", err)
	}

	if _, err := part.Write(content); err != nil {
		t.Fatalf("cannot write multipart file: %v", err)
	}

	contentType := writer.FormDataContentType()

	if err := writer.Close(); err != nil {
		t.Fatalf("cannot close multipart writer: %v", err)
	}

	request := httptest.NewRequest(
		http.MethodPost,
		"/",
		body,
	)
	request.Header.Set("Content-Type", contentType)

	if err := request.ParseMultipartForm(
		int64(len(content) + 1024),
	); err != nil {
		t.Fatalf("cannot parse multipart form: %v", err)
	}

	t.Cleanup(func() {
		if request.MultipartForm != nil {
			_ = request.MultipartForm.RemoveAll()
		}
	})

	files := request.MultipartForm.File["image"]
	if len(files) == 0 {
		t.Fatal("multipart form contains no image")
	}

	return files[0]
}

func validPNGContent() []byte {
	return append(
		[]byte{
			0x89,
			'P',
			'N',
			'G',
			0x0d,
			0x0a,
			0x1a,
			0x0a,
		},
		make([]byte, 32)...,
	)
}

func TestSaveImageStoresFileInConfiguredDirectory(
	t *testing.T,
) {
	basePath := t.TempDir()
	imageStorage := NewImageStorage(basePath)

	file := createTestFileHeader(
		t,
		"image.png",
		validPNGContent(),
	)

	storedPath, err := imageStorage.SaveImage(
		file,
		SaveImageOptions{
			Directory: "avatars",
			MaxSize:   1024,
		},
	)
	if err != nil {
		t.Fatalf("SaveImage returned an error: %v", err)
	}

	expectedDirectory := filepath.Join(
		basePath,
		"avatars",
	)

	actualDirectory := filepath.Dir(
		filepath.FromSlash(storedPath),
	)

	if actualDirectory != expectedDirectory {
		t.Fatalf(
			"expected directory %q, got %q",
			expectedDirectory,
			actualDirectory,
		)
	}

	if _, err := os.Stat(
		filepath.FromSlash(storedPath),
	); err != nil {
		t.Fatalf("saved file does not exist: %v", err)
	}
}

func TestSavePostImageUsesPostsDirectory(
	t *testing.T,
) {
	basePath := t.TempDir()
	imageStorage := NewImageStorage(basePath)

	file := createTestFileHeader(
		t,
		"image.png",
		validPNGContent(),
	)

	storedPath, err := imageStorage.SavePostImage(file)
	if err != nil {
		t.Fatalf(
			"SavePostImage returned an error: %v",
			err,
		)
	}

	expectedDirectory := filepath.Join(
		basePath,
		"posts",
	)

	actualDirectory := filepath.Dir(
		filepath.FromSlash(storedPath),
	)

	if actualDirectory != expectedDirectory {
		t.Fatalf(
			"expected directory %q, got %q",
			expectedDirectory,
			actualDirectory,
		)
	}
}

func TestSaveImageRejectsInvalidMimeType(
	t *testing.T,
) {
	imageStorage := NewImageStorage(t.TempDir())

	file := createTestFileHeader(
		t,
		"fake.png",
		[]byte("this is not an image"),
	)

	_, err := imageStorage.SaveImage(
		file,
		SaveImageOptions{
			Directory: "posts",
			MaxSize:   1024,
		},
	)

	if err == nil {
		t.Fatal("expected invalid MIME type to be rejected")
	}
}

func TestSaveImageRejectsFileOverMaximumSize(
	t *testing.T,
) {
	imageStorage := NewImageStorage(t.TempDir())

	file := createTestFileHeader(
		t,
		"image.png",
		validPNGContent(),
	)

	_, err := imageStorage.SaveImage(
		file,
		SaveImageOptions{
			Directory: "posts",
			MaxSize:   4,
		},
	)

	if err == nil {
		t.Fatal("expected oversized file to be rejected")
	}
}

func TestSaveImageRejectsUnsafeDirectories(
	t *testing.T,
) {
	imageStorage := NewImageStorage(t.TempDir())

	unsafeDirectories := []string{
		"",
		".",
		"..",
		"../avatars",
		"avatars/other",
		`avatars\other`,
		"/avatars",
		" avatars",
	}

	for _, directory := range unsafeDirectories {
		t.Run(directory, func(t *testing.T) {
			file := createTestFileHeader(
				t,
				"image.png",
				validPNGContent(),
			)

			_, err := imageStorage.SaveImage(
				file,
				SaveImageOptions{
					Directory: directory,
					MaxSize:   1024,
				},
			)

			if err == nil {
				t.Fatalf(
					"expected directory %q to be rejected",
					directory,
				)
			}
		})
	}
}

func TestDeleteRemovesStoredImage(
	t *testing.T,
) {
	imageStorage := NewImageStorage(t.TempDir())

	file := createTestFileHeader(
		t,
		"image.png",
		validPNGContent(),
	)

	storedPath, err := imageStorage.SaveImage(
		file,
		SaveImageOptions{
			Directory: "posts",
			MaxSize:   1024,
		},
	)
	if err != nil {
		t.Fatalf("SaveImage returned an error: %v", err)
	}

	if err := imageStorage.Delete(storedPath); err != nil {
		t.Fatalf("Delete returned an error: %v", err)
	}

	_, err = os.Stat(filepath.FromSlash(storedPath))
	if !os.IsNotExist(err) {
		t.Fatal("expected stored image to be deleted")
	}
}

func TestDeleteDoesNotRemoveFilesOutsideBasePath(
	t *testing.T,
) {
	imageStorage := NewImageStorage(t.TempDir())

	outsideDirectory := t.TempDir()
	outsidePath := filepath.Join(
		outsideDirectory,
		"outside.png",
	)

	if err := os.WriteFile(
		outsidePath,
		validPNGContent(),
		0644,
	); err != nil {
		t.Fatalf("cannot create outside file: %v", err)
	}

	if err := imageStorage.Delete(outsidePath); err != nil {
		t.Fatalf("Delete returned an error: %v", err)
	}

	if _, err := os.Stat(outsidePath); err != nil {
		t.Fatalf(
			"file outside base path was removed: %v",
			err,
		)
	}
}
