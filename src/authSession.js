module.exports = 'authSession';

var EventBus = require("./eventBus");

var base64 = require("./base64");

(function() {
	
	'use strict';
	
	angular
	.module("authSession", [])
	.factory("AuthSession", AuthSession);	   

	function AuthSession() {
		var _session, authenticated;
		var storageKey = "auth_session";
		var eventBus = new EventBus();
		var defaultExpireDate = "Fri, 31 Dec 9999 23:59:59 GMT";
		var deleteExpireDate = "Thu, 01 Jan 1970 00:00:00 UTC";
		var triggers = {
				destroy: "destroy"
				, create: "create"
				, change: "change"
				};
		
		init();
				
		return {
			triggers: triggers
			, isAuthenticated: isAuthenticated
			, create: create
			, get: get
			, destroy: destroy
			, on: eventBus.on
			, off: eventBus.off
		};
		
		function init() {
			var item = getCookie(storageKey);
			if(item) {
				try {
					_session = JSON.parse(base64.decode(item));	
					authenticated = true;						
				} catch(e) {
					if(console.error) {
						console.error("Error occurred when trying to parse json.",e);
					}
				}
			}	
		}
		
		function config(conf) {
			_config = config;
		}
		
		function create(session) {
			_session = session;
			authenticated = true;
			setCookie(storageKey, 
				base64.encode(JSON.stringify(session)));
			eventBus.trigger(triggers.create, _session);
			eventBus.trigger(triggers.change, authenticated);
		}
		
		function get() {
			return _session;
		}
		
		function isAuthenticated() {
			return authenticated;
		}
		
		function destroy() {
			removeCookie(storageKey);
			setTimeout(function() {
				_session = undefined;
				authenticated = false;	
				eventBus.trigger(triggers.destroy, _session);
				eventBus.trigger(triggers.change, authenticated);
			});
		}

		function getCookie(cname) {
			if(!document.cookie) return;
			var name = cname + "=";
			var decodedCookie = decodeURIComponent(document.cookie);
			var ca = decodedCookie.split(';');
			for(var i = 0; i <ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}

		function setCookie(cname, value) {
			document.cookie = cname+"="+value+"; expires="+defaultExpireDate+"; path=/;";
		}

		function removeCookie(cname) {
			document.cookie = cname+"=; expires="+deleteExpireDate+"; path=/;";
		}
	}
	
	
})();







