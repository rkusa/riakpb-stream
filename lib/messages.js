'use strict'

var fs = require('fs')
var path = require('path')
var util = require('util')
var EventEmitter = require('events').EventEmitter
var Protobuf = require('node-protobuf')

var messages

var Messages = module.exports = function() {
  if (messages) return messages

  this.isReady = false
  this.types = {}
  this.codes = {}
  this.pb = null

  EventEmitter.call(this)

  messages = this

  var self = this
  var descPath = path.join(__dirname, 'riak_pb.desc')
  fs.readFile(descPath, function(err, desc) {
    if (err) throw err
    self.pb = new Protobuf(desc)

    var messagesPath = path.join(__dirname, 'riak_pb_messages.csv')
    fs.readFile(messagesPath, 'utf8', function(err, csv) {
      if (err) throw err

      csv.split(/\n/g).forEach(function(line) {
        if (!line.length) return
        var columns = line.split(/,/g)
        self.types[columns[0]] = columns[1]
        self.codes[columns[1]] = parseInt(columns[0], 10)
      })

      self.isReady = true
      self.emit('ready')
    })
  })
}

util.inherits(Messages, EventEmitter)

Messages.prototype.getCode = function(type) {
  return this.codes[type]
}

Messages.prototype.getType = function(code) {
  return this.types[code]
}

Messages.prototype.parse = function(buffer, type) {
  if (typeof type !== 'string') {
    type = this.getType(type)
  }
  return this.pb.Parse(buffer, type)
}

Messages.prototype.serialize = function(obj, type) {
  if (typeof type !== 'string') {
    type = this.getType(type)
  }
  return this.pb.Serialize(obj, type)
}