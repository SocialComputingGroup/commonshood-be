'use strict';

const usefulFunc = require('../utils/functions.js')

module.exports = function(Err) {
  Err.returnError = function(request, response, error) {
    return new Promise((resolve, reject) => {
        let stat = parseInt(error)
        switch (stat) {
          case 100:
          response.status(100)
            resolve({status: stat, message: 'Continue'})
            break;
          case 101:
          response.status(stat)
            resolve({status: stat, message: 'Switching Protocols'})
            break;
          case 102:
          response.status(stat)
            resolve({status: stat, message: 'Processing'})
            break;
          case 103:
          response.status(stat)
            resolve({status: stat, message: 'Early Hints'})
            break;
          case 200:
          response.status(stat)
            resolve({status: stat, message: 'Ok'})
            break;
          case 201:
          response.status(stat)
            resolve({status: stat, message: 'Created'})
            break;
          case 202:
          response.status(stat)
            resolve({status: stat, message:'Accepted'})
            break;
          case 203:
          response.status(stat)
            resolve({status: stat, message:'Non-Authoritative Information'})
            break;
          case 204:
          response.status(stat)
            resolve({status: stat, message:'No Content'})
            break;
          case 205:
          response.status(stat)
            resolve({status: stat, message:'Reset Content'})
            break;
          case 206:
          response.status(stat)
            resolve({status: stat, message:'Partial Content'})
            break;
          case 207:
          response.status(stat)
            resolve({status: stat, message:'Non-Authoritative Information'})
            break;
          case 300:
          response.status(stat)
            resolve({status: stat, message:'Multiple Choices'})
            break;
          case 301:
          response.status(stat)
            resolve({status: stat, message:'Moved Permanently'})
            break;
          case 302:
          response.status(stat)
            resolve({status: stat, message:'Found'})
            break;
          case 303:
          response.status(stat)
            resolve({status: stat, message:'See Others'})
            break;
          case 304:
          response.status(stat)
            resolve({status: stat, message:'Not Modified'})
            break;
          case 400:
          response.status(stat)
            resolve({status: stat, message:'Bad Request'})
            break;
          case 401:
          response.status(stat)
            resolve({status: stat, message:'Unauthorized'})
            break;
          case 402:
          response.status(stat)
            resolve({status: stat, message:'Payment Required'})
            break;
          case 403:
          response.status(stat)
            resolve({status: stat, message:'Forbidden'})
            break;
          case 404:
          response.status(stat)
            resolve({status: stat, message:'Not Found'})
            break;
          case 405:
          response.status(stat)
            resolve({status: stat, message:'Method Not Allowed'})
            break;
          case 406:
          response.status(stat)
            resolve({status: stat, message:'Not Acceptable'})
            break;
          case 408:
          response.status(stat)
            resolve({status: stat, message:'Request Timeout'})
            break;
          case 409:
          response.status(stat)
            resolve({status: stat, message:'Conflict'})
            break;
          case 410:
          response.status(stat)
            resolve({status: stat, message:'Gone'})
            break;
          case 418:
          response.status(stat)
            resolve({status: stat, message:'I`m A Teapot'})
            break;
          case 500:
          response.status(stat)
            resolve({status: stat, message:'Internal Server Error'})
            break;
          case 501:
          response.status(stat)
            resolve({status: stat, message:'Not Implemented'})
            break;
          case 502:
          response.status(stat)
            resolve({status: stat, message:'Bad Gateway'})
            break;
          case 503:
          response.status(stat)
            resolve({status: stat, message:'Service Unavailable'})
            break;
          case 504:
          response.status(stat)
            resolve({status: stat, message:'Gateway Timeout'})
            break;
          case 505:
          response.status(stat)
            resolve({status: stat, message:'HTTP Version Not Supported'})
            break;
          default:
          response.status(418)
            resolve({status: stat, message:'I`m A Teapot'})
        }
    })
  }

  Err.remoteMethod(
    "returnError", {
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
        arg: "response",
        type: "object",
        http: {
          source: "res"
        }
      },
      {
        arg: "error",
        type: "any"
      },
      ],
      returns: [{
        arg: "error",
        type: "object"
      },
      ],
    }
  )

  Err.remoteMethod(
    "returnError", {
      http: {
        path: "/",
        verb: "post",
      },
      accepts: [{
        arg: "request",
        type: "object",
        http: {
          source: "req"
        }
      },
      {
        arg: "response",
        type: "object",
        http: {
          source: "res"
        }
      },
      {
        arg: "error",
        type: "any"
      },
      ],
      returns: [{
        arg: "error",
        type: "object"
      },
      ],
    }
  )

  Err.remoteMethod(
    "returnError", {
      http: {
        path: "/",
        verb: "put",
      },
      accepts: [{
        arg: "request",
        type: "object",
        http: {
          source: "req"
        }
      },
      {
        arg: "response",
        type: "object",
        http: {
          source: "res"
        }
      },
      {
        arg: "error",
        type: "any"
      },
      ],
      returns: [{
        arg: "error",
        type: "object"
      },
      ],
    }
  )

  Err.remoteMethod(
    "returnError", {
      http: {
        path: "/",
        verb: "head",
      },
      accepts: [{
        arg: "request",
        type: "object",
        http: {
          source: "req"
        }
      },
      {
        arg: "response",
        type: "object",
        http: {
          source: "res"
        }
      },
      {
        arg: "error",
        type: "any"
      },
      ],
      returns: [{
        arg: "error",
        type: "object"
      },
      ],
    }
  )
};