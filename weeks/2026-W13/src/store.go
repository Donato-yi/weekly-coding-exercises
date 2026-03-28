package habits

import (
	"strings"
	"sync"
)

type Item struct {
	ID    int
	Title string
	Done  bool
}

type Store struct {
	mu     sync.RWMutex
	nextID int
	items  []Item
}

const (
	FilterAll     = "all"
	FilterDone    = "done"
	FilterPending = "pending"
)

func NewStore() *Store {
	return &Store{nextID: 1, items: []Item{}}
}

func NormalizeFilter(filter string) string {
	switch strings.ToLower(strings.TrimSpace(filter)) {
	case FilterDone:
		return FilterDone
	case FilterPending:
		return FilterPending
	default:
		return FilterAll
	}
}

func (s *Store) Add(title string) Item {
	s.mu.Lock()
	defer s.mu.Unlock()
	item := Item{ID: s.nextID, Title: title, Done: false}
	s.nextID++
	s.items = append(s.items, item)
	return item
}

func (s *Store) HasTitle(title string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	needle := strings.ToLower(strings.TrimSpace(title))
	for _, item := range s.items {
		if strings.ToLower(strings.TrimSpace(item.Title)) == needle {
			return true
		}
	}
	return false
}

func (s *Store) Toggle(id int) (Item, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.items {
		if s.items[i].ID == id {
			s.items[i].Done = !s.items[i].Done
			return s.items[i], true
		}
	}
	return Item{}, false
}

func (s *Store) List() []Item {
	s.mu.RLock()
	defer s.mu.RUnlock()
	items := make([]Item, len(s.items))
	copy(items, s.items)
	return items
}

func (s *Store) Filtered(filter string) []Item {
	filter = NormalizeFilter(filter)
	items := s.List()
	if filter == FilterAll {
		return items
	}
	filtered := make([]Item, 0, len(items))
	for _, item := range items {
		if filter == FilterDone && item.Done {
			filtered = append(filtered, item)
			continue
		}
		if filter == FilterPending && !item.Done {
			filtered = append(filtered, item)
		}
	}
	return filtered
}
