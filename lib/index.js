'use strict'

var stream = require('stream')
var util = require('util')
var Messages = require('./messages')

exports.serialize = function() {

}

var Serializer = exports.Serializer = function() {
  this._reading = false
  this.messages = new Messages

  stream.Duplex.call(this, { objectMode: true })
}

util.inherits(Serializer, stream.Duplex)

Serializer.prototype._write = function _write(data, type, cont) {
  if (!this._reading) return

  if (!this.messages.isReady) {
    this.messages.once('ready', _write.bind(this, data, type, cont))
    return
  }

  if (typeof data === 'string') {
    type = data
    data = undefined
  }

  if (typeof type === 'number') {
    type = this.messages.getType(type)
  }

  var code = this.messages.getCode(type)
  if (!code) {
    throw new TypeError('invalid protobuf type: ' + type)
  }

  if (data) {
    data = this.messages.serialize(data, type)
  }

  var length = data && data.length || 0
  var message = new Buffer(length + 1)
  message.writeInt8(code, 0)
  if (data) data.copy(message, 1)

  this._reading = this.push(message)
  cont()
}

Serializer.prototype._read = function(/* size */) {
  this._reading = true
}

exports.parse = function() {

}

var Parser = exports.Parser = function() {
  this.messages = new Messages

  stream.Transform.call(this, { objectMode: true })
}

util.inherits(Parser, stream.Transform)

Parser.prototype._transform = function(message, enc, cont) {
  if (enc !== 'buffer') {
    throw new TypeError('invalid data')
  }

  var type = this.messages.getType(message.readInt8(0))
  var body = message.slice(1, message.length)

  var obj = body.length ? this.messages.parse(body, type) : true

  if (type === 'RpbErrorResp') {
    cont(new RpbError(obj.errcode, obj.errmsg.toString('utf8')))
  } else {
    this.push(obj)
  }

  cont()
}

/**
 * Error Response
 *
 * @class RpbError
 * @param {Number} code
 * @param {String} message
 */
function RpbError(code, message) {
  Error.call(this)
  Error.captureStackTrace(this, this.constructor)

  this.name = 'RpbError'
  this.code = code
  this.message = message
}
RpbError.prototype = Object.create(Error.prototype, {
  constructor: { value: RpbError }
})

exports.RpbError = RpbError