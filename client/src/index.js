import React from 'react'
import ReactDOM from 'react-dom'
import io from "socket.io-client"
import './layout.css'
import DataStore from './comp/store.js'

function MessageList(props){
	function sendMessage(text,cancel){
		let message={
			server:props.selserver,
			channel:props.selchannel,
			text:text,
			posted:(new Date()).toISOString()
		}
		props.socket.emit('chat-message',message)
	}
	let listItems=props.messages.map((message)=>{
		return(
			<li>
				<p>{message.text}</p>
				<small>Time:{message.posted}</small>
			</li>
		);
	})
	let list;
	if(props.messages.length){list=<ul>{listItems}</ul>}
	else{list=<p>Start a new conversation</p>}
	return(
		<div>
			<h2>Messages</h2>
			{list}
			<NameForm click_handler={sendMessage}/>
		</div>
	);
}

class NameForm extends React.Component{
	constructor(props){
		super(props)
		this.state={value:""}
	}

	handleChange=(event)=>{
		this.setState({value:event.target.value})
	}

	handleSubmit=(event)=>{
		event.preventDefault()
		this.setState({value:""})
		this.props.click_handler(this.state.value,false)
	}

	render(){
		return(
			<form onSubmit={this.handleSubmit}>
				<input type="text" value={this.state.value} onChange={this.handleChange} />
				<input type="button" value="Cancel" onClick={()=>{this.props.click_handler("",true)}}/>
			</form>
		);
	}
}

function List(props){
	const listItems=props.items.map((item)=>{
		let selclass=""
		if(item._id===props.selid){
			selclass+="selected"
		}
		if(props.itemType==='channel' && item.unread_from){
			selclass+=" unread"
		}
		return <li key={item._id} className={selclass} onClick={()=>props.click_handler(item._id,props.itemType)}>{item.name}</li>
	})
	return(
		<ul className={`list ${props.itemType}list`}>{listItems}</ul>
	)
}

class SlackLayout extends React.Component{
	constructor(props){
		super(props)
		this.state={
			'selserver':"",
			'selchannel':"",
			'addingchannel':false,
			'server_names':[],
			'channel_names':[],
			'messages':[]
		}
	}

	handleClick=(id,type)=>{
		this.setState((prev)=>{
			let servers=DataStore.getServers()
			let selserver=prev.selserver
			let selchannel=prev.selchannel
			if(type==='server'){
				selserver=id
				let curserver=servers.find((s)=>s._id===selserver)
				selchannel=curserver.channels[0]._id
				return({
					selserver:selserver,
					selchannel:selchannel,
					channel_names:curserver.channels,
					messages:curserver.channels[0].messages,
					addingchannel:false
				})
			}
			else if(type==='channel'){
				selchannel=id
				return({
					selchannel:selchannel,
					messages:servers.find((s)=>s._id===selserver).channels.find((c)=>c._id===selchannel).messages,
					addingchannel:false
				})
			}
		})
	}

	addChannelInput=()=>{
		this.setState({addingchannel:true})
	}

	createChannel=async (name,cancel)=>{
		if(cancel){
			this.setState({addingchannel:false})
			return;
		}
		try{
			let selserver=this.state.selserver
			let resp=await fetch(`/server/${selserver}/channels/new`,{
				method:'POST',
				headers:{'Content-Type':'application/json;charset=utf-8'},
				body:JSON.stringify({name:name})
			})
			if(resp.ok){
				let {server_id,newchannel}=await resp.json()
				await DataStore.addChannel(server_id,newchannel)
			}
			else{console.log('Internal Error')}
		}
		catch(error){
			console.error(error)
		}
		finally{
			this.setState({addingchannel:false})
		}
	}

	async componentDidMount(){
		try{
			const socket=io()
			this.socket=socket
			socket.on('disconnect',(reason)=>{
				console.log("disconnected")
				console.log(reason)
			})
			socket.on('chat-message',async (message)=>{
				console.log("new message!")
				message['unread']=false
				if(message.channel!==this.state.selchannel){
					let data={
						socketId:socket.id,
						server:message.server,
						channel:message.channel,
						id:message._id
					}
					await socket.emit('mark-unread',data,(resp)=>{
						if(resp.status){
							console.log('an unread message!')
							message['unread']=true
							DataStore.addMessage(message)
						}
					})
				}
				else{DataStore.addMessage(message)}
			})
			socket.on('new-channel',({server_id,newchannel})=>{
				DataStore.addChannel(server_id,newchannel)
			})
			DataStore.subscribe('init',()=>{
				let servers=DataStore.getServers()
				let selserver=servers.find((server)=>server._id===this.state.selserver)
				let selchannel=selserver.channels.find((channel)=>channel._id===this.state.selchannel)
				this.setState({
					server_names:servers.map((server)=>({_id:server._id,name:server.name})),
					channel_names:selserver.channels,
					messages:selchannel.messages
				})
			})
			DataStore.subscribe('channel_update',()=>{
				this.setState((prev)=>{
					return({
						channel_names:DataStore.getServers().find((s)=>s._id===prev.selserver).channels
					})
				})
			})
			DataStore.subscribe('message_update',()=>{
				this.setState((prev)=>({
					messages:DataStore.getServers().find((s)=>s._id===prev.selserver).channels.find((c)=>c._id===prev.selchannel).messages
				})
				)
			})
			let resp=await fetch('/server/all')
			if(resp.ok){
				let data = await resp.json()
				await this.setState({
					'selserver':data[0]._id,
					'selchannel':data[0].channels[0]._id
				})
				DataStore.initialize(data)
			}
			else{
				this.setState({
					'error':'No servers found'
				})
			}
		}
		catch(error){
			console.log('error happened')
			console.error(error)
			this.setState({
				'error':'Network error'
			})
		}
	}

	componentWillUnmount(){
		this.socket.disconnect()
		DataStore.unsubscribe('channel_update')
		DataStore.unsubscribe('message_update')
	}

	render(){
		if(this.state.server_names.length){
			let messages=this.state.messages
			return(
				<div>
					<h1>Servers</h1>
					<List itemType="server" items={this.state.server_names} selid={this.state.selserver} click_handler={this.handleClick}/>
					<h1>Channels</h1>
					<List itemType="channel" items={this.state.channel_names} selid={this.state.selchannel} click_handler={this.handleClick}/>
					{this.state.addingchannel && (
						<NameForm click_handler={this.createChannel} />
					)}
					<button disabled={this.state.addingchannel?true:false} onClick={this.addChannelInput}>New Channel</button>
					<MessageList selserver={this.state.selserver} selchannel={this.state.selchannel} socket={this.socket} messages={messages}/>
				</div>
			)
		}
		else if(this.state.error){
				return(<p>{this.state.error}</p>);
		}
		else{
			return(<p>Loading server list...</p>);
		}
	}
}

ReactDOM.render(<SlackLayout />,document.getElementById('root'))