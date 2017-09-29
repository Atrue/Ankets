var express = require('express');
var router = express.Router();
var fs = require('fs');

/* MAIN PAGE. */
router.get('/', function(req, res, next) {
    fs.readFile('app/app.html', function(err,info){
        if(err){
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

module.exports = router;