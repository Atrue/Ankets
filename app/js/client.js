var Ankets = angular.module('Ankets', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);
Ankets.config(function($routeProvider){
    $routeProvider.when('/send',
        {
            templateUrl:'../views/send.html',
            controller:'SendController'
        });
    $routeProvider.when('/create',
        {
            templateUrl:'../views/create.html',
            controller:'CreateController'
        });
    $routeProvider.otherwise({redirectTo: '/send'});
});
Ankets.factory('ARequester', function($http){
    var ankets = [];
    var currentMonth;
    var availableMonths;
    var auth = getAuthCookie();
    var loadingState = true;
    var ip = {
        ip: '',
        used: false,
        history: []
    };
    function getMonthInfo(id){
        loadingState = true;
        $http({
            method: 'POST',
            url: '/model/ankets/',
            data: {idMonth: id, auth: auth}
        }).then(function(data){
            currentMonth = data.data.month;
            ankets = data.data.ankets;
            ip = data.data.ip;
            loadingState = false;
        });
    }
    function getAvailableMonths(callback){
        $http({
            method: 'POST',
            url: '/model/months/',
            data: {auth: auth}
        }).then(function(data){
            availableMonths = data.data;
            if(callback)callback(availableMonths);
        })
    }
    function getResumeHistory(id){
        $http({
            method: 'POST',
            url: '/model/history/',
            data: {idResume: id, auth: auth}
        }).then(function(data){
            ankets.forEach(function(a){
               if (a._resume._id == id){
                   a.history = data.data;
               }
            });
        })
    }
    function setStatus(resume, status, callback){
        $http({
            method: 'POST',
            url: '/model/set-status/',
            data: {idResume: resume, month: currentMonth._id, status: status, auth: auth}
        }).then(function(data){
            if(!data.data.hardUpdate) {
                ankets.forEach(function (a) {
                    if (a._resume._id == resume) {
                        a.status = status;
                    }
                });
            }else{
                reloadMonth();
            }
            if (callback)callback(data.data.hardUpdate);
        })
    }
    function indexMonth(){
        if( availableMonths && currentMonth ) {
            return availableMonths.findIndex(function (m) {
                    return m._id === currentMonth._id
                });
        }
        return -1;
    }
    function isLastMonth(){
        return indexMonth() === 0;
    }
    function isFirstMonth(){
        return availableMonths && indexMonth() === availableMonths.length - 1;
    }
    function nextMonth(){
        var next = availableMonths[indexMonth() - 1];
        if (next){
            getMonthInfo(next._id);
        }
    }
    function prevMonth(){
        var prev = availableMonths[indexMonth() + 1];
        if (prev){
            getMonthInfo(prev._id)
        }
    }
    function getIP(){
        return ip.ip;
    }
    function usedIP(){
        return ip.used;
    }
    function updateResume(resume, callback){
        $http({
            method: 'POST',
            url: '/model/update/',
            data: {resume: resume, month: currentMonth._id, auth: auth}
        }).then(function(data){
            if(data.data.resume){
                ankets.forEach(function(a){
                    if (a._resume._id == resume._id){
                        for(var k in data.data.resume){
                            a._resume[k] = data.data.resume[k];
                        }
                    }
                });
            }else{
                reloadMonth();
            }
            if(data.data.msg){
                console.error(data.data.msg);
            }
            if(callback)callback();
        })
    }
    function updateMonth(month, callback){
        $http({
            method: 'POST',
            url: '/model/update-month/',
            data: {month: month, auth: auth}
        }).then(function(data){
            getAvailableMonths();
            getMonthInfo(month._id);
            if(data.data.msg){
                console.error(data.data.msg);
            }
            if(callback)callback();
        })
    }
    function reloadMonth(){
        getMonthInfo(currentMonth._id);
    }
    function newMonth(month, year){
        $http({
            method: 'POST',
            url: '/model/add-month/',
            data: {month: month, year: year, auth: auth}
        }).then(function(data){
            if(data.data.status) {
                getMonthInfo(data.data.month._id);
                getAvailableMonths();
            }else{
                console.error(data.data.msg);
            }
        })
    }
    function uploadFile(file){
        var fd = new FormData();
        fd.append('file', file);
        fd.append('month', currentMonth._id);
        fd.append('auth', auth);
        $http({
            url: '/excel/import/',
            method: "POST",
            data: fd,
            headers: {'Content-Type': undefined}
        }).success(function (response) {
            if(response.status){
                reloadMonth();
                console.log('reloaded')
            }else{
                alert(response.message);
            }
        });
    }
    getAvailableMonths(function(m){
        if(m.length){
            getMonthInfo(m[0]._id);
        }
    });
    function getIpHistory(){
        $http({
            method: 'POST',
            url: '/model/ip-history/',
            data: {auth: auth}
        }).then(function(data){
            if(data.data.status) {
                ip.history = data.data.history;
            }
        })
    }
    return {
        getMonth: function(){return currentMonth},
        getAnkets: function(){return ankets},
        getAvailableMonths: function(){return availableMonths},
        getLoading: function(){return loadingState},
        getIpInfo: function(){return ip},
        reloadMonth: reloadMonth,
        getResumeHistory: getResumeHistory,
        setMonth: getMonthInfo,
        isFirstMonth: isFirstMonth,
        isLastMonth: isLastMonth,
        nextMonth: nextMonth,
        prevMonth: prevMonth,
        setStatus: setStatus,
        updateMonth: updateMonth,
        updateResume: updateResume,
        updateIpHistory: getIpHistory,        
        uploadFile: uploadFile,
        newMonth: newMonth,
        getIP: getIP,
        usedIP: usedIP
    }
});
// press enter
Ankets.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter || attrs.ngClick, {$event:event});
                });
                event.preventDefault();
            }
        });
    };
});
Ankets.directive('selectAll', function() {
    return function (scope, element, attrs) {
        element.bind('click', function (event) {
            if(!scope.modal.editable) {
                element[0].select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                }
            }
        });
    };
});
Ankets.directive('actionOnChange', function() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs['actionOnChange']);
            element.bind('change', onChangeHandler);
        }
    };
});
// auto scroll
Ankets.directive('showTail', function () {
    return function (scope, elem, attr) {
        scope.$watch(function () {
                return elem[0].value;
            },
            function (e) {
                elem[0].scrollTop = elem[0].scrollHeight;
            });
    }
});
Ankets.filter('newline', function() {
    return function(text) {
        return text.replace(/\n/g, '<br>');
    };
});
String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(new RegExp('{}', 'g'), function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};
function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function getAuthCookie(){
    var cookie = getCookie('ankAuth');
    if(!cookie){
        cookie = prompt('Anket Auth Password:');
        document.cookie = "ankAuth="+cookie;
    }
    return cookie;
}