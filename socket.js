let socketio=require('socket.io')
let io={}
module.exports={
	getio:()=>io,
	
	createSocket:(server)=>{
		io=socketio(server)
		return io
	},
}