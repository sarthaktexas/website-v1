require('dotenv').config()
var express = require("express");
var app = express();
const Todoist = require("todoist").v8;
const todoist = Todoist(process.env.TODOIST_API_KEY);
const ical = require('node-ical');
var iCloud = require("apple-icloud");
var session = {};
var username = process.env.ICLOUD_USERNAME;
var password = process.env.ICLOUD_PASSWORD;

app.use(express.static("public"));

app.set("view engine", "pug");

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

app.get("/about", function (req, res) {
  res.redirect(
    "https://www.notion.so/Directory-Of-Sarthak-8feff445502242ce9cf106795364b360"
  );
});

app.get("/calendar", async function (req, res) {
  var url = "https://nisd.schoology.com/calendar/feed/ical/1597685589/4e417e488e34706baae4e06f13694c47/ical.ics";
  let body = "<h1>Updated with the following:</h1>";
  ical.fromURL(url, {}, async function (err, events) {
    if (err) {
      console.log(err);
    }
    const date = new Date;
    body += `1: ${date}`
    body += `2: ${date.toLocaleString('en-US', { timeZone: 'America/Chicago' }).toDateString()}`
    for (const event in events) {
      var ev = events[event];
      if (ev.start.getDate() === date.getDate() - 1 || ev.start.getDate() === date.getDate()) {
        await todoist.sync();
        const homeworkList = todoist.items.get();
        if (homeworkList.filter(homework => homework.content === ev.summary).length) {
          console.log(`${ev.summary} exists`);
          body += `<br/>${ev.summary} exists<br/>`;
        } else {
          console.log(`${ev.summary} does not exist, so I'll go ahead and add it for you :)`);
          body += `<br/>${ev.summary} does not exist, so I'll go ahead and add it for you :)`;
          body += `<br/>3: ${ev.start}<br/>4: ${ev.end}<br/>`
          await todoist.items.add({
            content: ev.summary,
            due: {
              string: ev.end.toLocaleString('en-US', { timeZone: 'America/Chicago' }).toDateString()
            }
          }).then((tdRes) => {
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
});

app.use(function (req, res) {
  res.status(404).render("error");
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});