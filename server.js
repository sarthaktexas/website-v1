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
  res.redirect("https://sarthakmohanty.me/contact");
});

app.get("/tasks", async function(req, res) {
  try {
    // get todoist api
    await todoist.sync();
    // get to do list array
    const items = todoist.items.get();
    console.log(items);
    // List of to-do's
    var taskList = [];
    items.forEach(function(element) {
      if (element.due) {
        taskList.push({
          task: element.content,
          date: element.due.string,
          checked: element.checked,
          priority: element.priority,
          recurring: element.due.is_recurring,
          projectid: element.project_id
        });
      } else {
        taskList.push({
          task: element.content,
          date: false,
          checked: element.checked,
          priority: "0",
          recurring: false
        });
      }
    });
    // Debug stuff
    //console.log(JSON.stringify(items));
    res.render("tasks", {
      title: "Tasks",
      tasks: taskList
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/locateshdns", async function(req, res) {
  try {
    // Log in again just to make sure
    myCloud.login(username, password, function(err) {
      if (err) {
      }
      myCloud.securityCode = process.env.ICLOUD2FACODE;
      console.log("You logged in again successfully!");
    });
    // Get iCloud location
    var devices = await myCloud.FindMe.get();
    // Get latitude & longitude
    var longitude = JSON.stringify(devices.content[2].location.longitude);
    var latitude = JSON.stringify(devices.content[2].location.latitude);
    res.render("location", {
      title: "Location",
      longitude: longitude,
      latitude: latitude
      //longitude: "-98.628067",
      //latitude: "29.645479"
    });
  } catch (error) {
    console.log(error);
    res.render("location", {
      title: "Location",
      longitude: "-98.628067",
      latitude: "29.645479"
    });
  }
});

app.get("/score", function(req, res) {
  res.send("This page is currently under maintenance.");
  // res.render("score", {
  //   title: "Sarthak Mohanty - AP Scores"
  // });
});

app.get("/about", function(req, res) {
  res.redirect(
    "https://www.notion.so/Directory-Of-Sarthak-8feff445502242ce9cf106795364b360"
  );
});

app.get("/about", function(req, res) {
  res.redirect(
    "https://www.notion.so/Directory-Of-Sarthak-8feff445502242ce9cf106795364b360"
  );
});

const data = require("./info.json");

app.get("/api/*", function(req, res) {
  res.send("seems like you don't know how to use this api. ask Sarthak.");
});

app.use(function(req, res) {
  res.status(404).render("error");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
