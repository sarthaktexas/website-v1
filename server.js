var express = require("express");
var app = express();
var router = express.Router();
var fs = require("fs");
var path = require("path");

app.use(express.static("public"));

app.set("view engine", "pug");

app.get("/", function(req, res) {
  res.render("index", {
    title: "Sarthak Mohanty"
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    title: "Contact Me"
  });
});

// app.get("/score", function(req, res) {
//   res.render("score", {
//     title: "Sarthak Mohanty - AP Scores"
//   });
// });

// app.get("/grades", function(req, res) {
//   res.sendFile(path.join(__dirname+'/views/grades.html'));
// });

app.get("/what", function(req, res) {
  res.render("what", {
    title: "What I'm Doing"
  });
});

app.use(function(req, res) {
  res.status(404).render("error");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
