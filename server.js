var express = require("express");
var app = express();
var router = express.Router();
var path = require("path");

app.use(express.static("public"));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Resource Bank"
  });
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
