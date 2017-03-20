var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import Ember from 'ember';
import ManyRelationship from "ember-data/-private/system/relationships/state/has-many";
import BelongsToRelationship from "ember-data/-private/system/relationships/state/belongs-to";
import EmptyObject from "ember-data/-private/system/empty-object";
import { runInDebug } from 'ember-data/-private/debug';

var _get = Ember.get;

function shouldFindInverse(relationshipMeta) {
  var options = relationshipMeta.options;
  return !(options && options.inverse === null);
}

function createRelationshipFor(internalModel, relationshipMeta, store) {
  var inverseKey = undefined;
  var inverse = null;

  if (shouldFindInverse(relationshipMeta)) {
    inverse = internalModel.type.inverseFor(relationshipMeta.key, store);
  } else {
    runInDebug(function () {
      internalModel.type.typeForRelationship(relationshipMeta.key, store);
    });
  }

  if (inverse) {
    inverseKey = inverse.name;
  }

  if (relationshipMeta.kind === 'hasMany') {
    return new ManyRelationship(store, internalModel, inverseKey, relationshipMeta);
  } else {
    return new BelongsToRelationship(store, internalModel, inverseKey, relationshipMeta);
  }
}

var Relationships = (function () {
  function Relationships(internalModel) {
    this.internalModel = internalModel;
    this.initializedRelationships = new EmptyObject();
  }

  // TODO @runspired deprecate this as it was never truly a record instance

  _createClass(Relationships, [{
    key: "has",
    value: function has(key) {
      return !!this.initializedRelationships[key];
    }
  }, {
    key: "get",
    value: function get(key) {
      var relationships = this.initializedRelationships;
      var internalModel = this.internalModel;
      var relationshipsByName = _get(internalModel.type, 'relationshipsByName');

      if (!relationships[key] && relationshipsByName.get(key)) {
        relationships[key] = createRelationshipFor(internalModel, relationshipsByName.get(key), internalModel.store);
      }

      return relationships[key];
    }
  }, {
    key: "record",
    get: function get() {
      return this.internalModel;
    }
  }]);

  return Relationships;
})();

export default Relationships;