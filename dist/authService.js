module.exports = 'authService';

var EventBus = require("./eventBus");

(function() {
	
	'use strict';

	angular
	.module("authService", [ "authSession" ])
	.config(AuthConfig)
   	.factory("AuthService", AuthService);

	AuthConfig.$inject = ["$httpProvider"];
	AuthService.$inject = ["$http", "$q", "AuthSession"];


	var eventBus = new EventBus();
	
	var triggers = {
			forbidden: "forbidden"
			, loginSuccess: "login-sucess"
			, loginFailed: "login-failed"
			, changePasswordSuccess: "change-password-success"
			, changePasswordFailed: "change-password-failed"
			, resetPasswordSuccess: "reset-password-success"
			, resetPasswordFailed: "reset-password-failed"
	};
	/*401 Unauthorized — The user is not logged in
	  419 Authentication Timeout (non standard) — Session has expired
	  440 Login Timeout (Microsoft only)*/
	var _config = {
			tokenHeader: "Authorization"
			, tokenAttr: "token"
			, roleAttr: "role"
			, requestUrl: undefined
			, requestMethod: "POST"
			, changePassRequestUrl: undefined
			, changePassRequestMethod: "POST"
			, resetPassRequestUrl: undefined
			, resetPassRequestMethod: "POST"
			, userInfoUrl: undefined
			, userInfoMethod: "GET"
			, authInfoParser: undefined		
			, unauthorizedStatuses: [401, 419, 440] 
			, forbiddenStatuses: [403] 
	};

	function AuthService($http, $q, AuthSession) {
		
		return {
			triggers: triggers
			, config: config
			, authenticate: authenticate
			, authenticateByToken: authenticateByToken
			, changePassword: changePassword
			, resetPassword: resetPassword
			, isAuthenticated: isAuthenticated
			, isAuthorized: isAuthorized
			, on: eventBus.on
			, off: eventBus.off
		};
		
		function transformToGetRequest(requestUrl, obj) {
			var url = requestUrl;
			var first = true;	
			angular.forEach(obj, function(value, key) {
				var prefix = "&";
				if(first)
				{
					prefix = "?"
					first = false;
				}
				url += prefix+key+"="+value;
			});
			return url;
		}
				
		function config(conf) {
			angular.extend(_config, conf);
			return this;
		}
		
		function authenticate(credentials) {
			var url = _config.requestUrl;
			var method = (_config.requestMethod)? _config.requestMethod.toLowerCase() : "post";
			if(method == "get") {
				url = transformToGetRequest(url, credentials);
				$http.get(url) 
				   	.then(resolveAuthSuccess)
				    .catch(resolveAuthFailure);
			}
			else {
				$http[method](url, credentials) 
				   	.then(resolveAuthSuccess)
				    .catch(resolveAuthFailure);
			}
			return this;
		}

		function authenticateByToken(token) {
			if(token) {
				var res = { data: {} };
				res.data[_config.tokenAttr] = token;
				resolveAuthSuccess(res);
			}
		}
		
		function changePassword(details) {
			var url = _config.changePassRequestUrl;
			var method = (_config.changePassRequestMethod)? 
					_config.changePassRequestMethod.toLowerCase() : "post";
			if(method == "get") {
				url = transformToGetRequest(url, details);
				$http.get(url) 
				   	.then(resolveChangePasswordSuccess)
				    .catch(resolveChangePasswordFailure);
			}
			else {
				$http[method](url, details) 
				   	.then(resolveChangePasswordSuccess)
				    .catch(resolveChangePasswordFailure);
			}
			return this;
		}
		
		function resetPassword(details) {
			var url = _config.resetPassRequestUrl;
			var method = (_config.resetPassRequestMethod)? 
					_config.resetPassRequestMethod.toLowerCase() : "post";
			if(method == "get") {
				url = transformToGetRequest(url, details);
				$http.get(url) 
				   	.then(resolveResetPasswordSuccess)
				    .catch(resolveResetPasswordFailure);
			}
			else {
				$http[method](url, details) 
			   	.then(resolveResetPasswordSuccess)
			    .catch(resolveResetPasswordFailure);
			}
			return this;
		}
		
		function isAuthenticated() {
			return AuthSession.isAuthenticated();
		}
		
		function isAuthorized(roles) {
			if(!angular.isArray(roles)) 
				roles = [roles];
			if(roles.indexOf("*") === -1)
				return (AuthSession.isAuthenticated() &&
			      roles.indexOf(getRole()) !== -1);
			return AuthSession.isAuthenticated();
		}
		
		function getRole() {
			var roleAttr = _config.roleAttr;
			if(!roleAttr) return "*";
			var roleParts = roleAttr.split(".");
			var role = AuthSession.get();
			angular.forEach(roleParts, function(part) {
				role = role[part];
			});
			return role;
		}
		
		function resolveAuthSuccess(res) {
			var session = res.data;
			if(_config.userInfoUrl) {
				var authHeader = {};
				authHeader[_config.tokenHeader] = session[_config.tokenAttr];
				$http({
 					method: _config.userInfoMethod,
 					url: _config.userInfoUrl,
 					headers: authHeader})
			   	.then(function(res) {
					resolveSession(angular.merge(session, res.data));
				})
				.catch(resolveAuthFailure);
			    //.catch(resolveResetPasswordFailure);
			} else {
				resolveSession(session);
			}
		}

		function resolveSession(session) {
			if(_config.authInfoParser) {
				session = _config.authInfoParser(session);
			}
			AuthSession.create(session);
			eventBus.trigger(triggers.loginSuccess, session);			
		}
		
		function resolveAuthFailure(res) {
			eventBus.trigger(triggers.loginFailed, res.data);
		}
		
		function resolveChangePasswordSuccess(res) {
			eventBus.trigger(triggers.changePasswordSuccess, res.data);
		}
		
		function resolveChangePasswordFailure(res) {
			eventBus.trigger(triggers.changePasswordFailed, res.data);
		}
		
		function resolveResetPasswordSuccess(res) {
			eventBus.trigger(triggers.resetPasswordSuccess, res.data);		
		}
		
		function resolveResetPasswordFailure(res) {
			eventBus.trigger(triggers.resetPasswordFailed, res.data);
		}
	}

	function AuthConfig($httpProvider) {
		$httpProvider.interceptors.push(function($q, AuthSession) {
			return {
					request: function(env) {
						env.headers = env.headers || {};
						var session = AuthSession.get();
						if(session && _config.tokenHeader && _config.tokenAttr) {
							var token = session[_config.tokenAttr];
							if(token)
								env.headers[_config.tokenHeader] = token;
						}
						return env || $q.when(env);					
					}
					, responseError: function(rejection) {
						if(rejection && rejection.status) {
							if (_config.unauthorizedStatuses.indexOf(rejection.status) >= 0)
								AuthSession.destroy();
							else if(_config.forbiddenStatuses.indexOf(rejection.status) >= 0)
								eventBus.trigger(triggers.forbidden, rejection);	
						}
						return $q.reject(rejection);
					}
			};			
		});			
	}
	
})();
	
