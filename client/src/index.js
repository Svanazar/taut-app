import React from 'react'
import ReactDOM from 'react-dom'
import socketIOClient from "socket.io-client"
import './layout.css'

function MessageList(props){
	function sendMessage(text,cancel){
		let message={
			server:props.selserver,
			channel:props.selchannel,
			text:text,
			posted:JSON.stringify(new Date())
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

function ServerList(props){
	const listItems=props.servers.map((server)=>{
		let selclass=""
		if(server._id===props.selserver){
			selclass="selected"
		}
		return <li key={server._id} className={selclass} onClick={()=>props.click_handler(server._id,'s')}>{server.name}</li>
	})
	return(
		<ul className="list serverlist">{listItems}</ul>
		)
}

function ChannelList(props){
	const listItems=props.channels.map((channel)=>{
		let selclass=""
		if(channel._id===props.selchannel){
			selclass="selected"
		}
		return <li key={channel._id} className={selclass} onClick={()=>props.click_handler(channel._id,'c')}>{channel.name}</li>
	})
	return(
		<ul className="list channellist">{listItems}</ul>
		)
}

class SlackLayout extends React.Component{
	constructor(props){
		super(props)
		this.state={
			'servers':[],
			'selserver':"",
			'selchannel':"",
			'addingchannel':false
		}
	}

	handleClick=(id,type)=>{
		if(type==='s'){
			this.setState({
				'selserver':id,
				'selchannel':this.state.servers.find((server)=>server._id===id).channels[0]._id,
				'addingchannel':false
			})
		}
		else if(type==='c'){
			this.setState({
				selchannel:id,
				addingchannel:false
			})
		}
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
				let newchannel=await resp.json()
				newchannel=newchannel.newchannel
				console.log(newchannel)
				//!Problem: change so that the update to state respects immutability of state.
				let servers=this.state.servers //assigning by reference! it is not a copy
				await servers.find((server)=>server._id===selserver).channels.push(newchannel) //directly modifies this.state
				this.setState({
					"servers":servers,
				})
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
			let socket=socketIOClient()
			this.socket=socket;
			socket.on('disconnect',(reason)=>{
				console.log("disconnected")
				console.log(reason)
			})
			// socket.on('chat-message',(message)=>{
			// 	let server=this.state.servers.find((srv)=>srv._id===message.server)
			// 	server.channels.find((channel)=>channel._id=message.channel).messages.push({text:message.text,posted:message.posted})
			// 	this.setState()
			// })
			let resp=await fetch('/server/all')
			if(resp.status){
				let data = await resp.json()
				this.setState({
					'servers':data,
					'selserver':data[0]._id,
					'selchannel':data[0].channels[0]._id
				})
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
	}

	render(){
		let servlist,chanlist
		if(this.state.servers.length){
			servlist=<ServerList servers={this.state.servers} selserver={this.state.selserver} click_handler={this.handleClick}/>
			let channels=this.state.servers.find((server)=>server._id===this.state.selserver).channels
			chanlist=<ChannelList channels={channels} selchannel={this.state.selchannel} click_handler={this.handleClick}/>
			let messages=channels.find((channel)=>channel._id===this.state.selchannel).messages
			return(
				<div>
					<h1>Servers</h1>
					{servlist}
					<h1>Channels</h1>
					{chanlist}
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