define(function(require, exports, module) {
    'use strict';
    var flight = require('flight');
    var Handlebars = require('handlebars');
    var _ = require('lodash');
    var $ = require('jquery');
    var templates = {
      item: Handlebars.compile('<li><h4><a href="{{web_url}}">{{organization_name}}</a></h4> <p>address: {{address}} </li>')
    };

    module.exports = flight.component(function list() {
      this.defaultAttrs({
      });

      this.render = function render(event, data){
        var container = $('<ul></ul>');
        _.each(data.features, function(item){
          container.append(templates.item(item.properties));
        });
        this.$node.html(container);
      };

      this.after('initialize', function() {
        this.on(document, 'data', this.render);
      });

    });
  });
