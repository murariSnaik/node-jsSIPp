'use strict';
var JsSIP = require('jssip-for-node');
var Socket = require('ws')
  , connections = {};

var cnt;
var glbInterval;
var uriIP = 'XX.XX.XX.XX'; // Kindly change this appropriately
var uriPort = 'XXXX';
var clHold = 10000;
var caller;
var reciever;


// Get the session document that is used to generate the data.
//
var session = require(process.argv[2]);

//
// WebSocket connection details.
//
var masked = process.argv[4] === 'true'
  , binary = process.argv[5] === 'true'
  , protocol = +process.argv[3] || 13;



process.on('message', function message(task) {
  	var now = Date.now();

	//console.log(task.url+'  *****   '+task.messages+'  &&&&&&&&  '+task.id+'  ^^^^^^^ '+task.caller+'   %%%%    '+task.callee);
	caller = task.caller;
	reciever = task.callee;
	var configuration = {
		  'ws_servers': 'ws://'+uriIP+':'+uriPort,
		  'uri': 'sip:'+caller+'@'+uriIP+':'+uriPort,
		  'password': ''
		};
		
	var configuration1 = {
		  'ws_servers': 'ws://'+uriIP+':'+uriPort,
		  'uri': 'sip:'+reciever+'@'+uriIP+':'+uriPort,
		  'password': ''
		};

  	//
  	// Write a new message to the socket. The message should have a size of x
  	//
  	if ('write' in task) {
    		Object.keys(connections).forEach(function write(id) {
		      write(connections[id], task, id);
    		});
  	}
  

	var coolPhone = new JsSIP.UA(configuration);
    var coolPhone1 = new JsSIP.UA(configuration1);

	// Register callbacks to desired call events
	var eventHandlers = {
	  'progress':   function(e){ console.log('Progress');/* Your code here */ },
	  'failed':     function(e){ console.log("inside event failed     "+e.data.cause+"   "+e.data.originator+"   "+e.data.message);},
	  'started':    function(e){
		//alert ("inside event started ");
		var rtcSession = e.sender;
		console.log('Started   '+e.sender+"    "+rtcSession.direction);
		//alert("      "+rtcSession.direction);		    
	  },
	  'ended':      function(e){ console.log('Ended');/* Your code here */ }
	};
	
	var eventHandlers1 = {
	  'progress':   function(e){ console.log('Progress1');/* Your code here */ },
	  'failed':     function(e){ console.log("inside event failed1     "+e.data.cause+"   "+e.data.originator+"   "+e.data.message);},
	  'started':    function(e){
		//alert ("inside event started1 ");
		console.log('Started 1  '+e.sender+"   1   "+rtcSession.direction);
		var rtcSession = e.sender;
		//alert("   1   "+rtcSession.direction);
		/*
		// Attach local stream to selfView
		if (rtcSession.getLocalStreams().length > 0) {
		  selfView.src = JsSIP.global.URL.createObjectURL(rtcSession.getLocalStreams()[0]);
		}
	
		// Attach remote stream to remoteView
		if (rtcSession.getRemoteStreams().length > 0) {
		  remoteView.src = JsSIP.global.URL.createObjectURL(rtcSession.getRemoteStreams()[0]);
		}*/
	  },
	  'ended':      function(e){ console.log('Ended1');/* Your code here */ }
	};
	
	var options = {
	  'eventHandlers': eventHandlers,
	  'mediaConstraints': {'audio': true, 'video': false}
	};
	var options1 = {
	  'eventHandlers': eventHandlers1,
	  'mediaConstraints': {'audio': true, 'video': false}
	};

	
	coolPhone.start();
	coolPhone1.start();

	process.send({ type: 'open', duration: Date.now() - now, id: task.id });

	setTimeout(function(){coolPhone.unregister(options);}, clHold);
	setTimeout(function(){coolPhone.stop();}, clHold);
	setTimeout(function(){coolPhone1.unregister(options1);}, clHold);
	setTimeout(function(){coolPhone1.stop();}, clHold);     
	setTimeout(function(){process.send({type: 'close', id: task.id,read: 0,send: 0});}, clHold);


	if (task.shutdown) {
    		Object.keys(connections).forEach(function shutdown(id) {
      			connections[id].close();
    		});
  	}

  	// End of the line, we are gonna start generating new connections.
  	if (!task.url) return;

});
