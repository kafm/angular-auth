require('angular');

var authModule = require('../src/authModule');

angular
.module('angular-demo', ["angular-authflow"])
.run(Configuration);

Configuration.$inject = ["AuthService"];

function Configuration(AuthService) {
	console.log("Entrei");
	AuthService.config({
		requestUrl: "http://127.0.0.1:8080/authenticate"
		, resetPassRequestUrl: "http://127.0.0.1:8080/reset_password"
		, changePassRequestUrl:"http://127.0.0.1:8080/change_password"
		, roleAttr: "permissions"
	});
	
	AuthService.authenticate({userName: "su", password: "Password"});
	AuthService.on(AuthService.triggers.loginSuccess, function(data) {
		 console.log("LOGGED in") 
	});
	console.log("HERE")	
}

angular.element(document).ready(function() {
	  angular.bootstrap(document, ['angular-demo']);
	});