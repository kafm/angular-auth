var ng = require('angular');

var authModule = require('../src/authModule');


angular
.module('angular-demo', [authModule])
.controller('Test', ['authSession', function(authSession){
	console.log(authSession);
}]);
