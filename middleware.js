module.exports = function(db) {
	return {
		requireAuthentication: function(req, res, next) {
			var token = req.get('Auth');

			db.user.findByToken(token).then(function(user) {
				req.user = user;
				next();
			}, function(e) {
				return res.status(401).send('Error completing your request');
			});
			next();
		}
	};
};