var express = require('express');
var router = express.Router();
var model = require('../model');
var fs = require('fs');
var multer  = require('multer');

var upload = multer({ dest: 'uploads/' });
var admin_password = process.env.ADMIN_PASSWORD || {};


router.get('/export/table/', function(req, res, next){
    fs.readFile('app/export.html', function (err, info) {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            res.end('Error');
            return;
        }
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(info);
        res.end();
    });
});
router.post('/export/table/', function(req, res, next){
    var password = req.body.password;
    if(password === admin_password){
        var final = {};
        model.exportResume(function(err, data){
            final.resume = data;
            model.exportMonth(function(err, data){
                final.month = data;
                model.exportAnkets(function(err, data){
                    final.ankets = data;
                    res.json(final);
                })
            })
        })
    }else {
        res.statusCode = 500;
        res.end('Error');
    }
});
router.get('/import/table/', function(req, res, next){
    fs.readFile('app/import.html', function (err, info) {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            res.end('Error');
            return;
        }
        res.writeHeader(200, {"Content-Type": "text/html"});
        res.write(info);
        res.end();
    });
});
router.post('/import/table/', upload.single('json'), function(req, res, next){
    var password = req.body.password;
    var file = req.file;
    try {
        var imported = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    }catch (e){
        res.json({status: false, msg: e.toString()});
        return;
    }
    if(password === admin_password && imported.ankets && imported.resume && imported.month){
        model.importAnkets(imported.ankets);
        model.importResume(imported.resume);
        model.importMonth(imported.month);
        res.json({status: true});
    }else {
        res.statusCode = 500;
        res.end('Error');
    }
});

module.exports = router;