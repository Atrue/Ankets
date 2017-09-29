Ankets.controller('SendController', function($scope, $window, $uibModal, ARequester) {
    $scope.model = {};
    $scope.model.stats = {
        success: 0,
        empty: 0,
        unchecked: 0,
        unregistered: 0,
        error: 0,
        all: 0
    };
    $scope.model.getMonth = ARequester.getMonth;
    $scope.model.getAnkets = function(){
        function orderFilter(ank){
            if($scope.model.orderType === 2){
                return ank.status == 1 || ank.status == 0;
            }else if($scope.model.orderType === 3){
                return ank._id === $scope.model.randAnket;
            }
        }
        function searchFilter(ank){
            return ank._resume.firstName.indexOf($scope.model.searchPhrase) !== -1 ||
                ank._resume.lastName.indexOf($scope.model.searchPhrase) !== -1 ||
                ank._resume.email.indexOf($scope.model.searchPhrase) !== -1;
        }
        if ($scope.model.orderType === 1 && !$scope.model.searchPhrase){
            return ARequester.getAnkets();
        }else if($scope.model.orderType !== 1 && !$scope.model.searchPhrase) {
            return ARequester.getAnkets().filter(orderFilter);
        }else if($scope.model.orderType === 1 && $scope.model.searchPhrase) {
            return ARequester.getAnkets().filter(searchFilter);
        }else{
            return ARequester.getAnkets().filter(function(ank){
                return searchFilter(ank) && orderFilter(ank);
            });
        }
    };
    $scope.isLastMonth = ARequester.isLastMonth;
    $scope.isFirstMonth = ARequester.isFirstMonth;
    $scope.model.getAvailableMonths = ARequester.getAvailableMonths;
    $scope.setMonth = ARequester.setMonth;
    $scope.nextMonth = ARequester.nextMonth;
    $scope.prevMonth = ARequester.prevMonth;
    $scope.Math = Math;
    $scope.model.orderType = 1;
    $scope.model.searchPhrase = '';
    $scope.options = {
        minDate: new Date(2016, 8, 15),
        maxDate: new Date(2016, 9, 15),
        startingDay: 1,
        showWeeks: false
    };
    $scope.$watch(
        function(){return ARequester.getIP()},
        function (n, o) {
            $scope.model.ip = n;
        }
    );
    $scope.$watch(
        function(){return ARequester.usedIP()},
        function (n, o) {
            $scope.model.usedIP = n;
        }
    );
    $scope.$watch(
        function(){return ARequester.getMonth()},
        function (n, o) {
            if(n) {
                $scope.options.minDate = new Date(n.startDate);
                $scope.options.maxDate = new Date(n.endDate);
                $scope.model.lostDays = Math.floor(($scope.options.maxDate - new Date())/(1000 * 3600 * 24))
            }
        }
    );
    function rebuildStats(ankets){
        $scope.model.stats.success = 0;
        $scope.model.stats.empty = 0;
        $scope.model.stats.unchecked = 0;
        $scope.model.stats.unregistered = 0;
        $scope.model.stats.error = 0;
        $scope.model.stats.all = ankets.length;
        ankets.forEach(function(object){
            if(object.status === 0)$scope.model.stats.unregistered++;
            else if(object.status === 1)$scope.model.stats.unchecked++;
            else if(object.status === 2)$scope.model.stats.empty++;
            else if(object.status === 3)$scope.model.stats.success++;
            else $scope.model.stats.error++;
        });
    }
    $scope.$watch(
        function(){return ARequester.getAnkets()},
        function (n, o) {
            if(n) {
                rebuildStats(n);
            }
        }
    );
    $scope.textAnket = function(count){
        switch(count.toString().slice(-1)){
            case '1': return 'анкета';
            case '2': return 'анкеты';
            case '3': return 'анкеты';
            case '4': return 'анкеты';
            default: return 'анкет'
        }
    };
    $scope.textDays = function(count){
        switch(count.toString().slice(-1)){
            case '1': return 'день';
            case '2': return 'дня';
            case '3': return 'дня';
            case '4': return 'дня';
            default: return 'дней'
        }
    };
    $scope.genRand = function(){
        var emptyOnly = ARequester.getAnkets().filter(function(a){return a.status === 0 || a.status===1});
        $scope.model.randAnket = emptyOnly.length?emptyOnly[Math.floor(Math.random() * emptyOnly.length)]._id:null;
    };
    $scope.openAnket = function(ank){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modalForm.html',
            controller: 'FormModal',
            scope: $scope,
            size: 'lg',
            resolve: {
                ank: function () {
                    return ank;
                }
            }
        });
        modalInstance.result.then(function (status) {
            if(!status) {
                rebuildStats(ARequester.getAnkets());
            }
        });
    };
});
Ankets.controller('FormModal', function ($scope, $uibModalInstance, $window, ARequester,ank) {
    $scope.modal = {};
    $scope.modal.ank = ank;
    $scope.modal.editable = false;
    
    if (!ank.history){
        ARequester.getResumeHistory(ank._resume._id);
    }

    $scope.modal.getName = function(){
        return ank._resume.firstName.split(' ')[0] + ' ' + ank._resume.lastName;
    };
    $scope.modal.prettyAge = function(d){
        var date = d != '0000-00-00'?new Date(d):new Date(0);
        var ages =  (new Date()).getFullYear() - date.getFullYear();
        switch(ages.toString().slice(-1)){
            case '1': return ages + ' год';
            case '2': return ages + ' года';
            case '3': return ages + ' года';
            case '4': return ages + ' года';
            default: return ages + ' лет'
        }
    };
    $scope.modal.toMail = function(ank){
        $window.open('/auth/log/'+ank._resume._id + '/');
    };
    $scope.modal.setStatus = function(status){
        ARequester.setStatus(ank._resume._id, status, function(status){
            $uibModalInstance.close(status);
        })
    };
    $scope.modal.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.modal.editForm = function(){
        if($scope.modal.editable){
            ARequester.updateResume(ank._resume);
        }
        $scope.modal.editable = !$scope.modal.editable;
    }
});