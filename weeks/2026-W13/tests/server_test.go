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
	oggleRes := httptest.NewRecorder()
	h.ServeHTTP(toggleRes, toggleReq)

	if toggleRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", toggleRes.Code)
	}
	if !strings.Contains(toggleRes.Body.String(), "line-through") {
		t.Fatalf("expected toggled item markup")
	}
}
