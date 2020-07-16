let express=require('express')
let app=express()
let morgan=require('morgan')
let serverRouter=require('./routes/server_router')
let userRouter=require('./routes/user_router')

app.use(morgan('dev'))
app.use(express.json()) //parses application/json type request body

//socketio setup
const server=require('http').createServer(app) //socket io takes the base http server, not the Express app one
const io=require('socket.io')(server) //passing to the created server the socket instance

//setting up mongoDB connection through mongoose
let mongoose =require('mongoose');
mongoose.connect(process.env.mongo_url,{useNewUrlParser:true, useUnifiedTopology:true});
let db=mongoose.connection;
db.on('error',console.error.bind(console,'MongoDB connection error:'));

//route setup
app.get('/',(req,res)=>{
	res.sendFile('index.html',{root:__dirname})
})
app.use('/server',serverRouter)
app.use('/user',userRouter)

app.use((err,req,res,next)=>{
	res.status(err.status|| 500)
	res.send(err.status?err:"Internal Server Error, check server log")
	if(!err.status){console.log(err)}
})

io.on('connection',(socket)=>{
	console.log("Dareka ga setsuzoku shita")
	socket.on('disconnect',()=>{
		console.log('setsuzoku owatta')
	})
	socket.on('chat-message',(message)=>{
		console.log(message)
		io.emit('chat-message',message)
	})
})


const PORT=process.env.PORT || 4000

server.listen(PORT,()=>{
	console.log(`Taut ga port ${PORT} de tsuketa`)
})