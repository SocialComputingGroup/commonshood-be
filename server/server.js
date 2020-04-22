const loopback = require('loopback')
const boot = require('loopback-boot')
const winston = require('winston')
const http = require('http')
const https = require('https')
const fs = require('fs')
const config = require('../config.js')
const { format } = require('logform')

const { logstash, combine, timestamp } = format


const app = loopback()
module.exports = app

/*if (!global.logger) {
  global.logger = winston.cli()
}*/

const alignedWithColorsAndTime = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
)

const logstashFormat = combine(
  timestamp(),
  logstash()
)

if (!global.logger) {
  if (!fs.existsSync('./contentsUploaded')) {
    fs.mkdirSync('./contentsUploaded')
  }
  global.logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: config.app.logLevel,
        format: alignedWithColorsAndTime,
      }),
      new winston.transports.File({
        filename: './contentsUploaded/ccserver-combined.log',
        level: config.app.logLevel,
        format: logstashFormat,
      }),
    ],
  })
}


app.start = () => {
  let server
  if(config.app.https)
    server = https.createServer(httpsOptions, app)
  else
    server = http.createServer(app)
  server.listen(3000, () => {
    const baseUrl = ( config.app.https ? 'https://' : 'http://' ) + app.get('host') + ':' + app.get('port')
    app.emit('started', baseUrl)
    logger.info(`Web server listening at: ${baseUrl}`)
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath
      logger.info(`Browse your REST API at ${baseUrl}${explorerPath}`)
    }
  })
  return server
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
  if (err) throw err

  // start the server if `$ node server.js`
  //if (require.main === module)
  app.start()

})
