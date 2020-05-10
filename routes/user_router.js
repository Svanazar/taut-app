let express=require('express')
let router=express.Router()

router.post('/new',(req,res,next)=>{
	res.send({'yo':'hey'})
})

module.exports=router