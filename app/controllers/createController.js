Ankets.controller('CreateController', function($scope, $window, $uibModal, ARequester) {
    $scope.model = {};
    $scope.model.stats = {
        success: 0,
        empty: 0,
        unchecked: 0,
        unregistered: 0,
        error: 0,
        all: 0
    };
    $scope.model.newmonth = {
        date: null,
        opened: false,
        options: {
            minMode: 'month'
        }
    };
    $scope.model.getMonth = ARequester.getMonth;
    $scope.model.getAnkets = function(){
        function orderFilter(ank){
            if ($scope.model.orderType === 2) {
                return ank.status === 0;
            } else if ($scope.model.orderType === 3){
                return ank.status === -1;
            }
        }
        function searchFilter(ank){
            return ank._resume.firstName.indexOf($scope.model.searchPhrase) !== -1 ||
                ank._resume.lastName.indexOf($scope.model.searchPhrase) !== -1 ||
                ank._resume.email.indexOf($scope.model.searchPhrase) !== -1 ||
                ank._resume.VIN.indexOf($scope.model.searchPhrase) !== -1;
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
    $scope.$watch(
        function(){return ARequester.getAnkets()},
        function (n, o) {
            if(n) {
                $scope.model.stats.success = 0;
                $scope.model.stats.empty = 0;
                $scope.model.stats.unchecked = 0;
                $scope.model.stats.unregistered = 0;
                $scope.model.stats.error = 0;
                $scope.model.stats.all = n.length;
                n.forEach(function(object){
                    if(object.status === 0)$scope.model.stats.unregistered++;
                    else if(object.status === 1)$scope.model.stats.unchecked++;
                    else if(object.status === 2)$scope.model.stats.empty++;
                    else if(object.status === 3)$scope.model.stats.success++;
                    else $scope.model.stats.error++;
                });
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
    $scope.openAnket = function(ank){
        $uibModal.open({
            animation: true,
            templateUrl: 'modalEditForm.html',
            controller: 'FormEditModal',
            scope: $scope,
            size: 'lg',
            resolve: {
                ank: function () {
                    return ank;
                }
            }
        });
    };
    $scope.openMonth = function(){
        $scope.model.newmonth.opened = true;
    };
    $scope.getMonth = function(date){
        return date.toLocaleString('ru-RU', { month: "long", year: "numeric" });
    };
    $scope.editMonth = function(){
        $uibModal.open({
            animation: true,
            templateUrl: 'MonthEditForm.html',
            controller: 'MonthEditModal',
            scope: $scope,
            size: 'sm',
            resolve: {
                month: function () {
                    return ARequester.getMonth();
                }
            }
        });
    };
    $scope.createMonth = function(){
        ARequester.newMonth($scope.model.newmonth.date.getMonth(), $scope.model.newmonth.date.getFullYear());
    };
    $scope.openFile = function(){
        document.getElementById('loadFile').click()
    };
    $scope.uploadFile = function(event){
        var file = event.target.files[0]; 
        ARequester.uploadFile(file);
        event.target.value = "";
    };
    $scope.saveFile = function(){
        document.getElementById('saveFile').click()
    };
    $scope.downloadFile = function(event){
        document.getElementById('exportForm').submit();
        event.target.value = "";
    }

});
Ankets.controller('FormEditModal', function ($scope, $uibModalInstance, $window, ARequester,ank) {
    $scope.modal = {};
    $scope.modal.ank = ank;
    ank._resume.age = new Date(ank._resume.age);

    if (!ank.history){
        ARequester.getResumeHistory(ank._resume._id);
    }

    $scope.modal.getName = function(){
        return ank._resume.firstName.split(' ')[0] + ' ' + ank._resume.lastName;
    };
    $scope.modal.toMail = function(mail){
        $window.open(ARequester.getProxy() + '/auth/reg/'+mail+'/?id='+ank._resume._id);
    };
    $scope.modal.save = function(){
        ARequester.updateResume(ank._resume, function(){
            $uibModalInstance.close();
        });
    };
    $scope.modal.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
Ankets.controller('MonthEditModal', function ($scope, $uibModalInstance, $window, ARequester, month) {
    $scope.modal = {};
    $scope.modal.month = month;

    $scope.modal.save = function(){
        ARequester.updateMonth(month, function(){
            $uibModalInstance.close();
        });
    };
    $scope.modal.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});