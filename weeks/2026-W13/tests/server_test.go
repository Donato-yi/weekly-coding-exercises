package habits_test

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/donato-yi/weekly-coding-exercises/2026-W13/htmx-habits/src"
)

func TestAddItem(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	form := url.Values{}
	form.Set("title", "Hydrate")
	req := httptest.NewRequest(http.MethodPost, "/items", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if !strings.Contains(res.Body.String(), "Hydrate") {
		t.Fatalf("expected response to include new item")
	}
}

func TestAddItemValidation(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	req := httptest.NewRequest(http.MethodPost, "/items", strings.NewReader("title="))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.Code)
	}
	if !strings.Contains(res.Body.String(), "Please enter a habit name") {
		t.Fatalf("expected empty-title error")
	}

	form := url.Values{}
	form.Set("title", "Hydrate")
	addReq := httptest.NewRequest(http.MethodPost, "/items", strings.NewReader(form.Encode()))
	addReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	addRes := httptest.NewRecorder()
	h.ServeHTTP(addRes, addReq)

	dupReq := httptest.NewRequest(http.MethodPost, "/items", strings.NewReader(form.Encode()))
	dupReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	dupRes := httptest.NewRecorder()
	h.ServeHTTP(dupRes, dupReq)

	if dupRes.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", dupRes.Code)
	}
	if !strings.Contains(dupRes.Body.String(), "already exists") {
		t.Fatalf("expected duplicate error")
	}

	longTitle := strings.Repeat("a", 70)
	longForm := url.Values{}
	longForm.Set("title", longTitle)
	longReq := httptest.NewRequest(http.MethodPost, "/items", strings.NewReader(longForm.Encode()))
	longReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	longRes := httptest.NewRecorder()
	h.ServeHTTP(longRes, longReq)

	if longRes.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", longRes.Code)
	}
	if !strings.Contains(longRes.Body.String(), "60 characters") {
		t.Fatalf("expected length error")
	}
}

func TestToggleItem(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	form := url.Values{}
	form.Set("title", "Stretch")
	req := httptest.NewRequest(http.MethodPost, "/items", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}

	toggleReq := httptest.NewRequest(http.MethodPost, "/items/1/toggle", nil)
	toggleRes := httptest.NewRecorder()
	h.ServeHTTP(toggleRes, toggleReq)

	if toggleRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", toggleRes.Code)
	}
	if !strings.Contains(toggleRes.Body.String(), "line-through") {
		t.Fatalf("expected toggled item markup")
	}
}

func TestToggleNotFound(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	req := httptest.NewRequest(http.MethodPost, "/items/99/toggle", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", res.Code)
	}
}

func TestToggleBadID(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	req := httptest.NewRequest(http.MethodPost, "/items/nope/toggle", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.Code)
	}
}

func TestToggleBadPath(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	req := httptest.NewRequest(http.MethodPost, "/items/1/flip", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", res.Code)
	}
}

func TestMethodNotAllowed(t *testing.T) {
	server, err := habits.NewServer()
	if err != nil {
		t.Fatalf("failed to create server: %v", err)
	}
	h := server.Routes()

	indexReq := httptest.NewRequest(http.MethodPost, "/", nil)
	indexRes := httptest.NewRecorder()
	h.ServeHTTP(indexRes, indexReq)
	if indexRes.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", indexRes.Code)
	}

	itemsReq := httptest.NewRequest(http.MethodGet, "/items", nil)
	itemsRes := httptest.NewRecorder()
	h.ServeHTTP(itemsRes, itemsReq)
	if itemsRes.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", itemsRes.Code)
	}

	toggleReq := httptest.NewRequest(http.MethodGet, "/items/1/toggle", nil)
	toggleRes := httptest.NewRecorder()
	h.ServeHTTP(toggleRes, toggleReq)
	if toggleRes.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", toggleRes.Code)
	}
}
