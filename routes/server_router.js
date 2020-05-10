let express=require('express')
let mongoose=require('mongoose')
let router=express.Router()

let Server=require('../models/server')

router.get('/all', async (req,res,next)=>{
	try{
		let serverlist= await Server.find()
		res.send(serverlist)
	}
	catch(error){next(error)}
})


router.get('/new',async (req,res,next)=>{
	try{
		let server = await new Server({
			name:'Kiken',
			channels:[{
				name:'bla',
			}]
		})
	
		let created=await server.save()
		res.send(created)
	}
	catch(error){next(error)}
})


router.get('/:name', async (req,res,next)=>{
	try{
		let server=await Server.find({'channels._id':'5eb255cd0146f500debc505b'})
		debugger;
		if(server.length){
			res.send(server)
		}
		else{
			throw {'status':404, 'message':'Requested channel not found'}
		}
	}
	catch(error){next(error)}
})


router.get('/:id/channels/new', async (req,res,next)=>{
	try{
		let getserver=Server.findById(req.params.id)
		let channel={
			'name':'general'
		}

		let server= await getserver
		if(server){
			server.channels.push(channel)
			let updated= await server.save()
			res.send(updated)
		}
		else{
			throw {'status':404, 'message':'No such server found'}
		}
	}
	catch(error){next(error)}
})


router.get('/:id/channels/:name',async (req,res,next)=>{
	try{
		let server=await Server.find({'_id':req.params.id,'channels.name':req.params.name})
		//perhaps instead of searching the channel name here, put a condition on find returning undefined
		if(server){
			let foundChannel=server.channels.find(channel=>{
				return channel.name==req.params.name
			})
			res.send({foundChannel})
		}
		else{
			throw {'status':400,'message':"Not found anything"}
		}
	}
	catch(error){next(error)}
})

module.exports=router

