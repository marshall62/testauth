var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
var multer  = require('multer');
var upload = multer({ dest: './uploads' });   // added instead of broken line below
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer({ dest: '/tmp/'}));       //  broken - causes error

app.get('/index.htm', function (req, res) {
    res.sendFile( __dirname + "/" + "index.htm" );
})

// public/fileupload.html will use this when there is a single file to upload
app.post('/upload', upload.single('img'), function(req, res, next){
    console.log("file"+req.file+req.files);
    res.send('Successfully uploaded!');
});

// fileupload.html will use this when there are more than one to upload
app.post('/uploads', upload.fields([{name: 'img', maxcount: 3}, {name: 'sound', maxcount: 2}]), function(req, res, next){
    console.dir("img files"+req.files.img);
    console.dir("sound files"+req.files.sound);
    res.send('Successfully uploaded!');
})

app.post('/file_upload', function (req, res) {

    console.log(req.files.file.name);
    console.log(req.files.file.path);
    console.log(req.files.file.type);

    var file = __dirname + "/" + req.files.file.name;
    fs.readFile( req.files.file.path, function (err, data) {
        fs.writeFile(file, data, function (err) {
            if( err ){
                console.log( err );
            }else{
                response = {
                    message:'File uploaded successfully',
                    filename:req.files.file.name
                };
            }
            console.log( response );
            res.end( JSON.stringify( response ) );
        });
    });
})

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})