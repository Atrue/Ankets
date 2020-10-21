var express = require('express');
var router = express.Router();
var model = require('../model');
var helps = require('../helps');
/* MODEL CONNECTING */

router.post('/months/', helps.auth_check, function(req, res, next) {
    model.getMonths(function(err, objects){
        res.json(objects);
    });
});
router.post('/ankets/', helps.auth_check, function(req, res, next){
    var ip = getIP(req);
    var idMonth = req.body.idMonth;
    var js = {};
    js.ip = {};
    model.getMonth(idMonth, function(err, object){
        if(object){
            js.month = object;
            model.getAnketsByMonth(object._id, function(err, objects){
                js.ankets = objects? objects.sort(function(p, n){
                    if(p._resume.lastName < n._resume.lastName) return -1;
                    if(p._resume.lastName > n._resume.lastName) return 1;
                    return 0;
                }): [];
                var used = js.ankets.filter(function(o){
                    return o.ip == ip;
                }).length > 0;
                js.ip = {
                    ip: ip,
                    used: used
                };
                res.json(js);
            });
        }else{
            res.json({});
        }
    })
});
router.post('/resume-info/', helps.auth_check, function(req, res, next){
    var idResume = req.body.idResume;
    model.getAnketsByResume(idResume, function(err, object){
        res.json(object);
    })
});
router.post('/history/', helps.auth_check, function(req, res, next){
    var idResume = req.body.idResume;
    model.getResumeHistory(idResume, function(err, objects){
        var months = [];
        var result = objects.filter(function(o){
            if(o._month && months.indexOf(o._month.id) === -1){
                months.push(o._month.id);
                return true;
            }
            return false;
        });
        res.json(result);
    })
});
router.post('/ip-history/', helps.auth_check, function(req, res, next){
    var ip = getIP(req);
    model.getAnkets({ip: ip}, {'_month.date': -1}, function(err, objects){
        if(!err){
            res.json({status: true, history: objects});
        }else{
            res.json({status: false, msg: err});
        }
    })
});
router.post('/set-status/', helps.auth_check, function(req, res, next){
    var idResume = req.body.idResume;
    var month = req.body.month;
    var status = parseInt(req.body.status);
    if (!isNaN(status) && status >= -1 && status <= 3) {
        var update = {
            status: status
        };
        if (status == 3){
            update.ip = getIP(req);
        }        
        model.updateAnket(idResume, month, update, function (err, object) {
            if(!err && !update.ip){
                res.json({status: true});
            }else {
                res.json({status: false, hardUpdate: true});
            }
        });
    }else {
        res.json({status: false});
    }
});
router.post('/update/', helps.auth_check, function(req, res, next){
    var resume = req.body.resume;
    var idMonth = req.body.month;
    var idResume = parseInt(resume._id);
    var update = {};
    update.email = resume.email;
    update.age = new Date(resume.age);
    update.password = resume.password;
    
    model.updateResume(idResume, update, function (err, object) {
        if(resume.email) {
            model.updateAnket(idResume, idMonth, {status: 1}, function (err, object) {
                if (!err) {
                    res.json({status: true});
                } else {
                    res.json({status: false, msg: err});
                }
            });
        }else{
            if(!err){
                res.json({status: true, resume: object});
            }else {
                res.json({status: false, msg: err});
            }
        }
    });
});
router.post('/update-month/', helps.auth_check, function(req, res, next){
    var month = req.body.month;
    var id = parseInt(month._id);
    var update = {
        date: new Date(month.date),
        name: month.name,
        dateStart: new Date(month.dateStart),
        dateEnd: new Date(month.dateEnd)
    };

    model.updateMonth(month._id, update, function (err, object) {
        if(!err){
            res.json({status: true});
        }else {
            res.json({status: false, msg: err});
        }
    });
});
router.post('/add-month/', helps.auth_check, function(req, res, next){
    var req_month = req.body.month;
    var req_year = req.body.year;
    if(req_month !== undefined && req_year !== undefined) {
        var locales = ['Январь', 'Февраль', 'Март', 'Апрель', "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        var month_rus = locales[req_month];
        var month = {};
        month.name = month_rus + ' ' + req_year;
        month.date = new Date(req_year, req_month);
        month.startDate = new Date(req_year, req_month);
        month.endDate = new Date(req_year, req_month);
        month.startDate.setDate(month.startDate.getDate() + 31 + 15);
        month.endDate.setDate(month.endDate.getDate() + 31 + 31 + 15);

        model.createMonth(month, function (err, object) {
            if (!err) {
                res.json({status: true, month: object});
            } else {
                res.json({status: false, msg: err});
            }
        })
    }else{
        res.json({status: false, msg: 'Month and year are required'});
    }
});
function getIP(req){
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

module.exports = router;