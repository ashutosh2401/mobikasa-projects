const Joi = require('joi');
const createDiagram = Joi.object({
	diagramName: Joi.string()
		.min(3)
		.max(30)
		.required(),
	modelNumber: Joi.string()
		.min(3)
		.max(30)
		.required(),

	images: Joi.any(),
	csvData: Joi.any()
});
module.exports = {
	createDiagram
}


