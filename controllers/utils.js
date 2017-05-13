var crypto      = require("crypto");


exports.generateRandomToken        = generateRandomToken;
exports.sendErrorResponse          = sendErrorResponse;
exports.checkBlank                 = checkBlank;

function sendErrorResponse(res, err){
    var response = {"flag" : err.flag, "message" : err.message};
    res.status(200).send(response);
}

function generateRandomToken(len, obj, cb){
    crypto.randomBytes(Math.floor(len/2), function(tokenErr, buffer) {
        if(tokenErr){
            return cb(tokenErr);
        }
        obj.token = buffer.toString('hex');
        cb(null, obj);
    });
}

function checkBlank(arr) {
    for (var i = 0; i < arr.length; i++){
        if (arr[i] === '' || arr[i] === "" || arr[i] == undefined){
            console.log( "Variable at " + i + " 'th index is not defined from frontend. Please check! ");
            return 1;
        }
    }
    return 0;
}
