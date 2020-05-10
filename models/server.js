let mongoose=require('mongoose')
let Schema=mongoose.Schema

let messageSchema = new Schema({
	text: {type:String},
	author: {type:mongoose.ObjectId,ref:'User'},
	posted:{type:Date}
})

let channelSchema = new Schema({
	name:{type:String},
	members:[{type:mongoose.ObjectId,ref:'User'}],
	messages:[messageSchema]
})

let serverSchema=new Schema({
	name:{type:String},
	admin:{type:mongoose.ObjectId,ref:'User'},
	channels:[channelSchema]
})

module.exports=mongoose.model('Server',serverSchema)