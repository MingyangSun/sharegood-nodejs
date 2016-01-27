var likePhoto = function(pid) {
	var post = {photo_id : pid};
	$.post("/home/like", post, function(data) {
		console.log("Data:" + data);
	});
}