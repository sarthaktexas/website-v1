require('dotenv').config()
var express = require("express");
var app = express();
const Todoist = require("todoist").v8;
const ical = require('node-ical');
var iCloud = require("apple-icloud");
var session = {};
var username = process.env.ICLOUD_USERNAME;
var password = process.env.ICLOUD_PASSWORD;
var bodyParser = require('body-parser')

app.use(express.static("public"));

app.set("view engine", "pug");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function (req, res) {
  res.render("index", {
    title: "Sarthak Mohanty"
  });
});

app.get("/contact", function (req, res) {
  res.redirect("https://sarthakmohanty.me/contact");
});

app.get("/tasks", async function (req, res) {
  try {
    const todoist = Todoist(process.env.TODOIST_API_KEY);
    // get todoist api
    await todoist.sync();
    // get to do list array
    const items = todoist.items.get();
    console.log(items);
    // List of to-do's
    var taskList = [];
    items.forEach(function (element) {
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
    res.render("tasks", {
      title: "Tasks",
      tasks: taskList
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/locate", async function (req, res) {
  try {
    var myCloud = new iCloud(session, username, password);
    myCloud.on("ready", function () {
      const needsSecurityCode = myCloud.twoFactorAuthenticationIsRequired;

      if (needsSecurityCode) {
        console.error(
          "Two Factor Authentication is required. Type in your security code!"
        );
      } else {
        console.log("Everything okay. Go on!");
      }
    });

    myCloud.login(username, password, function (err) {
      if (err) {}
      myCloud.securityCode = process.env.ICLOUD2FACODE;
      console.log("You logged in successfully!");
    });

    myCloud.on("sessionUpdate", function () {
      myCloud.saveSession();
    });
    // Get iCloud location
    var devices = await myCloud.FindMe.get();
    // Get latitude & longitude
    var longitude = JSON.stringify(devices.content[2].location.longitude);
    var latitude = JSON.stringify(devices.content[2].location.latitude);
    res.render("location", {
      title: "Location",
      longitude: longitude || "-98.628067",
      latitude: latitude || "29.645479"
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

app.get("/score", function (req, res) {
  res.send("This page is currently under maintenance.");
  // res.render("score", {
  //   title: "Sarthak Mohanty - AP Scores"
  // });
});

app.get("/about", function (req, res) {
  res.redirect(
    "https://www.notion.so/Directory-Of-Sarthak-8feff445502242ce9cf106795364b360"
  );
});

app.post("/calendar", async function (req, res) {
  if (req.body.token && req.body.url) {
    function isHex(h) {
      var a = parseInt(h, 16);
      return (a.toString(16) === h.toLowerCase())
    }
    if (req.body.token.length !== 64 && !isHex(req.body.token)) {
      res.send({
        error: "401",
        message: "Your Todoist API Token is invalid. Make sure it's correct by verifying it in User Settings."
      });
    }
    const todoist = Todoist(req.body.token);
    let url;
    if (req.body.url.includes('webcal://')) {
      // If body contains "webcal://"
      url = req.body.url.replace(/webcal:\/\//g, 'https://');
    } else if (req.body.url.includes('https://')) {
      // If body contains "https://"
      url = req.body.url;
    } else {
      // If body is incorrectly formatted
      res.send({
        error: "400",
        message: "Your iCal URL is incorrect or unsecure. Make sure it starts with either https:// or webcal://. HTTP is NOT supported. Please use HTTPS."
      });
    }
    let body = "<h1>Updated with the following:</h1>";
    ical.fromURL(url, {}, async function (err, events) {
      if (err) {
        console.log(err);
      }
      const date = new Date;
      for (const event in events) {
        // Loop throught every event in the events array and call each one "event"
        var ev = events[event];
        // If the date is equal to yesterday's date, or the date is equal to today's date:
        if (ev.start.getDate() === date.getDate() - 1 || ev.start.getDate() === date.getDate()) {
          await todoist.sync();
          const homeworkList = todoist.items.get();
          if (homeworkList.filter(homework => homework.content === ev.summary).length) {
            // If Todoist contains the schoology event, log "exists" and push it to res.send(body)
            console.log(`${ev.summary} exists`);
            body += `<br/>${ev.summary} exists<br/>`;
          } else {
            // If it doesn't, then create it!
            console.log(`${ev.summary} does not exist, so I'll go ahead and add it for you :)`);
            body += `<br/>${ev.summary} does not exist, so I'll go ahead and add it for you :)`;
            await todoist.items.add({
              content: ev.summary,
              due: {
                // Change UTC -> CDT
                string: ev.end.toLocaleDateString('en-US', {
                  timeZone: 'America/Chicago'
                })
              }
            }).then((tdRes) => {
              // tdRes should be todoistResponse
              console.log(`${tdRes.content} was created!`);
              body += `<br/><strong>${tdRes.content} was created!</strong><br/>`;
            }).catch((err) => {
              console.log(err);
              body += err;
            });
          }
        }
      }
    });
    await new Promise(resolve => setTimeout(resolve, 7000));
    res.send(body);
  } else if (req.body.token && !req.body.url) {
    // If iCal URL is missing, do this:
    res.send({
      error: "401",
      message: "Missing Schoology iCal URL. Get it in your User Settings."
    });
  } else if (req.body.url && !req.body.token) {
    // If Todoist API Token is missing, do this:
    res.send({
      error: "401",
      message: "Missing Todoist API Key. Get it in your User Settings."
    });
  } else if (!req.body.url && !req.body.token) {
    // If both are missing, then do this:
    res.send({
      error: "401",
      message: "Missing both Schoology iCal URL & Todoist API Key. Get both in your User Settings in respective apps."
    });
  }
});

app.use(function (req, res) {
  res.status(404).render("error");
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});