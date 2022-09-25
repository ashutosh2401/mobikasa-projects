/**
 * Variant.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    productId : { type: 'number', required: true },
    variantId : { type: 'number', required: true },
    title : { type: 'string', required: true },
    price : { type: 'number', required: true },
    sku : { type: 'string'},
    createdAt : {type:'ref',columnType:'datetime',autoCreatedAt:true},
    updatedAt : {type:'ref',columnType:'datetime',autoUpdatedAt:true},
    
  },

};

