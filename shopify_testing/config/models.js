module.exports.models = {

  // schema: true,

  migrate: 'drop',

  attributes: {
    id: { type: 'number', autoIncrement: true, },
  },

  dataEncryptionKeys: {
    default: 'moH+um0CBJvMqUNBKGVeeuVFZ7Pk5gFTnuolu15pBtY='
  },

  cascadeOnDestroy: true

};
