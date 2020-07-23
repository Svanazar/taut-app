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
			let server=servers.find((s)=>s._id===server_id)
				if(!server.channels.find((c)=>c._id===newchannel._id)){
					server.channels.push(newchannel)
				}
			emitter.emit('channel_update')
		}
	},

	addMessage:(message)=>{
		console.log("adding new message")
		console.log(message)
		let channel=servers.find((s)=>s._id===message.server)
		.channels.find((c)=>c._id===message.channel)
		channel.messages.push(message.message)
		if(message.unread){
			channel['unread_from']=message.message._id
			console.log(channel)
			emitter.emit('channel_update')
		}
		else{
			emitter.emit('message_update')
		}
	},

	markRead:(data)=>{
		let channel=servers.find((s)=>s._id===data.server).channels.find((s)=>s._id===data.channel)
		if(channel.unread_from === data.messageId){
			channel.unread_from=undefined
			emitter.emit('channel_update')
		}
	}
}

export default DataStore