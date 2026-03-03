package src

import (
	"errors"
	"fmt"
)

// Spec is the top-level task specification.
type Spec struct {
	Version string `json:"version"`
	Tasks   []Task `json:"tasks"`
}

// Task groups a set of steps.
type Task struct {
	Name  string `json:"name"`
	Steps []Step `json:"steps"`
}

// Step represents a command to execute.
type Step struct {
	Name string            `json:"name"`
	Cmd  string            `json:"cmd"`
	Env  map[string]string `json:"env,omitempty"`
	Dir  string            `json:"dir,omitempty"`
}

func (s Spec) Validate() error {
	if len(s.Tasks) == 0 {
		return errors.New("spec must include at least one task")
	}
	for ti, t := range s.Tasks {
		if t.Name == "" {
			return fmt.Errorf("task[%d] missing name", ti)
		}
		if len(t.Steps) == 0 {
			return fmt.Errorf("task[%d] must include at least one step", ti)
		}
		for si, st := range t.Steps {
			if st.Name == "" {
				return fmt.Errorf("task[%d].step[%d] missing name", ti, si)
			}
			if st.Cmd == "" {
				return fmt.Errorf("task[%d].step[%d] missing cmd", ti, si)
			}
		}
	}
	return nil
}
