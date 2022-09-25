/**
 * ApiLog.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    method: { type: 'string', required: true },
    requestData: { type: 'json', required: true },
    responseData: { type: 'json', required: true },
    responseCode: { type: 'number', required: true },
    url: { type: 'string', required: true },
    createdAt : { type:'ref', columnType:'datetime', autoCreatedAt:true},

  },

};

