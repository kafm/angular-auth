var authSession = require('authSession');
var authServive = require('authService');

angular
	.module('angular-auth', [authSessionFactory, authServive]);