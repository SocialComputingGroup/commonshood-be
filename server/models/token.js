'use strict'

const usefulFunc = require('../utils/functions.js')
const config = require('../../config.js')

module.exports = function(Token) {
  /**
  * Proceeds to authenticate the user using the authCode passed in the function
  * Returns an usable token
  * @param {String} authCode The authentication code obtained by the client from the auth server
  * @returns {String} id is the auth token ID
  * @returns {String} refreshToken is the refresh token ID
  * @returns {String} member_id is the member ID from auth server
  * @returns {Date} expires_in is the expiration date of the token
  * @returns {Object} member is the member informations object retireved from the auth server
  * @returns {String} token_type is the token typology (bearer, etc.)
  * @returns {Number} ttl is the expiration time in seconds
  * @returns {Date} created is the creation date
  * @returns {String} scopes is the scope
  * @returns {String} userId is the memberId
  */
  Token.authToken = function(type, data, request, cb) {
    let oauthServer = Token.app.dataSources.oauthServer
    const app = Token.app
    try {
      if (type == 'code') {
        oauthServer.authorize(data, function(err, response, context) {
          if (err){
            logger.error(JSON.stringify(err)) //error making request

          }
          if ('error' in response) {
            logger.error('> response error: ' + response.error.stack)

          }
          if (!('access_token' in response)) {
            logger.error('error in auth response')
            logger.error(response.error_description)
          }
          logger.debug(JSON.stringify(response))
          let token = {
            id : response.access_token,
            ttl : Math.ceil(((Date.parse(response.expires_in) - Date.now()) / 1000)),
            refresh_token : response.refresh_token,
            token_type : response.token_type,
            expires_at : response.expires_in,
            member_id : response.member_id,
            created : Date.now(),
            userId : response.member_id,
            member : response.member
          }
          logger.debug(JSON.stringify(token))

          Token.findOrCreate({where: {id: response.access_token}}, token,
            function(err, instance, context) {
              if (err) cb(err)
              if (token.member == null) {
                logger.error(`{'source':'token.js', 'driver':'flauth', 'message': 'The sent code ${data} is not valid'}`)
                usefulFunc.handleError(cb, 500, `{'source':'token.js', 'driver':'flauth', 'message': 'The sent code ${data} is not valid'}`)
                return
              }
              token = instance
              let person = {
                'name': token.member.fullname,
                'email': token.member.email,
                'birthdate': Date.now(),
                'realm': 'user',
                'password': config.app.defaultUserPassword
              }

              app.models.Person.findOrCreate({where: {email: token.member.email}}, person,
                function(err, instance, context) {
                  if (err) cb(err)
                  token.userId = instance.id
                  Token.replaceById(token.id, token, function(err, obj) {
                    if (err) cb(err)
                    else {
                        cb(null, token.id, token.refresh_token, token.member_id,
                          token.expires_at, token.member, token.token_type, token.ttl,
                          token.created, token.scopes, token.userId)
                    }
                  })
                })
            })
        })
      } else {
        googleToken(data, request, cb)
        facebookToken(data, request, cb)
      }
    } catch (err) {
      let realErr = new Error()

      logger.error(JSON.stringify(err))

      realErr.status = 500
      realErr.message = err
      cb(err, null)
    }
  }

    /**
  * Proceeds to authenticate the user with Google OAuth2.0 using the authCode passed in the function
  * Returns an usable token
  * @param {String} authCode The authentication code obtained by the client from the auth server
  * @returns {String} id is the auth token ID
  * @returns {String} refreshToken is the refresh token ID
  * @returns {String} member_id is the member ID from auth server
  * @returns {Date} expires_in is the expiration date of the token
  * @returns {Object} member is the member informations object retireved from the auth server
  * @returns {String} token_type is the token typology (bearer, etc.)
  * @returns {Number} ttl is the expiration time in seconds
  * @returns {Date} created is the creation date
  * @returns {String} scopes is the scope
  * @returns {String} userId is the memberId
  */
 function googleToken (data, request, cb) {
  let oauthServerGoogle = Token.app.dataSources.oauthServerGoogle
  const app = Token.app
  logger.debug(JSON.stringify(data))
  try {
    oauthServerGoogle.getTokenInfo(data, function(err, response, context) {
      if (err) {
        logger.error(JSON.stringify(err)) //error making request

       }
      if ('error' in response) {
        logger.error('> response error: ' + response.error.stack)
      }
      if (!('user_id' in response)) {
        logger.error('error in auth response')
        logger.error(response.error_description)
        logger.error(JSON.stringify(response))
      }

      let token = {
        id : data,
        ttl : response.expires_in,
        refresh_token : response.refresh_token,
        token_type : response.token_type,
        expires_at : new Date((response.expires_in * 1000)+Date.now()), //Google returns the seconds missing to the token expiration, so we have to convert accordingly
        member_id : response.member_id,
        created : Date.now(),
        userId : response.member_id,
        member : response.member
      }

      logger.debug(JSON.stringify(token))

      oauthServerGoogle.getUserInfo(data, function(err, userInfos, context) {
        if (err){
          logger.error(JSON.stringify(err)) //error making request

        }
        if ('error' in userInfos) {
          logger.error('> userInfos error: ' + userInfos.error.stack)
        }
        if (!('email' in userInfos)) {
          logger.info('AUTH(GOOGLE): missing email, proceed to use old apis.')
          oauthServerGoogle.getUserInfoOld(data, function(err,userInfos, context) {
            if (err) {
              logger.error(JSON.stringify(err)) //error making request

            }
            if ('error' in userInfos) {
              logger.error('> userInfos error: ' + userInfos.error.stack)
            }
            Token.findOrCreate({where: {id: data}}, token,
              function(err, instance, context) {
                if (err) logger.error(JSON.stringify(err))
                token = instance
                let person = {
                  'name': userInfos.displayName ? userInfos.displayName : userInfos.emails[0].value.split("@")[0],
                  'email': userInfos.emails[0].value,
                  'birthdate': Date.now(),
                  'realm': 'user',
                  'password': config.app.defaultUserPassword,
                }
                logger.debug(JSON.stringify(userInfos))

                app.models.Person.findOrCreate({where: {email: userInfos.emails[0].value}}, person,
                  function(err, instance, context) {
                    if (err) logger.error(JSON.stringify(err))
                    token.userId = instance.id
                    token.member_id = userInfos.id
                    Token.replaceById(token.id, token, function(err, obj) {
                      if (err) logger.error(JSON.stringify(err))
                      else {
                          cb(null, token.id, token.refresh_token, token.member_id,
                            token.expires_at, token.member, token.token_type, token.ttl,
                            token.created, token.scopes, token.userId)
                      }
                    })
                  })
              })
          })
        } else {
            Token.findOrCreate({where: {id: data}}, token,
              function(err, instance, context) {
                if (err) logger.error(JSON.stringify(err))
                token = instance
                let person = {
                  'name': userInfos.name ? userInfos.name : userInfos.email.split("@")[0],
                  'email': userInfos.email,
                  'birthdate': Date.now(),
                  'realm': 'user',
                  'password': config.app.defaultUserPassword,
                }
                logger.debug(JSON.stringify(userInfos))

                app.models.Person.findOrCreate({where: {email: userInfos.email}}, person,
                  function(err, instance, context) {
                    if (err) logger.error(JSON.stringify(err))
                    token.userId = instance.id
                    token.member_id = userInfos.id
                    Token.replaceById(token.id, token, function(err, obj) {
                      if (err) logger.error(JSON.stringify(err))
                      else {
                          cb(null, token.id, token.refresh_token, token.member_id,
                            token.expires_at, token.member, token.token_type, token.ttl,
                            token.created, token.scopes, token.userId)
                      }
                    })
                  })
              })
            }
      })
    })
  } catch (err) {
    let realErr = new Error()

    logger.error(JSON.stringify(err))

    realErr.status = 500
    realErr.message = JSON.stringify(err)
    cb(err, null)
  }
}

  /**
  * Proceeds to authenticate the user with Facebook OAuth2.0 using the authCode passed in the function
  * Returns an usable token
  * @param {String} authCode The authentication code obtained by the client from the auth server
  * @returns {String} id is the auth token ID
  * @returns {String} refreshToken is the refresh token ID
  * @returns {String} member_id is the member ID from auth server
  * @returns {Date} expires_in is the expiration date of the token
  * @returns {Object} member is the member informations object retireved from the auth server
  * @returns {String} token_type is the token typology (bearer, etc.)
  * @returns {Number} ttl is the expiration time in seconds
  * @returns {Date} created is the creation date
  * @returns {String} scopes is the scope
  * @returns {String} userId is the memberId
  */
 function facebookToken (data, request, cb) {
  let oauthServerFacebook = Token.app.dataSources.oauthServerFacebook
  const app = Token.app
  logger.debug(JSON.stringify(data))
  try {
    oauthServerFacebook.getTokenInfo(data, function(err, response, context) {
      if (err) {
        logger.error(JSON.stringify(err)) //error making request
        return
      }
      if ('error' in response) {
        logger.error('> response error: ' + response.error.stack)
        return
      }
      if (!('data' in response)) {
        logger.error('error in auth response')
        logger.error(response.error_description)
        logger.error(JSON.stringify(response))
        return
      }

      let token = {
        id : data,
        ttl : Math.ceil(((response.data.expires_at * 1000) - Date.now()) / 1000),
        refresh_token : response.refresh_token,
        token_type : 'Bearer',
        expires_at : new Date(response.data.expires_at * 1000), //Facebook returns unixtime so we have to convert to have the correct date
        member_id : response.data.user_id,
        created : Date.now(),
        userId : response.user_id,
        member : response.data.member
      }
      logger.debug(JSON.stringify(token))

      oauthServerFacebook.getUserInfo(data, function(err, userInfos, context) {
        if (err) logger.error(JSON.stringify(err))//error making request
        if ('error' in userInfos) {
          logger.error('> userInfos error: ' + userInfos.error.stack)
        }

      Token.findOrCreate({where: {id: data}}, token,
        function(err, instance, context) {
          if (err) logger.error(JSON.stringify(err))
          token = instance
          let person = {
            'name': userInfos.name,
            'email': userInfos.email,
            'birthdate': Date.now(),
            'realm': 'user',
            'password': config.app.defaultUserPassword
          }

          app.models.Person.findOrCreate({where: {email: userInfos.email}}, person,
            function(err, instance, context) {
              if (err) logger.error(JSON.stringify(err))
              token.userId = instance.id
              Token.replaceById(token.id, token, function(err, obj) {
                if (err) logger.error(JSON.stringify(err))
                else {
                    cb(null, token.id, token.refresh_token, token.member_id,
                      token.expires_at, token.member, token.token_type, token.ttl,
                      token.created, token.scopes, token.userId)
                }
              })
            })
        })
      })
    })
  } catch (err) {
    let realErr = new Error()

    logger.error(JSON.stringify(err))

    realErr.status = 500
    realErr.message = JSON.stringify(err)
    cb(err, null)
  }
}

  Token.remoteMethod(
    'authToken', {
      http: {
        path: '/authToken',
        verb: 'get'
      },
      accepts: [
        {arg: 'type', type: 'string'},
        {arg: 'data', type: 'string'},
        {arg: 'request', type: 'object', http: { source: 'req'}}
      ],
      returns: [
        {arg: 'id', type: 'string'},
        {arg: 'refresh_token', type: 'string'},
        {arg: 'member_id', type: 'string'},
        {arg: 'expires_at', type: 'date'},
        {arg: 'member', type: 'object'},
        {arg: 'token_type', type: 'string'},
        {arg: 'ttl', type: 'number'},
        {arg: 'created', type: 'date'},
        {arg: 'scopes', type: 'array'},
        {arg: 'userId', type: 'string'}
      ]
    }
  )
}
