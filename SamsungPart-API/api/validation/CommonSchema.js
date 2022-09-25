const Joi = require('joi');
const { ObjectID } = require('mongodb');
const idValidate = Joi.object({
	id: Joi.string().required().custom((value, helper) => {

             if (!ObjectID.isValid(value)) {
                  return helper.message("Invalid identifier");
            } else {
                return true
            }

        })
});
module.exports = {
	idValidate
}


