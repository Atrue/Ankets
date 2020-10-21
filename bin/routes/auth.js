var express = require('express');
var router = express.Router();
var model = require('../model');
var helps = require('../helps');

var mails = {
    yandex: {
        alias: ['yandex.ru'],
        login: 'https://passport.yandex.ru/passport?mode=auth&retpath=https://mail.yandex.ru/',
        registration: 'https://passport.yandex.ru/registration/mail?from=mail&origin=home_v14_ru&retpath=https%3A%2F%2Fmail.yandex.ru'
    },
    rambler: {
        alias: ['rambler.ru', 'lenta.ru', 'autorambler.ru', 'myrambler.ru', 'ro.ru'],
        login: 'https://mail-pda.rambler.ru/',
        registration: 'https://id.rambler.ru/account/?back=//mail.rambler.ru?rname=mail#registration'
    },
    mail: {
        alias:['mail.ru', 'bk.ru', 'inbox.ru', 'list.ru'],
        login: function(object){return 'https://e.mail.ru/login?email=' + object.email},
        registration: 'https://e.mail.ru/signup?from=main'
    },
    qip: {
        alias: ["qip.ru", "borda.ru", "pochta.ru", "fromru.com", "front.ru", "hotbox.ru", "hotmail.ru", "krovatka.su", "land.ru", "mail15.com", "mail333.com", "newmail.ru", "nightmail.ru", "nm.ru", "pisem.net", "pochtamt.ru", "pop3.ru", "rbcmail.ru", "smtp.ru", "5ballov.ru", "aeterna.ru", "ziza.ru", "memori.ru", "photofile.ru", "fotoplenka.ru", "pochta.com", "webmail.ru"],
        login: 'https://qip.ru/',
        registration: 'https://qip.ru/mnt/pages/register?retpath=http://mail.qip.ru&utm_source=mainqip&utm_medium=referral&utm_term=title&utm_campaign=main_new_register'
    },
    gmail: {
        alias: ["gmail.com"],
        login: 'https://accounts.google.com/Login#identifier',
        registration: 'https://accounts.google.com/SignUp?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ltmpl=default'
    }
};


/* GO TO CLIENT MAIL*/

router.get('/log/:id/', helps.auth_check, function(req, res, next){
    var id = req.params.id;
    model.getResume(id, function(err, object){
        var status = false;
        if(object){
            var email = object.email;
            var resume_mail = email.split('@')[1];

            for(var mail in mails){
                if(mails[mail].alias.indexOf(resume_mail) !== -1){
                    res.writeHead(302, {
                        'Location': typeof mails[mail].login == 'function' ? mails[mail].login(object): mails[mail].login
                    });
                    res.end();
                    status = true;
                    break;
                }
            }
        }
        if(!status){
            console.error(err);
            res.statusCode = 500;
            res.end('Error');
        }
    });
});
router.get('/reg/:mail/', helps.auth_check, function(req, res, next){
    var mail = req.params.mail;
    if(mail === 'random'){
        var keys = Object.keys(mails);
        var rn = Math.floor(Math.random() * (keys.length - 1));
        mail = keys[rn];
    }
    if(mails[mail]){
        var url = mails[mail].registration;
        res.writeHead(302, {
            'Location': url
        });
        res.end();
        status = true;
    }else{
        res.statusCode = 500;
        res.end('Error');
    }
});

module.exports = router;