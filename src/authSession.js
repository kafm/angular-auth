module.exports = 'authSession';

var EventBus = require("./eventBus");

(function() {
	
	'use strict';
	
	angular
	.module("authSession", [])
	.factory("AuthSession", AuthSession);	   

	function AuthSession() {
		var _session, authenticated;
		var storageKey = "auth_session";
		var localStorageSupport = (typeof(Storage) !== "undefined");
		var eventBus = new EventBus();
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
			if(localStorageSupport) {
				var item = localStorage.getItem(storageKey);
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
		}
		
		function config(conf) {
			_config = config;
		}
		
		function create(session) {
			_session = session;
			authenticated = true;
			if(localStorageSupport) {
				localStorage.setItem(storageKey, 
						base64.encode(JSON.stringify(session)));
			}
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
			if(localStorageSupport) {
				localStorage.removeItem(storageKey);
			}
			setTimeout(function() {
				_session = undefined;
				authenticated = false;	
				eventBus.trigger(triggers.destroy, _session);
				eventBus.trigger(triggers.change, authenticated);
			});
		}
	}
	
	
})();







