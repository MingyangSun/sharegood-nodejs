var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'sharegoods'
});

//Show results
function showResult(result) {
	console.log("Content:\n");
	for(var i = 0; i < result.length; i++) {
		var row = "Result[" + i + "]:";
		for(var j in result[i]) {
			row += j + " --> " + result[i][j] +"; ";
		}
		console.log(row);
	}
	console.log("Done");
}

connection.connect(function(err){
	if(err) {
	console.log("Mysql Connection ERROR!\n" + err);
	}
});

/* Test Part
router.get('/test', function(req, res){
	var sql = "select * from user";
	connection.query(sql, function(err, result){
		if(err) {
			console.log("Query Errot!\n" + err);
			res.send("Query Error");
		} else {
			console.log("Result[0]:" + result[0].user_id);
			res.send("First User Id: " + result[0].user_id); 

		}
	});
	//res.send("Success!");
});
*/

router.get('/', function(req, res){
	//Get User Id From Cookie
	var userID = req.cookies.userID;
	if(isNaN(userID)) {
		res.redirect("/login");
		return ;
	}

	//SQL Query 
	var sql = "select * from photo, relation "
	+ "where photo.user_id = relation.user2_id and relation.user1_id = " + userID;
	connection.query(sql, function(err, result){
		if(err){
			console.log("SQL Query Error!\n" + err);
		} else {
			res.render("home", {page: "allPhotos",photos: result});
		}
	});
});

router.get("/user=:id", function(req, res){
	console.log("User Id: " + req.params.id);

	//Get User Id
	var uID = req.params.id;

	//SQL Query
	var sql = "select user.user_id, user.user_name, user.city, user.country, fans.following, fans.follower," +
	" photo.photo_id, photo.like_photo, photo.description, photo.image_uri from user " +
	" join fans on user.user_id = fans.user_id and user.user_id=" + uID +
	" join photo on photo.user_id =" + uID;
	//var sql = "select fans.follower, fans.following, photo.photo_id, photo.description,  from photo join fans on fans.user_id = photo.user_id and photo.user_id = 1";

	connection.query(sql, function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			//res.render("parts/personalPage", {person: result});
			res.render("home", {page: "personalPage", person: result});	
		}
	});
});

router.get("/good=:id", function(req, res){
	console.log("Photo Id: " + req.params.id);

	//Get Photo Id
	var pID = req.params.id;

	//SQL Query
	var sql = "select * from photo, photo_comment " +
	"where photo.photo_id = photo_comment.photo_id and photo.photo_id =" + pID + 
	" order by photo_comment.comment_id";
	
	connection.query(sql, function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			res.render("home", {page: "onePhoto", photo: result});
		}
	});
});

router.get("/search", function(req, res){
	console.log("Search:" + req.query["search"]);

	//Get Search Query
	var searchQuery = "%" + req.query["search"] + "%";

	//SQL Query
	//var sql = "( select photo_id from photo where description like ? )" + " union all " +
	//"( select user_id from user where user_name like ? )";
	var sql = "select * from photo, user where photo.description like ? and user.user_name like ? ";

	connection.query(sql, [searchQuery, searchQuery], function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			var persons = [];
			var photos = [];
			var personID = {};
			for(var i = 0; i < result.length; i++) {

			}
			res.render("parts/searchResult");
		}
	});
});

router.get("/top=:number", function(req, res){
	console.log("Top " + req.params.number + " Goods!");

	//Get Number
	var number = req.params.number;

	//SQL Query
	var sql = "select * from photo order by like_photo desc limit " + number;

	connection.query(sql, function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			res.render("home", {page: "allPhotos", photos: result});
		}
	});
});

router.get("/liked", function(req, res) {
	//Get User Id from Cookie
	var userID = req.cookies.userID;
	//SQL Query
	var sql = "select * from photo, liked_photo where liked_photo.photo_id = photo.photo_id and liked_photo.user_id = " + userID;

	connection.query(sql, function(err, result) {
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			res.render("home", {page: "allPhotos", photos: result});
		}
	});
});

router.post("like", function(req, res){
	var uID = req.cookies.userID;
	var pID = req.body.photo_id;

	//SQL Queries
	var sql1 = "select * from liked_photo where user_id = ? and photo_id = ? ";
	var sql2 = "insert into liked_photo set ? ";
	var sql3 = "update photo set like_photo = ? where photo_id = ? ";
	var sql4 = "delete from liked_photo where user_id = ? and photo_id = ? ";
	var sql5 = "select like_photo from photo where photo_id = ? ";
	coneection.query(sql5, pID, function(err5, result5) {
		if(err5) {
			console.log("SQL Query Error!\n" + err5);
		} else {
			var likes = result[0]["liked_photo"];
			connection.query(sql1, [uID, pID], function(err1, result1) {
				if(err1) {
					console.log("SQL Query Error!\n" + err1);
				} else {
					if(result1.length = 1) {
						connection.query(sql4, [uID, pID], function(err4, result4) {
							if(err4) {
								console.log("SQL Query Error!\n" + err);
							} else {
								connection.query(sql3, [likes-1, pID], function(err3, result3) {
									if(err3) {
										console.log("SQL Query Error!\n" + err3);
									} else {
										res.send(likes-1);
									}
								});
							}
						});
					} else {
						connection.query(sql2, {user_id: uID, photo_id: pID}, function(err2, result2) {
							if(err2) {
								console.log("SQL Query Error!\n");
							} else {
								connection.query(sql3, [likes+1, pID], function(err3, result3) {
									if(err3) {
										console.log("SQL Query Error!\n");
									} else {
										res.send(likes+1);
									}
								});
							}
						});
					}
				}
			});
		}
	});
});

module.exports = router;