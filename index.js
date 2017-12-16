var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var activeLeads={};
var activeAdmin={};

io.on('connection', function(socket){
  /*
  onconnect
  */
	if(socket.handshake.query.userType){
    if(socket.handshake.query.userType=="user"){
        activeLeads[socket.handshake.query.sessionId]={
          socket:socket,
          data:{
            timeStamp:new Date().getTime(),
            docNo:socket.handshake.query.docNo,
            stage:socket.handshake.query.stage
          }
        };
        for(admin in activeAdmin){
          activeAdmin[admin].socket.emit('newLead',activeLeads[socket.handshake.query.sessionId].data);
        }

    }else if(socket.handshake.query.userType=="admin"){
        activeAdmin[socket.handshake.query.sessionId]={
          socket:socket,
          timeStamp:new Date().getTime()
        };
        var onlineLeads=[];
        for(lead in activeLeads){
          onlineLeads.push(activeLeads[lead].docNo);
        }
        socket.emit('onlineLeads',onlineLeads);
    }
	}
  /*
  ondisconnect
  */
    socket.on('disconnect', function(){
      if(socket.handshake.query.userType){
        if(socket.handshake.query.userType=="user"){
          delete activeLeads[socket.handshake.query.sessionId];
          for(admin in activeAdmin){
            activeAdmin[admin].socket.emit('leftLead',{docNo:socket.handshake.query.docNo});
          }      
        }else if(socket.handshake.query.userType=="admin"){
          delete activeAdmin[socket.handshake.query.sessionId];      
        }
      }
  	});

});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:'+(process.env.PORT || 3000));
});