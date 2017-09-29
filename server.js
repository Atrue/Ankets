//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    fs = require('fs'),
    path = require('path');

Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));
//  Add handlers for the app (from the routes).
app.use('/', require('./bin/routes/index'));
app.use('/model/', require('./bin/routes/ajax'));
app.use('/auth/', require('./bin/routes/auth'));
app.use('/admin/', require('./bin/routes/admin'));
app.use('/excel/', require('./bin/routes/excel'));

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;