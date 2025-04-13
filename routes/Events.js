const express =require('express');
const router = express.Router();



router.get('/', (req, res) => {
    res.send("Events List")

})

router.get('/new', (req, res) => {
    res.send("create a new Event")
})

router.post('/', (req, res) => { 

    res.send("create a new Event") //admin user can create a new event

})

router
 .route('/:id')
    .get((req, res) => { 
    res.send(`Event details for event with id ${req.params.id}`)
    }) 
    .put((req, res) => { 
        res.send(`Update Event for event with id ${req.params.id}`)
    })
    .delete((req, res) => { 
        res.send(`Delete Event for event with id ${req.params.id}`)
    })

router.param('id', (req,res,next,id) =>{
    next(); //this middleware function is called before the route handler
})



module.exports=router; 