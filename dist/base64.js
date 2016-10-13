var base64 = (function()
{
	'use strict';
	
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	return {
		encode: encode
		, decode: decode
	};
	
	function encode(str)
	{
		if(window.btoa)
			return  window.btoa(_utf8Encode(str));
		return _encode(_utf8Encode(str));
	}
	
	function decode(str)
	{
		if(window.atob)
			return _utf8Decode(window.atob(str));
		return _utf8Decode(_decode(str));
	}
	
	function _encode(input)
	{
		var output = "";
	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	    var i = 0;	    
	    while (i < input.length) 
	    {
	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);

	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;

	        if (isNaN(chr2)) 
	            enc3 = enc4 = 64;
	         else if (isNaN(chr3)) 
	            enc4 = 64;

	        output = output +
	        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	    }
	    return output;		
	}
	
	function _decode(input)
	{
	    var output = "";
	    var chr1, chr2, chr3;
	    var enc1, enc2, enc3, enc4;
	    var i = 0;
	    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	    while (i < input.length) 
	    {
	        enc1 = this._keyStr.indexOf(input.charAt(i++));
	        enc2 = this._keyStr.indexOf(input.charAt(i++));
	        enc3 = this._keyStr.indexOf(input.charAt(i++));
	        enc4 = this._keyStr.indexOf(input.charAt(i++));

	        chr1 = (enc1 << 2) | (enc2 >> 4);
	        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	        chr3 = ((enc3 & 3) << 6) | enc4;

	        output = output + String.fromCharCode(chr1);

	        if (enc3 != 64) 
	            output = output + String.fromCharCode(chr2);
	        if (enc4 != 64) 
	            output = output + String.fromCharCode(chr3);
	    }
	    return output;		
	}
	
	function _utf8Encode(str)
	{
		return escape(encodeURIComponent(str));
	}
	
	function _utf8Decode(str)
	{
		return decodeURIComponent(unescape(str));
	}
})();