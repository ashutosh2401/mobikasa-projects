/**
 * ProductImages.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    productId: {type: 'number', required: true},
    imageName: {type: 'string'},
    imagePath: {type: 'string'},

  },

};

