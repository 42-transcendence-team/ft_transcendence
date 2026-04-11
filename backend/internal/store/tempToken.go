package store

import (
	"sync"
	"time"
)

type TempTokenData struct {
	UserID uint
	Expiry time.Time
}

type TempStore struct {
	mu    sync.Mutex
	store map[string]TempTokenData
}

var GlobalTempStore *TempStore

func InitGlobalTempStore() {
	GlobalTempStore = &TempStore{
		store: make(map[string]TempTokenData),
	}
}

func NewTempStore() *TempStore {
	return &TempStore{
		store: make(map[string]TempTokenData),
	}
}

func (ts *TempStore) Set(token string, data TempTokenData) {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	ts.store[token] = data
}

func (ts *TempStore) Get(token string) (TempTokenData, bool) {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	data, ok := ts.store[token]
	if !ok {
		return TempTokenData{}, false
	}

	if time.Now().After(data.Expiry) {
		delete(ts.store, token)
		return TempTokenData{}, false
	}

	return data, true
}

func (ts *TempStore) Delete(token string) {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	delete(ts.store, token)
}
