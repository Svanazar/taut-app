let express=require('express')
let app=express()
let morgan=require('morgan')

app.use(morgan('dev'))

app.get('/',(req,res)=>{
	res.send('Let\'s Goo!')
})

app.get('/',(err,req,res,next)=>{
	res.status(500)
	res.send(err?err:"Some uncaught error happened")
})

const PORT=process.env.port || 8000

app.listen(PORT,()=>{
	console.log(`Taut ga port ${PORT} de tsuketa`)
})