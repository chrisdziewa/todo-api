module.exports = function(sequelize, Datatypes) {
	return sequelize.define('user', {
		email: {
			type: Datatypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: Datatypes.STRING,
			allowNull: false,
			validate: {
				len: [7, 100]
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase().trim();
				}
			}
		}
	});
};