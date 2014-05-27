/*eslint-env node, mocha */

'use strict'

var stream = require('stream')
var net = require('net')
var assert = require('assert').ok
var frame = require('frame-stream')
var riak = require('../lib')
var Messages = require('../lib/messages')
var messages = new Messages
var server

setup(function(done) {
  // mock riak
  server = net.createServer(function(socket) {
    var prefixer = frame.prefix()

    prefixer
    .pipe(socket)
    .pipe(frame())
    .pipe(through({}, function(chunk, enc, cont) {
      var type = chunk.readInt8(0), message
      switch (type) {
        case 1: // RpbPingReq
          message = new Buffer(1)
          message.writeInt8(2, 0)
          prefixer.write(message)
          break
        case 17: // RpbListKeysReq
          var body = messages.serialize({ keys: ['a', 'b'], done: true }, 'RpbListKeysResp')
          message = new Buffer(body.length + 1)
          message.writeInt8(18, 0)
          body.copy(message, 1)
          prefixer.write(message)
          break
      }
      cont()
    }))
  })
  server.listen(4000, done)
})

setup(function(done) {
  if (messages.isReady) done()
  else messages.once('ready', done)
})

teardown(function(done) {
  server.close(done)
})

test('message without content', function(done) {
  var socket = net.connect(4000, function() {
    var serializer = new riak.Serializer
    var parser = new riak.Parser

    serializer
    .pipe(frame.prefix())
    .pipe(socket)
    .pipe(frame())
    .pipe(parser)
    .pipe(through({ objectMode: true }, function(chunk, enc, cont) {
      assert(chunk === true)
      cont()
      socket.end()
      done()
    }))

    serializer.write('RpbPingReq')
  })
})

test('message with content', function(done) {
  var socket = net.connect(4000, function() {
    var serializer = new riak.Serializer
    var parser = new riak.Parser

    serializer
    .pipe(frame.prefix())
    .pipe(socket)
    .pipe(frame())
    .pipe(parser)
    .pipe(through({ objectMode: true }, function(chunk, enc, cont) {
      assert(chunk.keys[0].toString() === 'a')
      assert(chunk.keys[1].toString() === 'b')
      assert(chunk.done === true)
      cont()
      socket.end()
      done()
    }))

    serializer.write({ bucket: 'test' }, 'RpbListKeysReq')
  })
})

function through(opts, transform, flush) {
  var t = new stream.Transform(opts)

  t._transform = transform

  if (flush) {
    t._flush = flush
  }

  return t
}