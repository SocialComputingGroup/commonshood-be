'use strict';
const usefulFunc = require('../utils/functions.js')

module.exports = function (Wallet) {
      /**
   * Returns all the coins available on the platform
   * @param {Object} request The Express req object
   * @param {String} filter The filter string for the query
   */
  Wallet.findLists = function findLists(request, filter) {
    return new Promise((resolve, reject) => {
      const app = Wallet.app
      const token = request.accessToken

      usefulFunc.userFromToken(app, token)
        .then((user) => {
          if (user === null) {
            usefulFunc.handleError(reject, 401, 'token has no paired user')
          } else if (filter) {
            logger.debug(`Filter: ${filter}`)
            Wallet.find(JSON.parse(filter), (err, wallet) => {
              if (err) {
                logger.error(`WALLET FIND LIST ERROR : ${err}`)
                usefulFunc.handleError(reject, 500, err)
              } else {
                resolve(wallet)
              }
            })
          } else {
            Wallet.find((err, wallet) => {
              if (err) {
                logger.error(`WALLET FIND LIST ERROR : ${err}`)
                usefulFunc.handleError(reject, 500, err)
              } else {
                resolve(wallet)
              }
            })
          }
        })
    })
  }

    Wallet.remoteMethod(
      "findLists", {
        http: {
          path: "/",
          verb: "get",
        },
        accepts: [{
          arg: "request",
          type: "object",
          http: {
            source: "req"
          }
        },
        {
          arg: "filter",
          type: "string"
        },
        ],
        returns: {
          type: "array",
          root: true
        }
      }
    )
};
