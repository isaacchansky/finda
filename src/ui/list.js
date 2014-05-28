define(function(require, exports, module) {
    'use strict';
    var flight = require('flight');
    var Handlebars = require('handlebars');
    var _ = require('lodash');
    var $ = require('jquery');
    var templates = {
      item: Handlebars.compile('<li class="list-item" data-id="{{uid}}"><h4>{{organization_name}}</h4></li>')
    };

    module.exports = flight.component(function list() {
      this.defaultAttrs({

        // selectors
        'listItemSelector': '.list-item'
      });

      this.configureList = function configureList(event, config) {
        this.listConfig = config.list;
      }

      this.render = function render(event, data){
        if(this.listConfig){
          var container = $('<ul></ul>');
          _.each(data.features, function(item){
            container.append(templates.item(item.properties));
          });
          this.$node.html(container);
          this.on('click', {
            'listItemSelector': this.showFeature
          });
        }
      };

      this.showFeature = function showFeature(event, data) {
        var featureID = $(event.target)
          .closest(this.attr.listItemSelector)
          .data('id');

        this.trigger(document, 'selectFeatureByID', { id: featureID });
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configureList);
        this.on(document, 'data', this.render);
      });

    });
  });
