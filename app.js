var express         = require('express');
var http            = require('http');
var https           = require('https');
var path            = require('path');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var fs              = require('fs');
var config          = require('config');

connection  = undefined;
transporter = undefined;


var mysql           = require('./mysqlLib');
var transp          = require('./controllers/mail');
var logger          = require('./logging');
var user            = require('./routes/user');


var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json({
    extended: true
    }
));
app.use(bodyParser.urlencoded({
      extended: true
}));

app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/user/registration'               ,user.registration);
app.get('/user/verification'                ,user.verifyUser);
app.post('/user/login'                      ,user.login);
app.post('/user/updateInfo'                 ,user.updateInfo);
app.post('/user/logout'                     ,user.logout);

app.get('/ping', function(req, res){res.send('Ping Pong!!')});


var httpServer = http.createServer(app).listen(config.get('port'), function() {
    console.log('Express HTTP server listening on port ' + config.get('port'));
});



