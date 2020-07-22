let socketio=require('socket.io')
let Server=require('./models/server')
let io={}
module.exports={
	getio:()=>io,
	
	createSocket:(server)=>{
		io=socketio(server)
		io.on('connection',(socket)=>{
			console.log("Dareka ga setsuzoku shita")
			socket.on('disconnect',()=>{
				console.log('setsuzoku owatta')
			})
			socket.on('chat-message',async (message_data)=>{
				try{
					console.log(message_data)
					let server=await Server.findById(message_data.server)
					debugger;
					let channel=server.channels.find((c)=>c.id===message_data.channel)
					let message=channel.messages.create({
						text:message_data.text,
						posted:new Date(message_data.posted)
					})
					channel.messages.push(message)
					let updated=await server.save()
					io.emit('chat-message',{
						server:message_data.server,
						channel:message_data.channel,
						message:message
					})
				}
				catch(error){console.log(error)}
			})
			socket.on('mark-unread',async(data,fn)=>{
				console.log(`marking unread for socket ${data.socketId}`)
				fn({status:'ok'})
			})
		})
		return io
	},
}