var express = require("express");
var app = express();
var router = express.Router();
var fs = require("fs");
var path = require("path");

app.use(express.static("public"));

// View engine setup
app.set("view engine", "pug");

app.get("/", function(req, res) {
  res.render("index", {
    title: "Sarthak Mohanty"
  });
});

app.get("/brand", function(req, res, next) {
  var stream = fs.createReadStream("https://sarthakmohanty.s3.amazonaws.com/Brand+Colors.pdf");
  var filename = "Brand Colors.pdf";
  // Be careful of special characters

  filename = encodeURIComponent(filename);
  // Ideally this should strip them

  res.setHeader("Content-disposition", 'inline; filename="' + filename + '"');
  res.setHeader("Content-type", "application/pdf");

  stream.pipe(res);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
