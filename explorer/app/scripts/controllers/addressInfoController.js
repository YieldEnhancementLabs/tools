angular.module('ethExplorer')
    .controller('addressInfoCtrl', function ($rootScope, $scope, $location, $routeParams, $q) {

      var web3 = $rootScope.web3;
	
      $scope.init=function(){

        $scope.addressId=$routeParams.addressId;

        if($scope.addressId!==undefined) {
          $scope.isProgress = null;
          getAddressInfos().then(function(result){
            $scope.balance = result.balance;
            $scope.balanceInEther = result.balanceInEther;
          });
          getAddressTransactions($scope.addressId);
        }


        function getAddressInfos(){
          var deferred = $q.defer();

          web3.eth.getBalance($scope.addressId,function(error, result) {
            if(!error) {
                deferred.resolve({
                  balance: result,
                  balanceInEther: web3.fromWei(result, 'ether')
                });
            } else {
                deferred.reject(error);
            }
          });
          return deferred.promise;
        }

        function getAddressTransactions(addressId) {
            if (!addressId.startsWith('0x')){
                addressId = '0x'+ addressId;
            }
            $scope.isProgress = true;
            $scope.transactions = [];
            const transactions = [];
            var lastBlock = parseInt(web3.eth.blockNumber, 10);
            for (let currBlock = lastBlock-100; currBlock <= lastBlock; ++currBlock) {

                web3.eth.getBlockTransactionCount(currBlock, function(error, result) {
                    let txCount = result;
                    for (let blockIdx = 0; blockIdx < txCount; blockIdx++) {
                        web3.eth.getTransactionFromBlock(currBlock, blockIdx, function(error, result) {
//                            console.log(currBlock, result ? result.from : result);
                            if (result != null && (String(result.from) === String(addressId) || String(result.to) === String(addressId))) {
                                var transaction = {
                                  id: result.hash,
                                  hash: result.hash,
                                  from: result.from,
                                  to: result.to,
                                  gas: result.gas,
                                  input: result.input,
                                  value: result.value
                                }
                                transactions.push(transaction);

                                if (transactions.length % 10 === 0){
                                    $scope.$apply(function() {
                                        $scope.transactions = transactions;
                                    });
                                }
                            }
                            if (currBlock === lastBlock && blockIdx === txCount-1) {
                                $scope.$apply(function() {
                                    $scope.transactions = transactions;
                                    $scope.isProgress = false;
                                })
//                                console.log('================================END!==================================');
                            }
                        })
                    }
                })
            }
        }

      };
      
      $scope.init();

    });
