import React from 'react'
import ReactDOM from 'react-dom'
import './layout.css'

class ChannelList extends React.Component{
	constructor(props){
		super(props)
		this.state={
			'selchannel':0
		}
	}

	render(){
		//this.props.channels contains list of channels
		const listItems=this.props.channels.map(channel=><li>{channel.name}</li>)	
		listItems[this.state.selchannel]=<li className='selected'>{this.props.channels[this.state.selchannel].name}</li>
		return(
			<ul className="list channellist">{listItems}</ul>
		)
	}
}


class ServerList extends React.Component{
	constructor(props){
		super(props)
		this.state={
			'selserver':0
		}
	}
	
	handleClick=(i)=>{
		this.setState({
			'selserver':i
		})
	}

	render(){
		//this render is being called before the componentDidMount of the parent is being completed
		//which necessitates this if block. However, this problem wasn't present when Serverlist was handling the network request?
		if(!this.props.servers){
			return null
		}
		//normal code
		// const listItems=this.props.servers.map(server=>{
		// 	return <li key="server._id" onClick={this.handleClic}>{server.name}</li>
		// })
		// listItems[this.state.selserver]=<li className='selected'>{this.props.servers[this.state.selserver].name}</li>
		const listItems=this.props.servers.map((server,index)=>{
			if(this.state.selserver===index)
				return <li key={server._id} className="selected" onClick={()=>this.handleClick(index)}>{server.name}</li>
			else
				return <li key={server._id} onClick={()=>this.handleClick(index)}>{server.name}</li>
		})

		return(
			<div>
				<ul className="list serverlist">{listItems}</ul>
				<ChannelList channels={this.props.servers[this.state.selserver].channels} />
			</div>
		)
	}
}

class SlackLayout extends React.Component{
	constructor(props){
		super(props)
		this.state={
			'servers':[]
		}
	}

	async componentDidMount(){
		try{
			let resp=await fetch('/server/all')
			if(resp.status){
				let data = await resp.json()
				this.setState({
					'servers':data
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
		let elem
		if(this.state.servers.length){
			elem=<ServerList servers={this.state.servers} />
		}
		else if(this.state.error){
			elem=<p>{this.state.error}</p>
		}
		else{
			elem=<p>Loading server list...</p>
		}
		return(
			<div>
				<h1>Servers</h1>
				{elem}
			</div>
		)
	}
}

ReactDOM.render(<SlackLayout />,document.getElementById('root'))