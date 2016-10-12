module.exports = function EventBus() 
{
	'use strict';
	
	 var topics = {};
	 var subUid = -1;
	 
	 return {
		trigger: trigger
		, on: on
		, off: off
	 };
	 
	 function trigger(topic, args) {
		 if (!topics[topic]) 
			 return;
		 var subscribers = topics[topic];
		 var len = subscribers ? subscribers.length : 0;
         while (len--) 
        	 subscribers[len].func(args);
	 }
	 
	 function on(topic, func) {
		 if(!topics[topic])
			 topics[topic] = [];
		 var token = (++subUid).toString();
		 topics[topic].push({
            token: token,
            func: func
	     });
		 return token;
	 }
	 
	 function off(eventOrToken) {
		 var bucket = topics[eventOrToken];
		 if(bucket) {
			bucket = [];
			return;
		 }
		 for (var m in topics) {
			 if (topics[m]) {
				 for (var i = 0, len = topics[m].length; i < len; i++) {
					 if (topics[m][i].token === eventOrToken) {
						 topics[m].splice(i, 1);
	                     return;
	                 }
	             }
	         }
	     }	 
	 }
};
 