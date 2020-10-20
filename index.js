const express = require('express')
const port = 5000
const bodyParser = require('body-parser')
const cors=require('cors');
const admin = require("firebase-admin");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const app = express()





app.use(cors());
app.use(bodyParser.json());




var serviceAccount = require("./volunteer-network-16c32-firebase-adminsdk-dbxcx-8c41124fae.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-16c32.firebaseio.com"
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zzmoj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.zzmoj.mongodb.net:27017,cluster0-shard-00-01.zzmoj.mongodb.net:27017,cluster0-shard-00-02.zzmoj.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-oktw2x-shard-0&authSource=admin&retryWrites=true&w=majority`


const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true});

client.connect(err => {
  const bookings = client.db("volunteer").collection("works");
//console.log('db connection established')
//console.log(err);

  app.post("/addBooking",(req,res) =>{
    const newBooking = req.body;
     bookings.insertOne(newBooking)
     .then(result =>{
    //   console.log(result)
     res.send(result.insertedCount >0); 
     })
     //console.log(newBooking);
     
})
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail})
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else{
                        res.status(401).send('un-authorized access')
                    }
                }).catch(function (error) {
                    res.status(401).send('un-authorized access')
                });
        }
        else{
            res.status(401).send('un-authorized access')
        }
    })

    //show all data 
    app.get('/allBookings',(req, res) => {
        bookings.find({})
        .toArray((err,documents) => {
            res.send(documents)
        })
    })

    app.delete('/delete/:id', (req, res) =>{
        bookings.deleteOne({_id: ObjectId(req.params.id)})
        .then( result => {
            console.log(result)
          res.send(result.deletedCount > 0);
        })
      })

});


app.listen(process.env.PORT || port)