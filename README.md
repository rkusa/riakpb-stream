# riakpb-stream

Node.js streams for Riak Protocol Buffer Messages.

[![NPM][npm]](https://npmjs.org/package/riakpb-stream)
[![Build Status](travis)](http://travis-ci.org/rkusa/riakpb-stream)
[![Dependency Status][deps]](https://david-dm.org/rkusa/riakpb-stream)

[riak_pb](https://github.com/basho/riak_pb) version [`2.0.0.15`](https://github.com/basho/riak_pb/tree/2.0.0.15)

## Usage

```js
var net = require('net')
var stream = require('stream')
var frame = require('frame-stream')
var riak = require('riakpb-stream')

var socket = net.connect(8087, function() {
  var serializer = new riak.Serializer
  var parser = new riak.Parser

  serializer.pipe(frame.prefix()) // (*)
            .pipe(socket)
            .pipe(frame()) // (*)
            .pipe(parser)
            .pipe(...)

  serializer.write({ bucket: 'test' }, 'RpbListKeysReq')
})
```

`(*)` important for length-prefix framing (prepend message length)

## MIT License

Copyright (c) 2014 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm]: https://badge.fury.io/js/riakpb-stream.svg
[travis]: https://secure.travis-ci.org/rkusa/riakpb-stream.svg
[deps]: https://david-dm.org/rkusa/riakpb-stream.png?theme=shields.io
