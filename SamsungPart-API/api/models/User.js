/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
 const bcrypt = require("bcrypt");
 const saltRounds = 8;
 module.exports = {
   attributes: {
        firstName: {
            type: 'string',
            required: true,
            maxLength: 60
        },
        lastName: {
            type: 'string',
            required: true,
            maxLength: 60
        },
        email: {
            type: 'string',
            required: true,
            unique: true,
            isEmail: true,
            maxLength: 200
        },
        password: {
            type: 'string',
            required: true,
            protect: true
        },
        gender: 'string',   
        profileImage: {type: 'json', columnType: 'array'},
        isAdmin: {
            type: 'boolean',
            defaultsTo: false
        },
        role:{
            type: 'number',
            defaultsTo:2
        },
        passwordResetToken: 'string',
        passwordResetTokenExpiresAt: 'number',
        accessToken:'string'
    },
    beforeCreate: function(user, cb) {
         let plainPassword = user.password;
         const salt = bcrypt.genSaltSync(saltRounds);
         const hash = bcrypt.hashSync(plainPassword, salt);
         user.password = hash;
         cb();
   },
   beforeUpdate: function(user, cb) {
        if(user.password){
            let plainPassword = user.password;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(plainPassword, salt);
            user.password = hash;
          }
         cb();
   }
 
 };
 