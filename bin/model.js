var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var helps = require('./helps');
var MongoDB;

var mongo_url = process.env.MONGOLAB_URI || process.env.OPENSHIFT_MONGODB_DB_URL || 'localhost/ankets';


MongoDB = mongoose.connect('mongodb://'+ mongo_url).connection;
autoIncrement.initialize(MongoDB);
MongoDB.on('error', function(err) { console.log('Mongo is not included:' + err.message); });

var shResume = mongoose.Schema({
    _id: Number,
    firstName: String,
    lastName: String,
    age: Date,
    email: String,
    VIN: String,
    password: String,
    gender: Boolean
});
var shMonth = mongoose.Schema({
    _id: Number,
    name: String,
    date: Date,
    startDate: Date,
    endDate: Date
});
var shAnkets = mongoose.Schema({
    _id: Number,
    _month: { type: Number, ref: 'bcrMonth' },
    _resume: { type: Number, ref: 'bcrResume' },
    type: Number,
    status: Number,
    ip: String
});
shResume.plugin(autoIncrement.plugin, 'bcrResume');
shMonth.plugin(autoIncrement.plugin, 'bcrMonth');
shAnkets.plugin(autoIncrement.plugin, 'bcrAnkets');
var tbResume = mongoose.model('bcrResume', shResume);
var tbMonth = mongoose.model('bcrMonth', shMonth);
var tbAnkets = mongoose.model('bcrAnkets', shAnkets);


exports.connect = function(ip){

};
exports.getMonths = function(callback){
    tbMonth.find({}).sort({date: -1}).exec(callback);
};
exports.getAnketsByMonth = function(id, callback){
    tbAnkets.find({_month: id}).populate('_resume').exec(callback);
};
exports.getAnkets = function(expression, sort, callback){
    tbAnkets.find(expression).populate('_resume').populate('_month').sort(sort).exec(callback);
};
exports.getAnketsByResume = function(id, callback){
    tbAnkets.find({_resume: id}).populate('_resume').exec(callback);
};
exports.updateAnket = function(id, month, fields, callback){
    tbAnkets.update({_resume: id, _month: month}, {$set: fields}, {multi: true} , callback);
};
exports.updateMonth = function(id, fields, callback){
    tbMonth.update({_id: id}, {$set: fields}, {multi: true} , callback);
};
exports.getMonth = function(id, callback){
    var filter = id? {_id: id}: {};
    if(id>=0){
        tbMonth.findOne(filter, callback);
    }else{
        tbMonth.findOne().sort('-_id').exec(callback);
    }
};
exports.getResume = function(id, callback){
    tbResume.findOne({_id: id}).exec(callback);   
};
exports.getResumeByName = function(firstName, lastName, callback){
    tbResume.findOne({firstName: firstName, lastName: lastName}).exec(callback)
};
exports.getOrCreateResumeByName = function(resume, callback){
    tbResume.findOne({firstName: resume.firstName, lastName: resume.lastName}).exec(function(err, object){
        if(object){
            callback(err, object);
        }else{
            exports.createEmptyResume(resume, callback)
        }
    })
};
exports.updateResume = function(id, fields, callback){
    tbResume.findOneAndUpdate({_id: id}, {$set: fields}, {new: true}, callback);
};
exports.getResumeHistory = function(id, callback){
    tbAnkets.find({'_resume': id}).populate('_month').sort('-_month').exec(callback);
};
exports.createMonth = function(month, callback){
    tbMonth.create(month, callback);
};
exports.createEmptyResume = function(resume, callback){
    tbResume.create({
        firstName: resume.firstName,
        lastName: resume.lastName,
        age: helps.randomAvailableDate(),
        VIN: resume.VIN,
        password: resume.password,
        gender: resume.gender
    }, callback)
};
exports.createAnket = function(anket, monthID){
    return new Promise(function(resolve, reject){
        exports.getOrCreateResumeByName(anket, function(err, object){
            tbAnkets.create({
                _month: monthID,
                _resume: object._id,
                type: anket.type,
                status: object.email ? 1 : 0
            }, function(err, object){
                resolve(object);
            })
        })
    });
};
// exports
exports.exportMonth = function(callback){
    tbMonth.find({}).exec(callback);
};
exports.exportAnkets = function(callback){
    tbAnkets.find({}).exec(callback);
};
exports.exportResume = function(callback){
    tbResume.find({}).exec(callback);
};
// imports
exports.importMonth = function(data){
    tbMonth.remove({}, function(){
        data.forEach(function(mon){
            tbMonth.create({
                _id: mon.idMonth || mon._id,
                name: mon.name,
                date: mon.date,
                startDate: mon.start_send || mon.startDate,
                endDate: mon.end_send || mon.endDate
            })
        });
    });
};
exports.importAnkets = function(data){
    tbAnkets.remove({}, function(){
        data.forEach(function(anket){
            tbAnkets.create({
                _id: anket.id || anket._id,
                _month: anket.idMonth || anket._month,
                _resume: anket.idResume || anket._resume,
                type: anket.type,
                status: anket.status,
                ip: anket.ip
            })
        });
    });
};
exports.importResume = function(data){
    tbResume.remove({}, function(){
        data.forEach(function(resume) {
            tbResume.create({
                _id: resume['id'] || resume['_id'],
                firstName: resume['name'] || resume['firstName'],
                lastName: resume['last_name'] || resume['lastName'],
                age: resume['age'] !== "0000-00-00 00:00:00" ? resume['age'] : helps.randomAvailableDate(),
                email: resume['email'],
                VIN: resume['VIN'],
                password: resume['password'],
                gender: resume['gender']
            });
        })
    });
};