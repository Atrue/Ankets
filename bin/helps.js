var MIN_DATE = new Date(1950, 0, 1);
var MAX_DATE = new Date(1993, 0, 1);

exports.randomDate = function(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
exports.randomAvailableDate = function(){
    return exports.randomDate(MIN_DATE, MAX_DATE);
};
