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
	var userID = req.cookies.userID;
	//SQL Query
	var sql = "select user.user_id, user.user_name, user.city, user.country, fans.following, fans.follower," +
	" photo.photo_id, photo.like_photo, photo.description, photo.image_uri from user " +
	" join fans on user.user_id = fans.user_id and user.user_id=" + uID +
	" join photo on photo.user_id =" + uID;
	var sql1 = "select * from relation where user1_id = ? and user2_id = ? ";
	//var sql = "select fans.follower, fans.following, photo.photo_id, photo.description,  from photo join fans on fans.user_id = photo.user_id and photo.user_id = 1";

	connection.query(sql, function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			if(uID == userID) {
				res.render("home", {page: "personalPage", isFollow: "", person: result});
				return ;
			}
			connection.query(sql1, [userID, uID], function(err1, result1) {
				if(err1) {
					console.log("SQL Query Error!\n" + err1);
				} else {
					if(result1.length == 1) {
						res.render("home", {page: "personalPage", isFollow: "Following", person: result});
					} else {
						res.render("home", {page: "personalPage", isFollow: "Follow", person: result});
					}
				}
			});	
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
	var sql1 = "select * from photo where description like ? ";
	var sql2 = "select * from user, fans where user.user_name like ? " +
	" and user.user_id = fans.user_id";

	connection.query(sql1, searchQuery, function(err1, result1) {
		if(err1) {
			console.log("SQL Query Error!\n" + err1);
		} else {
			showResult(result1);
			connection.query(sql2, searchQuery, function(err2, result2){
				if(err2) {
					console.log("SQL Query Error!\n" + err2);
				} else {
					showResult(result2);
					res.render("home", {page: "searchResult", person: result2, photos: result1});
				}
			});
		}
	});
	/*   Tried to use one query
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
	*/
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

router.post("/like", function(req, res){
	var uID = req.cookies.userID;
	var pID = req.body.photo_id;

	console.log("ID: " + pID);

	//SQL Queries
	var sql1 = "select * from liked_photo where user_id = ? and photo_id = ? ";
	var sql2 = "insert into liked_photo set ? ";
	var sql3 = "update photo set like_photo = ? where photo_id = ? ";
	var sql4 = "delete from liked_photo where user_id = ? and photo_id = ? ";
	var sql5 = "select like_photo from photo where photo_id = ? ";
	connection.query(sql5, pID, function(err5, result5) {
		if(err5) {
			console.log("SQL Query Error!\n" + err5);
		} else {
			var likes = result5[0]["like_photo"];
			connection.query(sql1, [uID, pID], function(err1, result1) {
				if(err1) {
					console.log("SQL Query Error!\n" + err1);
				} else {
					console.log("length:" + result1.length);
					if(result1.length == 1) {
						connection.query(sql4, [uID, pID], function(err4, result4) {
							if(err4) {
								console.log("SQL Query Error!\n" + err);
							} else {
								connection.query(sql3, [likes-1, pID], function(err3, result3) {
									if(err3) {
										console.log(likes);
										console.log("SQL Query Error!\n" + err3);
									} else {
										res.send({like: likes+1});
									}
								});
							}
						});
					} else {
						console.log("Here");
						connection.query(sql2, {user_id: uID, photo_id: pID}, function(err2, result2) {
							if(err2) {
								console.log("SQL Query Error!\n");
							} else {
								connection.query(sql3, [likes+1, pID], function(err3, result3) {
									if(err3) {
										console.log("SQL Query Error!\n");
									} else {
										console.log("Done" + (likes+1));
										res.send({like: likes+1});
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

router.get("/following=:id", function(req, res){
	var userID = req.params.id;
	var uID = req.cookies.userID;

	if(userID == 0) {
		userID = uID;
	}

	var sql = "select * from relation, user, fans where relation.user1_id = " + userID + 
	" and relation.user2_id = user.user_id and relation.user2_id = fans.user_id";

	connection.query(sql, function(err, result) {
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			res.render("home", {page: "following", person: result});
		}
	});
});

router.get("/follower=:id", function(req, res) {
	var userID = req.params.id;
	var uID = req.cookies.userID;

	var sql = "select * from relation, user, fans where relation.user2_id = " + userID +
	" and relation.user1_id = user.user_id and relation.user2_id = fans.user_id";

	connection.query(sql, function(err, result){
		if(err) {
			console.log("SQL Query Error!\n" + err);
		} else {
			showResult(result);
			res.render("home", {page: "follower", person : result});
		}
	});
});

router.post("/follow", function(req, res){
	var userID = req.cookies.userID;
	var user2_id = req.body.userId;

	var sql1 = "select * from relation where user1_id = ? and user2_id = ? ";
	var sql2 = "insert into relation set ? ";
	var sql3 = "delete from relation where user1_id = ? and user2_id = ?";
	var sql4 = "select * from fans where user_id = ?";
	var sql5 = "update fans set following = ? , follower = ? where user_id = ? ";

	connection.query(sql1, [userID, user2_id], function(err1, result1) {
		if(err1) {
			console.log("SQL Query Error!\n" + err1);
		} else {
			if(result1.length == 1) {
				connection.query(sql3, [userID, user2_id], function(err3, result3) {
					if(err3) {
						console.log("3SQL Query Error!\n" + err3);
					} else {
						connection.query(sql4, userID, function(err4, result4) {
							if(err4) {
								console.log("4SQL Query Error!\n" + err4);
							} else {
								var user1Follower = result4[0]["follower"];
								var user1Following = result4[0]["following"];
								connection.query(sql5, [user1Following-1, user1Follower, userID], function(err, result){
									connection.query(sql4, user2_id, function(err42, result42){
										var user2Follower = result42[0]["follower"];
										var user2Following = result42[0]["following"];
										connection.query(sql5, [user2Following, user2Follower-1, user2_id], function(err, result){
											res.send("Follow");
										});
									});
								});
							}
						});
					}
				});
			} else {
				connection.query(sql2, {user1_id: userID, user2_id: user2_id}, function(err3, result3) {
					if(err3) {
						console.log("2SQL Query Error!\n" + err3);
					} else {
						connection.query(sql4, userID, function(err4, result4) {
							if(err4) {
								console.log("4-SQL Query Error!\n" + err4);
							} else {
								var user1Follower = result4[0]["follower"];
								var user1Following = result4[0]["following"];
								connection.query(sql5, [user1Following+1, user1Follower, userID], function(err, result){
									connection.query(sql4, user2_id, function(err42, result42){
										var user2Follower = result42[0]["follower"];
										var user2Following = result42[0]["following"];
										connection.query(sql5, [user2Following, user2Follower+1, user2_id], function(err, result){
											res.send("Following");
										});
									});
								});
							}
						});
					}
				});
			}
		}
	});
});

router.get("/userHome", function(req, res){
	var userID = req.cookies.userID;
	res.redirect("/home/user=" + userID);
});

module.exports = router;