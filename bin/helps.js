var auth_password = process.env.AUTH_PASSWORD || {};

var MIN_DATE = new Date(1950, 0, 1);
var MAX_DATE = new Date(1993, 0, 1);

var MIN_AVG_DATE = new Date(1980, 0, 1);
var MAX_AVG_DATE = new Date(1990, 0, 1);

exports.randomDate = function(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
exports.randomAvailableDate = function() {
    return exports.randomDate(MIN_DATE, MAX_DATE);
};
exports.randomAvailableAvgDate = function() {
    return Math.random() >= 0.5 ? exports.randomAvailableDate() : exports.randomDate(MIN_AVG_DATE, MAX_AVG_DATE);
};

exports.is_auth = function(pwd) {
    return pwd === auth_password;
}

exports.auth_check = function(req, res, next){
    if(!exports.is_auth(req.body.auth)) {
        res.json({});
    }else{
        next();
    }
}