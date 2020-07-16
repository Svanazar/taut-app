import EventEmitter from 'eventemitter3'

let emitter=new EventEmitter()
let servers=[]
let DataStore={
	getServers:()=>{
		return servers
	},

	subscribe:(callback)=>{
		emitter.addListener('update',callback)
	},

	unsubscribe:(action)=>{
		emitter.removeListener('update',callback)
	},

	newChannel:async (server_id,newchannel)=>{
		if(servers.length){
			await servers.find((server)=>server._id===server_id).channels.push(newchannel)
			emitter.emit('update')
		}
	}
}

export default DataStore