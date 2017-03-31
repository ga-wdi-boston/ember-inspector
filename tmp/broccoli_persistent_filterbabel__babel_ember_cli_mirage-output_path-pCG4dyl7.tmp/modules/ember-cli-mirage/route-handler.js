var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

import Ember from 'ember';
import { MirageError } from 'ember-cli-mirage/assert';
import Response from './response';
import FunctionHandler from './route-handlers/function';
import ObjectHandler from './route-handlers/object';
import GetShorthandHandler from './route-handlers/shorthands/get';
import PostShorthandHandler from './route-handlers/shorthands/post';
import PutShorthandHandler from './route-handlers/shorthands/put';
import DeleteShorthandHandler from './route-handlers/shorthands/delete';
import HeadShorthandHandler from './route-handlers/shorthands/head';

import _keys from 'lodash/object/keys';
import _isArray from 'lodash/lang/isArray';

var isBlank = Ember.isBlank;
var typeOf = Ember.typeOf;

function isNotBlankResponse(response) {
  return response && !(typeOf(response) === 'object' && _keys(response).length === 0) && (_isArray(response) || !isBlank(response));
}

var DEFAULT_CODES = { get: 200, put: 204, post: 201, 'delete': 204 };

function createHandler(_ref) {
  var verb = _ref.verb;
  var schema = _ref.schema;
  var serializerOrRegistry = _ref.serializerOrRegistry;
  var path = _ref.path;
  var rawHandler = _ref.rawHandler;
  var options = _ref.options;

  var handler = undefined;
  var args = [schema, serializerOrRegistry, rawHandler, path, options];
  var type = typeOf(rawHandler);

  if (type === 'function') {
    handler = new (_bind.apply(FunctionHandler, [null].concat(args)))();
  } else if (type === 'object') {
    handler = new (_bind.apply(ObjectHandler, [null].concat(args)))();
  } else if (verb === 'get') {
    handler = new (_bind.apply(GetShorthandHandler, [null].concat(args)))();
  } else if (verb === 'post') {
    handler = new (_bind.apply(PostShorthandHandler, [null].concat(args)))();
  } else if (verb === 'put' || verb === 'patch') {
    handler = new (_bind.apply(PutShorthandHandler, [null].concat(args)))();
  } else if (verb === 'delete') {
    handler = new (_bind.apply(DeleteShorthandHandler, [null].concat(args)))();
  } else if (verb === 'head') {
    handler = new (_bind.apply(HeadShorthandHandler, [null].concat(args)))();
  }
  return handler;
}

var RouteHandler = (function () {
  function RouteHandler(_ref2) {
    var schema = _ref2.schema;
    var verb = _ref2.verb;
    var rawHandler = _ref2.rawHandler;
    var customizedCode = _ref2.customizedCode;
    var options = _ref2.options;
    var path = _ref2.path;
    var serializerOrRegistry = _ref2.serializerOrRegistry;

    _classCallCheck(this, RouteHandler);

    this.verb = verb;
    this.customizedCode = customizedCode;
    this.serializerOrRegistry = serializerOrRegistry;
    this.handler = createHandler({ verb: verb, schema: schema, path: path, serializerOrRegistry: serializerOrRegistry, rawHandler: rawHandler, options: options });
  }

  _createClass(RouteHandler, [{
    key: 'handle',
    value: function handle(request) {
      var mirageResponse = this._getMirageResponseForRequest(request);
      var serializedMirageResponse = this.serialize(mirageResponse, request);

      return serializedMirageResponse.toRackResponse();
    }
  }, {
    key: '_getMirageResponseForRequest',
    value: function _getMirageResponseForRequest(request) {
      var response = undefined;
      try {
        /*
         We need to do this for the #serialize convenience method. Probably is
         a better way.
        */
        if (this.handler instanceof FunctionHandler) {
          this.handler.setRequest(request);
        }

        response = this.handler.handle(request);
      } catch (e) {
        if (e instanceof MirageError) {
          throw e;
        } else {
          var message = typeOf(e) === 'string' ? e : e.message;
          throw new MirageError('Your handler for the url ' + request.url + ' threw an error: ' + message);
        }
      }

      return this._toMirageResponse(response);
    }
  }, {
    key: '_toMirageResponse',
    value: function _toMirageResponse(response) {
      var mirageResponse = undefined;

      if (response instanceof Response) {
        mirageResponse = response;
      } else {
        var code = this._getCodeForResponse(response);
        mirageResponse = new Response(code, {}, response);
      }

      return mirageResponse;
    }
  }, {
    key: '_getCodeForResponse',
    value: function _getCodeForResponse(response) {
      var code = undefined;
      if (this.customizedCode) {
        code = this.customizedCode;
      } else {
        code = DEFAULT_CODES[this.verb];
        if (code === 204 && isNotBlankResponse(response)) {
          code = 200;
        }
      }
      return code;
    }
  }, {
    key: 'serialize',
    value: function serialize(mirageResponse, request) {
      mirageResponse.data = this.serializerOrRegistry.serialize(mirageResponse.data, request);
      return mirageResponse;
    }
  }]);

  return RouteHandler;
})();

export default RouteHandler;