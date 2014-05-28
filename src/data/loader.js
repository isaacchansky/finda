define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  module.exports = flight.component(function loader() {

    function addUID(item, i){
      item.properties.uid = i;
      return item;
    }

    this.after('initialize', function() {
      // load the data
      $.getJSON('config.json', function(config) {
        this.trigger('config', config);

        // load the geojson
        $.getJSON(config.geojson_source, function(data) {
          // add UID to features
          data.features.map(addUID);
          this.trigger('data', data);
        }.bind(this));
      }.bind(this));
    });
  });

});

