package habits

import (
	"net/http"
	"strconv"
	"strings"
)

type Server struct {
	store     *Store
	templates *Templates
}

func NewServer() (*Server, error) {
	templates, err := NewTemplates()
	if err != nil {
		return nil, err
	}
	return &Server{store: NewStore(), templates: templates}, nil
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleIndex)
	mux.HandleFunc("/items", s.handleAdd)
	mux.HandleFunc("/items/", s.handleToggle)
	return mux
}

func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = s.templates.RenderPage(w, PageData{Items: s.store.List()})
}

func (s *Server) handleAdd(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if err := r.ParseForm(); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	title := strings.TrimSpace(r.FormValue("title"))
	if title == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	s.store.Add(title)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = s.templates.RenderList(w, s.store.List())
}

func (s *Server) handleToggle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/items/")
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) < 2 || parts[1] != "toggle" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	id, err := strconv.Atoi(parts[0])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	item, ok := s.store.Toggle(id)
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = s.templates.RenderItem(w, item)
}
