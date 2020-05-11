let express=require('express')
let app=express()
let morgan=require('morgan')
let serverRouter=require('./routes/server_router')
let userRouter=require('./routes/user_router')

app.use(morgan('dev'))

//setting up mongoDB connection through mongoose
let mongoose =require('mongoose');
let mongoDB="mongodb+srv://vlad:dracula@cluster0-rebjq.gcp.mongodb.net/taut?retryWrites=true&w=majority";
mongoose.connect(mongoDB,{useNewUrlParser:true, useUnifiedTopology:true});
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

const PORT=process.env.port || 4000

app.listen(PORT,()=>{
	console.log(`Taut ga port ${PORT} de tsuketa`)
})