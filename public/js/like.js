var like = function(obj,pid) {
	var post = {photo_id : pid};
	$.post("/home/like", post, function(data) {
		$(obj).html("Like: " + data.like);
	});
}