define('super-rentals/components/list-filter', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    classNames: ['list-filter'],
    // sets classname for the compoent
    value: '',
    // default value is set to zero

    init: function init() {
      var _this = this;

      // runs first
      this._super.apply(this, arguments);
      // grabs all parent arguents
      this.get('filter')('').then(function (results) {
        return _this.set('results', results);
      });
      // sets filter to nothing, then sets the results to 'results'
    },

    actions: {
      // runs after init w/ user interaction
      handleFilterEntry: function handleFilterEntry() {
        var _this2 = this;

        var filterInputValue = this.get('value');
        var filterAction = this.get('filter');
        filterAction(filterInputValue).then(function (filterResults) {
          return _this2.set('results', filterResults);
        });
        // sets filter to the value inputted, then filters results and sets the
        // filterResults as 'results'
      }
    }
  });
});