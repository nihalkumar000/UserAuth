'use strict';

var logging         = require("../logging");
var constants       = require("../constants");
var utils           = require("../controllers/utils");
var user          = require("../controllers/user");

exports.registration            = registration;
exports.verifyUser              = verifyUser;
exports.login                   = login;
exports.updateInfo              = updateInfo;
exports.logout                  = logout;


function registration(req, res){
    res.header("Access-Control-Allow-Origin", "*");

    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'registration'};
    logging.trace(handlerInfo, {REQUEST: req.body});

    var checkBlankStatus  = utils.checkBlank([req.body.name, req.body.emailId, req.body.password, 
        req.body.confirmPassword]);
    
    if(checkBlankStatus == 1){
        var err = new Error(constants.ERR_RESPONSE.SOME_PARAMETERS_MISSING);
        err.flag = constants.ERR_CODE.SOME_PARAMETERS_MISSING;
        return utils.sendErrorResponse(res, err);
    }
    
    user.user_registration(req, res);
}

function verifyUser(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'verifyUser'};
    logging.trace(handlerInfo, {REQUEST: req.body});
    var checkBlankStatus  = utils.checkBlank([req.query.token]);

    if(checkBlankStatus == 1){
        var err = new Error(constants.ERR_RESPONSE.SOME_PARAMETERS_MISSING);
        err.flag = constants.ERR_CODE.SOME_PARAMETERS_MISSING;
        return utils.sendErrorResponse(res, err);
    }
    user.verify_user(req, res);
}

function login(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'login'
    };
    logging.trace(handlerInfo, {REQUEST: req.body});
    var checkBlankStatus  = utils.checkBlank([req.body.emailId, req.body.password]);

    if(checkBlankStatus == 1){
        var err = new Error(constants.ERR_RESPONSE.SOME_PARAMETERS_MISSING);
        err.flag = constants.ERR_CODE.SOME_PARAMETERS_MISSING;
        return utils.sendErrorResponse(res, err);
    }
    
    user.login_user(req, res);
}

function updateInfo(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'updateInfo'
    };
    logging.trace(handlerInfo, {REQUEST: req.body});
    var checkBlankStatus  = utils.checkBlank([req.body.token]);

    if(checkBlankStatus == 1){
        var err = new Error(constants.ERR_RESPONSE.SOME_PARAMETERS_MISSING);
        err.flag = constants.ERR_CODE.SOME_PARAMETERS_MISSING;
        return utils.sendErrorResponse(res, err);
    }

    user.update_info(req, res);
}

function logout(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'logout'
    };
    logging.trace(handlerInfo, {REQUEST: req.body});
    var checkBlankStatus  = utils.checkBlank([req.body.token]);

    if(checkBlankStatus == 1){
        var err = new Error(constants.ERR_RESPONSE.SOME_PARAMETERS_MISSING);
        err.flag = constants.ERR_CODE.SOME_PARAMETERS_MISSING;
        return utils.sendErrorResponse(res, err);
    }

    user.logout_user(req, res);
}