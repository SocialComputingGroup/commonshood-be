/**
 * Inner function that serves as helper for the exposed function. Executes the insert
 * operation on the DB, if the wallet has not already been created.
 * @param {Object} app The loopback app object
 * @param {String} userId The caller user ID
 * @param {Object} instance The DB wallet instance (if already present on DB)
 * @param {Object} reject The reject function of the parent Promise
 * @param {Object} resolve The resolve function of the parent Promise
 */

function innerCreateWallet(app, userId, instance, reject, resolve) {
  const wall = {
    userId: userId,
    coins: [],
  }
  if (instance === null) { // I have to create the wallet
    app.models.Wallet.create(wall, (err, newInst) => {
      if (err) {
        exports.handleError(reject, 500, err)
      } else {
        resolve(newInst)
      }
    })
  } else {
    resolve(instance)
  }
}

/**
 * Creates a Wallet and refills it, if necessary, with an amount of eth required to operate
 * on the blockchain without balance problems. Also updates the wallet model on the DB and
 * sends a notification to the client when the wallet is ready to operate.
 * @param {Object} app The loopback app object
 * @param {String} userId The caller user ID
 * @returns {Promise}
 */

exports.createWallet = (app, userId) => {
  return new Promise((resolve, reject) => {
    app.models.Wallet.findOne({ where: { userId: userId } }, (err, instance) => {
      if (err) {
        exports.handleError(reject, 500, err)
      } else {
        realWallet.init().then(() => {
          innerCreateWallet(app, userId, instance, reject, resolve)
        }).catch(logger.error)
      }
    })
  })
}

/**
* Handles the error and calls callback function
* @param {loopBackCallback} cb function used by loopback to callback to the framework and complete a request. In this case it is used to notify the error.
* @param {int} statusCode The returning status code (e.g. 500)
* @param {String} err The Error text message.
*/
exports.handleError = (rejectFunc, statusCode, err) => {
  let realErr = new Error()
  realErr.status = statusCode
  realErr.message = err
  rejectFunc(realErr)
}

/**
 * Gets the promise to have a user from the specified token.
 * @param {AppObject} app Main object which can be got from loopback.
 * @param {String} token The access token.
 * @returns {Promise<UserObject>} The promise to have a user from the specified token.
 */
exports.userFromToken = (app, token) => {
  return new Promise((resolve, reject) => {
    app.models.Token.findOne({
      where: {
        id: token.id
      }
    }, (err, model) => {
      if (err != null) {
        reject(err)
        return
      }

      logger.debug("token model :" + JSON.stringify(model));

      const ID = model.userId
      app.models.Person.findOne({
        where: {
          id: ID
        }
      }, (err, model) => {
        if (err !== null) {
          reject(err)
          return
        }
        logger.debug("user model :" + JSON.stringify(model));
        resolve(model)
      });
    });
  });
}
