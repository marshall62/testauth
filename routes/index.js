var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('login');
});

router.post('/file_upload', function (req, res) {

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

module.exports = router;
