## Local Testing 

```
dev_appserver.py app.yaml
```

## Deploy to GCP 

```
gcloud app deploy
```

## Endpoint 

For example, https://wfchiang-dev.appspot.com/dspa-predicates/is-valid-date 

* The context-root, dspa-predicates, is specified in app.yaml 
* The endpoint, is-valid-date, is specified in main.go

Currently, only POST requests are accepted. 

Example curl command: 

```
curl  -v -X POST -H 'Content-Length:0' https://wfchiang-dev.appspot.com/dspa-predicates/is-valid-date
```