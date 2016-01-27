var express = require("express");
var router = express.Router();

router.post('/', function(req, res){
	res.clearCookie("uID");
	res.redirect("/login");
});

module.exports = router;