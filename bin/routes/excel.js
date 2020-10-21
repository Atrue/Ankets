var express = require('express');
var router = express.Router();
var model = require('../model');
var fs = require('fs');
var multer  = require('multer');
var kexcel = require('kexcel');
var helps = require('../helps');

var upload = multer({ dest: 'uploads/' });


router.post('/import/', helps.auth_check, upload.single('file'), function(req, res, next){
    var file = req.file;
    var month = req.body.month;
    if (!file || !file.path || !month){
        res.json({status: false, message: "file and month are required"});
        return;
    }
    kexcel.open(file.path).then(function(workbook) {
        var sheet = workbook.getSheet(0);
        function getValue(v){
            var val = v.hasOwnProperty('_') ? v._ : v;
            return (val + '').trim()
        }
        var lastRow = sheet.getLastRowNumber();
        parsePromise(3);
        function parsePromise(index){
            if(index <= lastRow){
                var row = sheet.getRow(index);
                var email = row[13];
                if(!email) {
                    var anket = {
                        firstName: getValue(row[1]),
                        lastName: getValue(row[2]),
                        gender: getValue(row[3]),
                        VIN: getValue(row[6]),
                        type: getValue(row[10]),
                        password: getValue(row[6]).slice(0, -1)
                    };
                    model.createAnket(anket, month).then(function(result) {
                        parsePromise(index + 1);
                    });
                }else{
                    parsePromise(index + 1);
                }
            }else{
                res.json({status: true});
            }
        }
    }).then(function() {

    });
});
router.post('/export/', upload.single('file'), function(req, res, next){
    var file = req.file;
    var month = req.body.month;
    if (!file || !file.path || !month){
        res.json({status: false, message: "file and month are required"});
        return;
    }
    model.getAnketsByMonth(month, function(err, objects){
        function getEmail(firstName, lastName){
            firstName = typeof firstName === "object"? firstName._.trim() : firstName.trim();
            lastName = typeof lastName === "object"? lastName._.trim() : lastName.trim();

            var value;
            for(var i=0; i<objects.length; i++){
                value = objects[i];
                if(value && value._resume && value._resume.firstName === firstName && value._resume.lastName === lastName){
                    return value._resume.email;
                }
            }
            return undefined;
        }
        kexcel.open(file.path).then(function(workbook) {
            var sheet = workbook.getSheet(0);

            for(var i=3; i<=sheet.getLastRowNumber(); i++){
                var row = sheet.getRow(i);
                var oEmail = row[13];
                var firstName = row[1];
                var lastName = row[2];
                if(!oEmail && firstName && lastName){
                    var nEmail = getEmail(firstName, lastName);
                    if(nEmail) {
                        var cell = sheet.getCell(i, 14);
                        cell.v = [sheet.workbook.sharedStrings.getIndex(nEmail)];
                        cell.$.t = 's';
                    }
                }
            }
            res.setHeader('Content-disposition', 'attachment; filename="'+encodeURI(file.originalname)+'"');
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8');
            workbook.pipe(res);
        });
    });
});


module.exports = router;