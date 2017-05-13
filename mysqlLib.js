var mysql = require('mysql');
var config = require('config');

var db_config = config.get('db_config.db_config');

function handleDisconnect() {
    connection = mysql.createPool(db_config);     // creating a connection pool.

    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {  // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                        // connection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}


handleDisconnect();

