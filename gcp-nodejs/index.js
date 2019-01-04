
const dspa = require('./dspa.js'); 

exports.dspaNodejs = (request, response) => {

    response.set('Access-Control-Allow-Origin', '*');

    if (request.method === 'OPTIONS') {
        response.set('Access-Control-Allow-Methods', 'POST');
        response.set('Access-Control-Allow-Headers', 'Content-Type');
        response.set('Access-Control-Max-Age', '3600');
        response.status(204).send('');
    }
    else if (request.method === 'POST') {
        if (request.get('content-type') === 'application/json') {
            let reqData = request.body.data; 
            let reqSpec = request.body.spec; 
            if (dspa.DSPA.isUndefined(reqData) || dspa.DSPA.isUndefined(reqSpec)) {
                response.status(400).end(); 
            }
            else {
                response.send(dspa.DSPA.validateDataWithSpec(reqData, reqSpec)); 
            }
        }
        else {
            response.status(415).end(); 
        }
    }
    else {
        response.status(405).end(); 
    }
}; 