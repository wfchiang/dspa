package main

import (
	"fmt"
	"net/http"
	"google.golang.org/appengine"
)

var CONTEXT_ROOT = "/dspa-predicates"

func main () {
	http.HandleFunc("/", indexHandler)
	appengine.Main()
}

func indexHandler (resp_writer http.ResponseWriter, req *http.Request) {
	if (req.URL.Path == CONTEXT_ROOT+"/is-valid-date") {
		fmt.Fprintln(resp_writer, "/is-valid-date called")
	} else {
		fmt.Fprintln(resp_writer, "Unknown endpoint: " + req.URL.Path)
	}
}