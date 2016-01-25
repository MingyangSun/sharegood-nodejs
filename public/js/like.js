var likePhoto = function(pid) {
	var post = {photo_id : pid};
	$.post("/like", post, function() {

	});
}