var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "123456",
	database: "sharegoods"
});

router.get("/", function(req, res){
	res.render("signup");
});

router.post("/", function(req, res) {
	console.log("Gender:" + req.body.gender);
	//Get
	var post = {
		email: req.body.email,
		password: req.body.password,
		user_name: req.body.username,
		sex: req.body.gender,
		country: req.body.country,
		city: req.body.city
	};

	//SQL Query
	var sql = "insert into user set ?";

	connection.query(sql, post, function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
			res.render("signup");
		} else {
			consol.log("Result :" + result);
			res.redirect("/home");
		}
	});
});

module.exports = router;