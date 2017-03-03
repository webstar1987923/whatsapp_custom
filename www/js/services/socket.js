app.factory('socket',function(socketFactory){
	//Create socket and connect to http://chat.socket.io 
   //var socket = io.connect('http://192.168.1.118:3001/');
    var socket = io.connect('http://162.243.225.225:3002');
   
  	mySocket = socketFactory({
    	ioSocket: socket
  	})
	return mySocket;
})