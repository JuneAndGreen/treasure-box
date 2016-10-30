var query = require('../util/query');

module.exports = {
	/**
	 * 增
	 */
	add: function(blog, callback) {
		var that = this;

		query('INSERT INTO blog(title, username, content) VALUES (?, ?, ?)', [blog.title, blog.username, blog.content], function(err, rows) {
			if(err) return callback(err);

			var insertId = rows.insertId;
			that.findOne(insertId, function(err, blog) {
				callback(err, blog);
			});
		});
	},
	/**
	 * 删
	 */
	del: function(id, callback) {
		query('DELETE FROM blog WHERE id=?', [id], function(err, rows) {
			callback(err, rows);
		});
	},
	/**
	 * 改
	 */
	update: function(blog, callback) {
		var that = this;

		query('UPDAET blog SET title=?, content=? WHERE id=?', [blog.title, blog.content, blog.id], function(err, rows) {
			if(err) return callback(err);

			that.findOne(blog.id, function(err, blog) {
				callback(err, blog);
			});
		});
	},
	/**
	 * 查
	 */
	findAllByUsername: function(username, callback) {
		query('SELECT * FROM blog WHERE username=?', [username], function(err, rows) {
			callback(err, rows);
		});
	},
	findOne: function(id, callback) {
		query('SELECT * FROM blog WHERE id=?', [id], function(err, rows) {
			callback(err, rows&&rows[0]);
		});
	}
};