## Deployment

```
gcloud functions deploy dspaNodejs --runtime nodejs6 --trigger-http
```

## Test

```
curl -v -X POST -H 'Content-Type:application/json' -d '{"data":{"123":1}, "spec":{"__type__":"object","__children__":{"123":{"__type__":"string"}}}}' https://us-central1-wfchiang-dev.cloudfunctions.net/dspaNodejs
```