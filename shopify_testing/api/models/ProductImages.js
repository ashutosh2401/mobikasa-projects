/**
 * ProductImages.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    shopifyImageId: { type: 'number', required: true },
    product_id: { type: 'number', required: true },
    src: { type: 'string', required: true },
    createdAt : { type:'ref', columnType:'datetime', autoCreatedAt:true},
    updatedAt : {type:'ref',columnType:'datetime',autoUpdatedAt:true},

  },

};

