import React from 'react'
import ReactDOM from 'react-dom'
import './layout.css'

class ServerList extends React.Component{
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
			console.error(error)
			this.setState({
				'error':'Network error'
			})
		}
	}

	render(){
		if(this.state.error){
			return <li>{this.state.error}</li>
		}

		const listItems= this.state.servers.map(server=>{
			return <li>{server.name}</li>
		})

		return(
			<ul className={this.props.class}>{listItems}</ul>
		)
	}
}

function SlackLayout(props){
	return(
		<div>
			<h1>Servers</h1>
			<ServerList class='serverlist' />
		</div>
	)
}

ReactDOM.render(<SlackLayout />,document.getElementById('root'))