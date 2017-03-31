define('super-rentals/controllers/index', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({
    actions: {
      filterByCity: function filterByCity(param) {
        if (param !== '') {
          return this.get('store').query('rental', { city: param });
        } else {
          return this.get('store').findAll('rental');
        }
      }
    }
  });
});