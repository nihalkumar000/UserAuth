'use strict';

var logging     = require("../logging");
var async       = require("async");
var crypto      = require("crypto");
var bcrypt      = require("bcrypt");
var config      = require("config");
var constants   = require("../constants");
var utils       = require('./utils');

exports.user_registration       = user_registration;
exports.verify_user             = verify_user;
exports.login_user              = login_user;
exports.logout_user             = logout_user;
exports.update_info             = update_info;


function user_registration(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'registration'
    };
    
    var userInfo = {};
    userInfo.name               = req.body.name;
    userInfo.email_id           = req.body.emailId;
    userInfo.password           = req.body.password;
    userInfo.confirmPassword    = req.body.confirmPassword;
    
    if(userInfo.password != userInfo.confirmPassword){
        var err = new Error(constants.ERR_RESPONSE.PASSWORDS_DIDNOT_MATCHED);
        err.flag = constants.ERR_CODE.PASSWORDS_DIDNOT_MATCHED;
        utils.sendErrorResponse(res, err);
    }

    var tasks = [];
    tasks.push(checkDuplicateUser.bind(null, handlerInfo, userInfo));
    tasks.push(generatePassword.bind(null, userInfo));
    tasks.push(insertUserData.bind(null, handlerInfo));
    tasks.push(sendEmailToUser.bind(null, userInfo));
    

    async.waterfall(tasks, function(asyncErr, asyncD){
        if(asyncErr){
            return utils.sendErrorResponse(res, asyncErr);    
        }
        res.status(200).send("Successfully created user!!")
    });
}

function verify_user(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'verifyUser'
    };

    var userInfo = {};
    var token       = req.query.token;
    
    var tasks = [];
    tasks.push(verifyUser.bind(null, handlerInfo, token));
    //tasks.push(sendEmailToUser.bind(null, userInfo));


    async.waterfall(tasks, function(asyncErr, asyncD){
        if(asyncErr){
            return utils.sendErrorResponse(res, asyncErr);
        }
        res.status(200).send("User successfully verified !!");
    });
}

function login_user(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'login'
    };

    var userInfo = {};
    userInfo.email_id   = req.body.emailId;
    userInfo.password   = req.body.password;

    var tasks = [];
    tasks.push(getUser.bind(null, handlerInfo, userInfo));
    tasks.push(verifyPassword.bind(null, handlerInfo));
    tasks.push(utils.generateRandomToken.bind(null, 24));
    tasks.push(createSession.bind(null, handlerInfo));


    async.waterfall(tasks, function(asyncErr, asyncD){
        if(asyncErr){
            return utils.sendErrorResponse(res, asyncErr);
        }
        res.status(200).send(asyncD);
    });
}

function logout_user(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'logout'
    };

    var userInfo = {};
    userInfo.token   = req.body.token;

    var tasks = [];
    tasks.push(destroySession.bind(null, handlerInfo, userInfo));


    async.waterfall(tasks, function(asyncErr, asyncD){
        if(asyncErr){
            return utils.sendErrorResponse(res, asyncErr);
        }
        res.status(200).send(asyncD);
    });
}

function update_info(req, res){
    var handlerInfo = {
        apiModule : 'user',
        apiHandler: 'updateInfo'
    };

    var userInfo = req.body;
    
    var tasks = [];
    tasks.push(getUserIdFromSession.bind(null, handlerInfo, userInfo));
    tasks.push(updateUser.bind(null, handlerInfo));


    async.waterfall(tasks, function(asyncErr, asyncD){
        if(asyncErr){
            return utils.sendErrorResponse(res, asyncErr);
        }
        res.status(200).send(asyncD);
    });
}

function checkDuplicateUser(handlerInfo, userInfo, cb){
    var emailId = userInfo.email_id;

    var dup = "SELECT * FROM tb_user WHERE email_id = ? AND is_verified = 1";
    var dupQ = connection.query(dup, [emailId], function(dupE, dupD){
        logging.logDatabaseQuery(handlerInfo, 'Check duplicate users', dupE, dupD, dupQ.sql);
        if(dupE){
            return cb(dupE);
        }
        if(dupD.length){
            var err = new Error(constants.ERR_RESPONSE.USER_ALREADY_EXISTS);
            err.flag = constants.ERR_CODE.USER_ALREADY_EXISTS;
            return cb(err);
        }
        cb();
    });
}

function generatePassword(userInfo, cb){
    bcrypt.hash(userInfo.password, constants.saltRounds, function(hErr, hash){
        if(hErr){
            return cb(hErr);
        }
        userInfo.password = hash;
        cb(null, userInfo);
    });
}

function insertUserData(handlerInfo, userInfo, cb){
    
    var tasks = [];
    tasks.push(utils.generateRandomToken.bind(null, 12, userInfo));
    tasks.push(insertUser.bind(null, handlerInfo));

    async.waterfall(tasks, function(asyncErr, asyncD){
        if(asyncErr){
            return cb(asyncErr);
        }
        cb();
    });
}

function sendEmailToUser(userInfo, cb){
    var url = config.get("link")+":"+config.get("port")+"/user/verification?token="+userInfo.token;
    
    var mailOptions = {
        from    : '"Tech Company000" <tech.company000@gmail.com>', // sender address
        to      : userInfo.email_id, // list of receivers
        subject : 'Hola !!', // Subject line
        text    : 'Hey How are you doing?', // plain text body
        html    : '<b>Hey from TechCompany000 ? </b><br><a href="'+url+'">Click here to verify your account</a>' // html body
    };
    
    transporter.sendMail(mailOptions, function(mailErr, info) {
        if (mailErr) {
            return cb(mailErr);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        cb();
    });

}

function verifyUser(handlerInfo, token, cb){
    var vUser = "UPDATE tb_user SET is_verified = 1 WHERE registration_token = ?";
    var vUserQ = connection.query(vUser, [token], function(vUserE, vUserD){
        logging.logDatabaseQuery(handlerInfo, 'Verifying user', vUserE, vUserD, vUserQ.sql);
        if(vUserE){
            return cb(vUserE);
        }
       cb();
    });
}

function getUser(handlerInfo, userInfo, cb){
    var vUser = "SELECT user_id, password FROM tb_user WHERE email_id = ? AND is_verified = 1";
    var vUserQ = connection.query(vUser, [userInfo.email_id], function(vUserE, vUserD){
        logging.logDatabaseQuery(handlerInfo, 'Verifying user', vUserE, vUserD, vUserQ.sql);
        if(vUserE){
            return cb(vUserE);
        }
        if(!vUserD.length){
            var err = new Error(constants.ERR_RESPONSE.NO_SUCH_USER);
            err.flag = constants.ERR_CODE.NO_SUCH_USER;
            return cb(err);
        }
        userInfo.user_id = vUserD[0].user_id;
        userInfo.hash = vUserD[0].password;
        cb(null, userInfo);
    });
}

function verifyPassword(handlerInfo, userInfo, cb){
    bcrypt.compare(userInfo.password, userInfo.hash, function(bErr, bData){
        logging.logDatabaseQuery(handlerInfo, 'Compare user password', bErr, bData);
        if(bErr){
            return cb(bErr);
        }
        
        if(!bData){
            var err = new Error(constants.ERR_RESPONSE.INCORRECT_PASSWORD);
            err.flag = constants.ERR_CODE.INCORRECT_PASSWORD;
            return cb(err);
        }
        cb(null, userInfo);
    }); 
}

function createSession(handlerInfo, userInfo, cb){
    var values = [userInfo.user_id, userInfo.token, userInfo.metadata || "", 1];
    var iSession = "INSERT INTO tb_session (user_id, token, metadata, is_valid) VALUES (?)";
    var iSessionQ = connection.query(iSession, [values], function(iSessionE, iSessionD){
        logging.logDatabaseQuery(handlerInfo, 'Check duplicate users', iSessionE, iSessionD, iSessionQ.sql);
        if(iSessionE){
            return cb(iSessionE);
        }
        cb(null, {token : userInfo.token});
    });
}

function destroySession(handlerInfo, userInfo, cb){
    var values = [userInfo.token];
    var dSession = "UPDATE tb_session SET is_valid = 0 WHERE token = ?";
    var dSessionQ = connection.query(dSession, values, function(dSessionE, dSessionD){
        logging.logDatabaseQuery(handlerInfo, 'Error while destroying user session!!', dSessionE, dSessionD, dSessionQ.sql);
        if(dSessionE){
            return cb(dSessionE);
        }
        cb(null, {message : "User logged out successfully!!"});
    });
}


function getUserIdFromSession(handlerInfo, userInfo, cb){
    var user = "SELECT user_id FROM tb_session WHERE is_valid = 1 AND token = ?";
    var userQ = connection.query(user, [userInfo.token], function(userE, userD){
        logging.logDatabaseQuery(handlerInfo, 'Get user from session token', userE, userD, userQ.sql);
        if(userE){
            return cb(userE);
        }
        userInfo.user_id = userD[0].user_id;
        return cb(null, userInfo);
    });
}

function updateUser(handlerInfo, userInfo, cb){
    var allowedUpdates = ["dob", "user_status", "name"];
    var uUser = "UPDATE tb_user SET "; //"WHERE user_id = ?"
    var values = [];
    allowedUpdates.forEach(function(elem, index, allowedUpdates){
        if(userInfo[elem] && userInfo[elem].length) {
            uUser += elem + "= ?,";
            values.push(userInfo[elem]);
        }
    });
    if(!values.length){
        return cb(null,  {flag : 101, message : "Values updated successfully !!"});
    }
    uUser = uUser.substring(0, uUser.length-1);
    uUser += " WHERE user_id = ?";
    values.push(userInfo.user_id);
    var uUserQ = connection.query(uUser, values, function(uUserE, uUserD){
        logging.logDatabaseQuery(handlerInfo, 'Updating user', uUserE, uUserD, uUserQ.sql);
        if(uUserE){
            return cb(uUserE);
        }
        cb(null, {flag : 101, message : "Values updated successfully !!"});
    });

}

function insertUser(handlerInfo, userInfo, cb){
    var values = [userInfo.name, userInfo.email_id, userInfo.token, userInfo.password];
    var iUser = "INSERT INTO tb_user (name, email_id, registration_token, password) VALUES (?) ";
    var iUserQ = connection.query(iUser, [values], function(iUserE, iUserD){
        logging.logDatabaseQuery(handlerInfo, 'Check duplicate users', iUserE, iUserD, iUserQ.sql);
        if(iUserE){
            return cb(iUserE);
        }
        cb();
    });
}
