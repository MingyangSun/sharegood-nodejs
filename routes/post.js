var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var multer = require("multer");

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	passowrd: "123456",
	database: "sharegoods"
});

var name = "";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../public/img/')
  },
  filename: function (req, file, cb) {
  	var date = new Date();
  	name = "" + date.getYear()+date.getMonth()+date.getDay()+ date.getHours() + date.getMinutes();
    cb(null, name + ".jpg")
  }
})
 
var uploaded = multer({ storage: storage })

router.use(uploaded.single("image"));

router.post("/", function(req, res) {
	var userID = req.cookies.userID;
	var photoDescription = req.body.description;

	var sql = "insert into photo set ? ";

	var newPhoto = {
		user_id: userID,
		like_photo: 0,
		description: photoDescription,
		image_uri: name
	};

	connection.query(sql, newPhoto, function(err, result {
		if(err) {
			console.log("SQL Query Error!\n" + err);
			res.redirect("/home");
		} else {
			console.log(result);
			res.redirect("/home");
		}
	}));
});

module.exports = router;