const express = require('express');
const http = require('http');
const multer = require('multer');
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/';

const hostname = 'localhost';
const port = 3000;

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err)
    db = client.db('test')
    console.log('connected to mongo server')
  })

const app = express();

// app.use(express.static(__dirname));

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
   
var upload = multer({ storage: storage });

//upload single file
app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
      res.send(file)
})

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
   
      res.send(files)
})

//upload picture
app.post('/upload/photo', upload.single('myImage'), (req, res) => {
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database
  
 var finalImg = {
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   };
db.collection('quotes').insertOne(finalImg, (err, result) => {
    console.log(result)
 
    if (err) return console.log(err)
 
    console.log('saved to database')
    res.redirect('/')  
  })
})

//retrieving stored images
app.get('/photos', (req, res) => {
    db.collection('quotes').find().toArray((err, result) => {
     
          const imgArray= result.map(element => element._id);
                console.log(imgArray);
     
       if (err) return console.log(err)
       res.send(imgArray)
     
      })
    });

//retrieving pic by id
app.get('/photo/:id', (req, res) => {
    var filename = req.params.id;
     
    db.collection('quotes').findOne({'_id': ObjectId(filename) }, (err, result) => {
     
        if (err) return console.log(err)
     
    //    res.contentType('image/jpeg');
       res.send(result.image.buffer)
       
        
      })
    })

const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});