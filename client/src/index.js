import React from 'react'
import ReactDOM from 'react-dom'
import './layout.css'

// class ChannelList extends React.Component{
// 	constructor(props){
// 		super(props)
// 		this.state={
// 			'selchannel':0
// 		}
// 	}

// 	render(){
// 		//this.props.channels contains list of channels
// 		const listItems=this.props.channels.map(channel=><li>{channel.name}</li>)	
// 		listItems[this.state.selchannel]=<li className='selected'>{this.props.channels[this.state.selchannel].name}</li>
// 		return(
// 			<ul className="list channellist">{listItems}</ul>
// 		)
// 	}
// }


// class ServerList extends React.Component{
// 	constructor(props){
// 		super(props)
// 		this.state={
// 			'selserver':0
// 		}
// 	}
	
// 	handleClick=(i)=>{
// 		this.setState({
// 			'selserver':i
// 		})
// 	}

// 	render(){
// 		//this render is being called before the componentDidMount of the parent is being completed
// 		//which necessitates this if block. However, this problem wasn't present when Serverlist was handling the network request?
// 		if(!this.props.servers){
// 			return null
// 		}
// 		//normal code
// 		// const listItems=this.props.servers.map(server=>{
// 		// 	return <li key="server._id" onClick={this.handleClic}>{server.name}</li>
// 		// })
// 		// listItems[this.state.selserver]=<li className='selected'>{this.props.servers[this.state.selserver].name}</li>
// 		const listItems=this.props.servers.map((server,index)=>{
// 			if(this.state.selserver===index)
// 				return <li key={server._id} className="selected" onClick={()=>this.handleClick(index)}>{server.name}</li>
// 			else
// 				return <li key={server._id} onClick={()=>this.handleClick(index)}>{server.name}</li>
// 		})

// 		return(
// 			<div>
// 				<ul className="list serverlist">{listItems}</ul>
// 				<ChannelList channels={this.props.servers[this.state.selserver].channels} />
// 			</div>
// 		)
// 	}
// }

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
			'selchannel':""
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
					"servers":servers
				})
			}
			else{console.log('Internal Error')}
		}
		catch(error){
			console.error(error)
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
		let servlist,chanlist;
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
				<button onClick={()=>{this.createChannel("jikken")}}>New Channel</button>
			</div>
		)
	}
}

ReactDOM.render(<SlackLayout />,document.getElementById('root'))