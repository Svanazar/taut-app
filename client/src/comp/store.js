import EventEmitter from 'eventemitter3'

let emitter=new EventEmitter()
let servers=[]
let DataStore={
	initialize:(data)=>{
		servers=data
		emitter.emit('init')
	},
	getServers:()=>{
		return servers
	},

	subscribe:(event,callback)=>{
		if(event==='init'){
			emitter.once(event,callback)
		}
		else{
			emitter.on(event,callback)
		}
	},

	unsubscribe:(event,callback)=>{
		emitter.removeListener(event,callback)
	},

	addChannel:async (server_id,newchannel)=>{
		if(servers.length){
			await servers.find((server)=>server._id===server_id).channels.push(newchannel)
			emitter.emit('channel_update')
		}
	},

	addMessage:async (message)=>{
		console.log("adding new message")
		await servers.find((s)=>s._id===message.server)
		.channels.find((c)=>c._id===message.channel).messages.push({
			text:message.text,
			posted:message.posted
		})
		emitter.emit('message_update')
	},
}

export default DataStore