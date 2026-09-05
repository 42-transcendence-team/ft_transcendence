package utils

import "testing"

func TestHashAndCheckPassword(t *testing.T) {
	hash, err := HashPassword("Easypass12345!")
	if err != nil {
		t.Fatalf("hash: %v", err)
	}
	if hash == "Easypass12345!" {
		t.Fatal("hash must not equal plain password")
	}
	if !CheckPasswordHash("Easypass12345!", hash) {
		t.Fatal("valid password must verify")
	}
	if CheckPasswordHash("wrongpass12345!", hash) {
		t.Fatal("invalid password must not verify")
	}
}

func TestIsStrongPassword(t *testing.T) {
	cases := []struct {
		pass   string
		strong bool
	}{
		{"Easypass12345!", true},
		{"password", false},
		{"PASSWORD123", false},
		{"Password", false},
		{"P@ssword1", true},
		{"Abcd1234", false}, // no symbol
		{"abcdefg1!", false}, // no upper
		{"ABCDEFG1!", false}, // no lower
		{"Abcdefg!", false},  // no number
	}

	for _, c := range cases {
		if got := IsStrongPassword(c.pass); got != c.strong {
			t.Errorf("IsStrongPassword(%q) = %v, want %v", c.pass, got, c.strong)
		}
	}
}
