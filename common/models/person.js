'use strict';

module.exports = function(Person) {
  /*
  Person.beforeRemote('logout', function(ctx, logoutOutput, next) {
    const oauthServer = Person.app.dataSources.oauthServer
    oauthServer.logout(ctx.req.accessToken.id, ctx.req.hostname, function(err, response, context) {
      if(err) {
        logger.error(err)
      } else {
        logger.debug(JSON.stringify(response))
        logger.debug(`Logout done for ${JSON.stringify(ctx.req.accessToken)}`)
      }
    })
    next()
  })
  */
};
