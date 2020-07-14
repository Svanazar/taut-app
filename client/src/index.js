import React from 'react'
import ReactDOM from 'react-dom'
import './layout.css'

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
		this.props.click_handler(this.state.value)
	}

	render(){
		return(
			<form onSubmit={this.handleSubmit}>
				<input type="text" value={this.state.value} onChange={this.handleChange} />
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
		let state={}
		if(type==='s'){
			state={
				'selserver':id,
				'selchannel':this.state.servers.find((server)=>server._id===id).channels[0]._id
			}
		}
		else if(type==='c'){
			state['selchannel']=id;
		}
		this.setState(state)
	}

	addChannelInput=()=>{
		this.setState({addingchannel:true})
	}

	createChannel=async (name)=>{
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
				let servers=this.state.servers
				await servers.find((server)=>server._id===selserver).channels.push(newchannel)
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

	render(){
		let servlist,chanlist
		if(this.state.servers.length){
			servlist=<ServerList servers={this.state.servers} selserver={this.state.selserver} click_handler={this.handleClick}/>
			let channels=this.state.servers.find((server)=>server._id===this.state.selserver).channels
			chanlist=<ChannelList channels={channels} selchannel={this.state.selchannel} click_handler={this.handleClick}/>
		}
		else if(this.state.error){
			servlist=<p>{this.state.error}</p>
		}
		else{
			servlist=<p>Loading server list...</p>
		}
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
			</div>
		)
	}
}

ReactDOM.render(<SlackLayout />,document.getElementById('root'))