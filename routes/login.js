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
	res.render("login");
});

router.post("/", function(req, res){
	console.log(req.body.email);
	console.log(req.body.password);
	
	//Get Form Data
	var email = req.body.email;
	var pwd = req.body.password;

	//SQL Query
	var sql = "select user_id from user where email = ? and password = ? ";

	connection.query(sql, [email, pwd], function(err, result) {
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			console.log(""+result);
			if(result.length != 1) {
				console.log("User Not Exists");
				res.render("login");
			} else {
				console.log("User ID: " + result[0]["user_id"]);
				res.cookie("userID", result[0]["user_id"], {maxAge: 60*1000});
				res.redirect("home");
			}
		}
	});
});

module.exports = router;