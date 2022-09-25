module.exports = function(req, res, next) {
  //console.log("Requested :: ", req.method, req.url);
	if (req.get('access_token')) {
      let access_token = req.get('access_token');
      jwToken.verify(access_token, function(err, token) {
        if (err) {
          res.status(401);
          return res.send(Utils.jsonError( 'Invalid Token!'));
        }
        req.token = token;
        UserManager.getUserByToken(access_token).then((userData)=>{
            if(userData){
              req.decoded = {};
              req.decoded.userId = token.id; // This is the decrypted token or the payload you provided
              next();
            }else{
              res.status(401);
              return res.send(Utils.jsonError( 'Invalid Token!'));
            }
        }).catch((err)=>{
            return res.badRequest(Utils.jsonError( 'Something went wrong', err));
        })
      
      });
    }else {
         return res.badRequest(Utils.jsonError( 'No Authorization header was found'));
    }
};
