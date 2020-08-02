var express = require("express");
var app = express();
var router = express.Router();
var fs = require("fs");
var path = require("path");
const Todoist = require("todoist").v8;
const todoist = Todoist(process.env.TODOIST_API_KEY);
var iCloud = require("apple-icloud");
var session = {};
var username = process.env.ICLOUD_USERNAME;
var password = process.env.ICLOUD_PASSWORD;

var myCloud = new iCloud(session, username, password);
myCloud.on("ready", function() {
  const needsSecurityCode = myCloud.twoFactorAuthenticationIsRequired;

  if (needsSecurityCode) {
    console.error(
      "Two Factor Authentication is required. Type in your security code!"
    );
  } else {
    console.log("Everything okay. Go on!");
  }
});

myCloud.login(username, password, function(err) {
  if (err) {
  }
  myCloud.securityCode = process.env.ICLOUD2FACODE;
  console.log("You logged in successfully!");
});

myCloud.on("sessionUpdate", function() {
  myCloud.saveSession();
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

app.get("/tasks", async function(req, res) {
  try {
    await todoist.sync();
    const items = todoist.items.get();
    //console.log(JSON.stringify(items));
    var taskList = [];
    items.forEach(function(element) {
      taskList.push(element.content);
    });
    var taskDateList = [];
    items.forEach(function(element) {
      var jsonItemDate = JSON.stringify(element.due);
      taskDateList.push(jsonItemDate.date);
      console.log(jsonItemDate.date);
    });
    res.render("tasks", {
      title: "Tasks",
      tasks: taskList
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/locate", async function(req, res) {
  try {
    var devices = await myCloud.FindMe.get();
    var longitude = JSON.stringify(devices.content[2].location.longitude);
    var latitude = JSON.stringify(devices.content[2].location.latitude);
    res.render("location", {
      title: "Location",
      longitude: longitude,
      latitude: latitude
    });
  } catch (error) {
    console.log(error);
  }
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
