var follow = function(obj, user_id) {
	var post = {userId : user_id};
	$.post("/home/follow", post, function(data){
		$(obj).html(data);
	});
}