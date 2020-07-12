var express = require("express");
var app = express();
var router = express.Router();
var path = require("path");

app.use(express.static("public"));

// View engine setup
app.set("view engine", "pug");

app.get("/", function(req, res) {
  res.render("index", { 
    title: "Sarthak Mohanty"
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
