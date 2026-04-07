package main

import "week15/src"

func main() {
	root := src.NewRootCommand()
	if err := root.Execute(); err != nil {
		// Cobra already prints errors; exit with non-zero code
		panic(err)
	}
}
