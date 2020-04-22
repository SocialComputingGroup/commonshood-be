const multer = require('multer')
const fs = require('fs')
const uuid = require('uuid/v4')
const ipfsAPI = require('ipfs-http-client')
const config = require('../../config.js')
const multihashes = require('multihashes')
const crypto = require('crypto')

/**
* Handles the error and calls callback function
* @param {loopBackCallback} cb function used by loopback to callback to the framework and complete a request. In this case it is used to notify the error.
* @param {int} statusCode The returning status code (e.g. 500)
* @param {String} err The Error text message.
*/
function handleError(rejectFunc, statusCode, err) {
  const realErr = new Error()
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
function userFromToken(app, token) {
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


module.exports = function (Resource) {

  Resource.upload = (request, response, cb) => {
    return new Promise((resolve, reject) => {
      const app = Resource.app, token = request.accessToken
      userFromToken(app, token)
      .then(user => {
        if (user === null) handleError(reject, 401, "token has no paired user")
        else {
          let uploadedFileName = ''
          let storage = multer.diskStorage({
            destination: function (req, file, cb) {
              let dirPath = '/tmp/uploads/'
              if (!fs.existsSync(dirPath)) {
                let dir = fs.mkdirSync(dirPath)
              }
              cb(null, dirPath + '/')
            },
            filename: function (req, file, cb) {
              let ext = file.originalname.substring(file.originalname.lastIndexOf('.'))
              let fileName = uuid() + ext
              uploadedFileName = fileName
              cb(null, fileName)
            }
          })
          let upload = multer({
            storage: storage
          }).single('file')
          upload(request,response, (err) => {
            if(err) handleError(reject, 500, err)
            else if (config.app.resourceDriver === 'ipfs'){
              logger.debug('[RESOURCE] Using IPFS driver')
              logger.debug(`[RESOURCE] FS uploading file path ${request.file.path}`)
              let input = fs.createReadStream(request.file.path)
              input.on('readable', () => {
                let ipfs = ipfsAPI('/dns4/ipfs-a/tcp/5001') //move this string inside configuration file
                let ipfsPath = user.id.toString() + '/' + request.file.filename
                ipfs.addFromFs(request.file.path, {recursive: false}, (err, result) => {
                  if(err) logger.error(JSON.stringify(err))
                  else {
                    logger.debug(`Number of files added: ${result.length}`)
                    let file = {
                      uuid: request.file.filename.substring(0, request.file.filename.lastIndexOf('.')),
                      name: request.file.originalname,
                      owner: user.id,
                      size: request.file.size, //expressed in bytes
                      mimetype: request.file.mimetype,
                      ext: request.file.originalname.substring(request.file.originalname.lastIndexOf('.')+1),
                      hash: result[0].hash,
                      url: result[0].path,
                      timestamp: Date.now()
                    }
                    logger.debug(JSON.stringify(file))
                    response.status(200)
                    resolve(file)
                    Resource.create(file)
                  }
                })
              })
            } else if(config.app.resourceDriver === 'fs') {
              logger.debug('[RESOURCE] Using FS driver')
              let fsPath = './contentsUploaded'
              if (!fs.existsSync(fsPath)) {
                fs.mkdirSync(fsPath)
              }
              if (!fs.existsSync(fsPath.concat(`/${user.id}`))) {
                fs.mkdirSync(fsPath.concat(`/${user.id}`))
              }
              let hash = crypto.createHash('sha256')
              hash.update(fs.readFileSync(request.file.path))
              let mhash = multihashes.toB58String(multihashes.encode(hash.digest(), 'sha2-256'))
              let destPath = fsPath.concat(`/${user.id}/`, `${request.file.filename}`)
              logger.debug(destPath)
              fs.copyFileSync(request.file.path, destPath)
              let file = {
                uuid: request.file.filename.substring(0, request.file.filename.lastIndexOf('.')),
                name: request.file.originalname,
                owner: user.id,
                size: request.file.size, //expressed in bytes
                mimetype: request.file.mimetype,
                ext: request.file.originalname.substring(request.file.originalname.lastIndexOf('.')+1),
                hash: mhash,
                url: destPath,
                timestamp: Date.now()
              }
              logger.debug(JSON.stringify(file))
              response.status(200)
              resolve(file)
              Resource.create(file)
            }
          })
        }
      })
    })
  }

  Resource.download = (request, response, id) => {
    return new Promise((resolve, reject) => {
      const app = Resource.app, token = request.accessToken
      userFromToken(app, token)
      .then(user => {
        if (user === null) handleError(reject, 401, "token has no paired user")
        else {
          Resource.findOne({ where: {hash: id}}, (err, resource) => {
            if(err){
              logger.error(`RESOURCE ${id} NOT FOUND`)
              handleError(reject, 404, err)
            } else {
              if(resource == null) {
                logger.error(`RESOURCE ${id} NOT FOUND`)
                handleError(reject, 404, err)
              } else {
                if (config.app.resourceDriver === 'ipfs') {
                  logger.debug(`Retrieving file decriptor from db: ${JSON.stringify(resource)}`)
                  let ipfs = ipfsAPI('/dns4/ipfs-a/tcp/5001')
                  ipfs.get(resource.hash, function (err, files) {
                    logger.debug(`Number of files descriptors: ${files.length}`)
                    files.forEach((file) => {
                      logger.debug(`got the file`)
                      resource.body = 'data:' + resource.mimetype + ';base64,' + file.content.toString('base64')
                      resolve(resource)
                    })
                  })
                } else if (config.app.resourceDriver === 'fs') {
                  logger.debug(`Retrieving file decriptor from db: ${JSON.stringify(resource)}`)
                  fs.readFile(resource.url, 'base64', (err, retrievedFile) => {
                    if(err) {
                      logger.error(`Error retrieving file from FS: ${err}`)
                      response.status(500)
                      handleError(reject, 500, err)
                    } else {
                      logger.debug(`got the file`)
                      resource.body = `data:${resource.mimetype};base64,${retrievedFile}`
                      response.status(200)
                      resolve(resource)
                    }
                  })
                }
              }
            }
          })
        }
      })
    })
  }
}
