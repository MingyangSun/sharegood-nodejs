//Dependencies
var express = require("express");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var home = require("./routes/home");
var signup = require("./routes/signup");
var login = require("./routes/login");

var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser());
app.use(cookieParser());
app.use("/home", home);
app.use("/signup", signup);
app.use("/login", login)

app.listen(3000, function(err) {
	console.log("Server is Running on Port 3000!");
});