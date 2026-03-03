package src

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

// LoadSpec reads a JSON spec file, decodes strictly, and validates it.
func LoadSpec(path string) (Spec, error) {
	f, err := os.Open(path)
	if err != nil {
		return Spec{}, fmt.Errorf("open spec: %w", err)
	}
	defer f.Close()
	return DecodeSpec(f)
}

// DecodeSpec decodes a spec from any reader.
func DecodeSpec(r io.Reader) (Spec, error) {
	dec := json.NewDecoder(r)
	dec.DisallowUnknownFields()

	var spec Spec
	if err := dec.Decode(&spec); err != nil {
		return Spec{}, fmt.Errorf("decode spec: %w", err)
	}
	if err := spec.Validate(); err != nil {
		return Spec{}, fmt.Errorf("validate spec: %w", err)
	}
	return spec, nil
}
