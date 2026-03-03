package tests

import (
	"strings"
	"testing"

	"taskrunner/src"
)

const validSpec = `{
  "version": "1",
  "tasks": [
    {
      "name": "build",
      "steps": [
        {"name": "compile", "cmd": "go build ./..."}
      ]
    }
  ]
}`

func TestDecodeSpecValid(t *testing.T) {
	spec, err := src.DecodeSpec(strings.NewReader(validSpec))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(spec.Tasks) != 1 {
		t.Fatalf("expected 1 task, got %d", len(spec.Tasks))
	}
}

func TestDecodeSpecUnknownField(t *testing.T) {
	bad := `{"tasks":[],"oops":true}`
	_, err := src.DecodeSpec(strings.NewReader(bad))
	if err == nil {
		t.Fatalf("expected error for unknown field")
	}
}

func TestDecodeSpecValidation(t *testing.T) {
	bad := `{"tasks":[{"name":"","steps":[]}]}`
	_, err := src.DecodeSpec(strings.NewReader(bad))
	if err == nil {
		t.Fatalf("expected validation error")
	}
}
