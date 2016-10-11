var authSession = require('./authSession');
var authService = require('./authService');

angular
	.module('angular-authflow', [authSession, authService]);