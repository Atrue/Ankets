Ankets.controller('HeaderController', function($scope, $window, $location, $uibModal, ARequester) {
    $scope.header = {};
    $scope.header.current = function(){
        return $location.path();
    };
    $scope.$watch(
        function(){return ARequester.getIP()},
        function (n, o) {
            $scope.header.ip = n;
        }
    );
    $scope.$watch(
        function(){return ARequester.usedIP()},
        function (n, o) {
            $scope.header.usedIP = n;
        }
    );
    $scope.$watch(
        function(){return ARequester.getLoading()},
        function (n, o) {
            $scope.header.loading = n;
        }
    );
    $scope.openIP = function(ank){
        $uibModal.open({
            animation: true,
            templateUrl: 'headerForm.html',
            controller: 'headerModal',
            scope: $scope,
            size: 'lg',
        });
    };
});
Ankets.controller('headerModal', function ($scope, $uibModalInstance, $window, ARequester) {
    $scope.modal = {};
    $scope.modal.ipinfo = ARequester.getIpInfo;

    ARequester.updateIpHistory();
    
    $scope.modal.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});