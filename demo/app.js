require('angular');

var authModule = require('../src/authModule');

angular
.module('angular-demo', ["angular-authflow"])
.run(Configuration);

Configuration.$inject = ["AuthService"];

function Configuration(AuthService) {
	AuthService.config({
		requestUrl: "http://127.0.0.1:8000/api/v1/authenticate"
		, resetPassRequestUrl: "http://127.0.0.1:8000/api/v1/reset_password"
		, changePassRequestUrl:"http://127.0.0.1:8000/api/v1/change_password"
		, userInfoUrl: "http://127.0.0.1:8000/api/v1/user-info"
		, roleAttr: "permissions"
		, tokenAttr: "id_token"
	});
	
	AuthService.authenticate({userName: "su", password: "Password"});
	AuthService.on(AuthService.triggers.loginSuccess, function(data) {
		 console.log(data) 
	});
}

angular.element(document).ready(function() {
	  angular.bootstrap(document, ['angular-demo']);
	});