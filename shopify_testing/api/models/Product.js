/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    productId: { type: 'number', required: true },
    title: { type: 'string', required: true },
    vendor: {type: 'string', required: true },
    createdAt : {type:'ref',columnType:'datetime',autoCreatedAt:true},
    updatedAt : {type:'ref',columnType:'datetime',autoUpdatedAt:true},
  
  },

};

