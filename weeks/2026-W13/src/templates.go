package habits

import (
	"html/template"
	"io"
)

type Templates struct {
	tmpl *template.Template
}

type PageData struct {
	Items []Item
}

func NewTemplates() (*Templates, error) {
	tmpl, err := template.New("page").Parse(pageTemplate + listTemplate + itemTemplate)
	if err != nil {
		return nil, err
	}
	return &Templates{tmpl: tmpl}, nil
}

func (t *Templates) RenderPage(w io.Writer, data PageData) error {
	return t.tmpl.ExecuteTemplate(w, "page", data)
}

func (t *Templates) RenderList(w io.Writer, items []Item) error {
	return t.tmpl.ExecuteTemplate(w, "list", items)
}

func (t *Templates) RenderItem(w io.Writer, item Item) error {
	return t.tmpl.ExecuteTemplate(w, "item", item)
}

const pageTemplate = `
{{define "page"}}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HTMX Habit Check-ins</title>
    <script src="https://unpkg.com/htmx.org@1.9.12"></script>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-950 text-slate-100 min-h-screen">
    <main class="max-w-2xl mx-auto px-6 py-12">
      <header class="mb-6">
        <h1 class="text-3xl font-semibold">Daily Habit Check-ins</h1>
        <p class="text-slate-300 mt-2">Server-rendered HTML + HTMX swaps for fast updates.</p>
      </header>
      <section class="bg-slate-900/60 rounded-xl p-6 border border-slate-800">
        <form class="flex flex-col sm:flex-row gap-3" hx-post="/items" hx-target="#list" hx-swap="innerHTML">
          <input class="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2" name="title" placeholder="Add a habit (e.g. Stretch 10 min)" required />
          <button class="rounded-lg bg-emerald-500 text-emerald-950 font-semibold px-4 py-2" type="submit">Add</button>
        </form>
        <div class="mt-6" id="list">
          {{template "list" .Items}}
        </div>
      </section>
    </main>
  </body>
</html>
{{end}}
`

const listTemplate = `
{{define "list"}}
  {{if .}}
    <ul class="space-y-3">
      {{range .}}
        {{template "item" .}}
      {{end}}
    </ul>
  {{else}}
    <p class="text-slate-400">No habits yet. Add the first one above.</p>
  {{end}}
{{end}}
`

const itemTemplate = `
{{define "item"}}
<li id="item-{{.ID}}" class="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-lg px-4 py-3">
  <div>
    <p class="font-medium {{if .Done}}line-through text-slate-400{{end}}">{{.Title}}</p>
    <p class="text-xs text-slate-500">ID {{.ID}}</p>
  </div>
  <form hx-post="/items/{{.ID}}/toggle" hx-target="#item-{{.ID}}" hx-swap="outerHTML">
    <button class="text-xs uppercase tracking-wide {{if .Done}}text-amber-300{{else}}text-emerald-300{{end}}" type="submit">
      {{if .Done}}Undo{{else}}Done{{end}}
    </button>
  </form>
</li>
{{end}}
`
