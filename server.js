var express = require("express");
var app = express();
var router = express.Router();
var fs = require("fs");
var path = require("path");
var iCloud = require("apple-icloud");
var session = {};
var username = process.env.ICLOUD_USERNAME;
var password = process.env.ICLOUD_PASSWORD;
console.log(username);
console.log(password);

var myCloud = new iCloud(session, username, password);
myCloud.on("ready", function() {});

myCloud.login(username, password, function(err) {
  if (err) {
  }
  myCloud.securityCode = process.env.ICLOUD2FACODE;
  console.log("You logged in successfully!");
});

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
app.get("/reminders", async function(req, res) {
  //const contacts = await myCloud.Contacts.list();
  var devices = await myCloud.FindMe.get();
  //console.log(devices);
  //var devicesjson = JSON.stringify(devices.content.);
  var devicesjson = 
  res.render("reminders", {
    title: "Reminders",
    messages: devicesjson
  });
});

// app.get("/score", function(req, res) {
//   res.render("score", {
//     title: "Sarthak Mohanty - AP Scores"
//   });
// });

app.get("/grades", function(req, res) {
  res.sendFile(path.join(__dirname + "/views/grades.html"));
});

app.use(function(req, res) {
  res.status(404).render("error");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
