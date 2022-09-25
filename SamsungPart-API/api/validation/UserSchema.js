const Joi = require('joi');
const createAdmin = Joi.object({
	firstName: Joi.string()
		.alphanum()
		.min(3)
		.max(30)
		.required(),
	lastName: Joi.string()
		.alphanum()
		.min(3)
		.max(30)
		.required(),

	email: Joi.string()
	       .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
	password: Joi.string().required()
});
const login = Joi.object({
	email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
	password: Joi.string().required(),
});
module.exports = {
	createAdmin,
	login
}


