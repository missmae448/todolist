const express = require('express') //requires express to run application
const app = express() //adds express 
const MongoClient = require('mongodb').MongoClient //requires mongodb
const PORT = 2121 
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) //creates a connection to MongoDB
 .then(client => {
        console.log(`Connected to ${dbName} Database`) //confirms connection to mongoDB        
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public')) // css images html will run without a seperate code
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{ // sends a request to the server for the homepage
    const todoItems = await db.collection('todos').find().toArray() //pulls request to database and puts it in a list. 
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) // shows how many todos are left unchecked for the day or list
    response.render('index.ejs', { items: todoItems, left: itemsLeft })// adds items to list in HTML using ejs file
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error)) 
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) //the call back you get the request, response refreshes thge page, request goes into the database. from the DB you add 'thing' which is a property object, 'request.body.todoItem' points to input field the client can create a name for the ToDo item such as 'get milk' or 'get bread'. 'completed: false' puts a blank unchecked box next to the new item to allow it to be checked off later once the task is completed
    .then(result => {
       console.log('Todo add')// console indicates a new TODO item has been created
        response.redirect('/')// refreshes the page, sends a new get request.
    })
    .catch(error => console.er (error)) // refreshes the home page or application
})


// app.put is updating exsiting post. 

app.put('/markComplete', (request, response) => { //updates the app when the TODO item is marked COMPLETE
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //makes request to server, updates the DB
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},// descending order
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete') //potentially updating the sole item on TODO list
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => { //updates the app when the TODO item is marked UNCOMPLETE
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //makes request to server, updates the DB
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

//from the client side, send a fetch of request to API to DB and will delete the item. Sends a new request of new deleted Item
app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

//  the server talks to an eviroment or the local host port
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
