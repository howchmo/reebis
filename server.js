var express = require('express');
var app = express();

app.use( express.static(__dirname+'/public'));
app.use( '/scripts', express.static(__dirname+'/node_modules/'));
app.listen(8088, "127.0.0.1");
