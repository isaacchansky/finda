define(function(require, exports, module) {
    'use strict';
    var flight = require('flight');
    var L = require('leaflet');
    module.exports = flight.component(function map() {
      this.defaultAttrs({
        tileUrl: 'http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png',
	tileAttribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
	tileSubdomains: '0123',
	tileMinZoom: 2,
	tileMaxZoom: 18
      });

      this.defineIconStyles = function() {
        // define icon styles
        var path = L.Icon.Default.imagePath;
        if (!path) {
          path = L.Icon.Default.imagePath = 'lib/leaflet/images';
        }
        this.grayIcon = L.icon({
          iconUrl: path + '/marker-icon-gray.png',
          shadowUrl: path + '/marker-shadow.png'
        });

        this.defaultIcon = L.icon({
          iconUrl: path + '/marker-icon.png',
          shadowUrl: path + '/marker-shadow.png'
        });
      };

      this.configureMap = function(ev, config) {
        var mapConfig = config.map;
        this.map.setView(mapConfig.center, mapConfig.zoom);
        if (mapConfig.maxZoom){
          this.map.options.maxZoom = mapConfig.maxZoom;
        }
        if (mapConfig.maxBounds){
          this.map.setMaxBounds(mapConfig.maxBounds);
        }
        // geolocate once the configuration is set
        this.map.locate({setView: true, maxZoom: mapConfig.zoom});

        // set feature attribute to be used as preview text to config
        this.featurePreviewAttr = config.map.preview_attribute;
      };

      this.loadData = function(ev, data) {
        this._mapData = data;
        this.defineIconStyles();

        var setupFeature = function(feature, layer) {
          this.attr.features[feature.geometry.coordinates] = layer;

          // bind popup to feature with specified preview attribute
          this.bindPopupToFeature(
            layer,
            feature.properties[this.featurePreviewAttr]);

          layer.on({
            click: this.emitClick.bind(this),
            mouseover: this.emitHover.bind(this),
            mouseout: this.clearHover.bind(this)
          });
        }.bind(this);

        if (this.attr.layer) {
          this.attr.features = {};
          this.map.removeLayer(this.attr.layer);
        }

        this.attr.layer = L.geoJson(data, {onEachFeature: setupFeature});
        this.attr.layer.addTo(this.map);
      };

      this.emitClick = function(e) {
        this.trigger(document, 'selectFeature', e.target.feature);
      };

      this.emitHover = function(e) {
        this.trigger(document, 'hoverFeature', e.target.feature);
      };

      this.clearHover = function(e) {
        this.trigger(document, 'clearHoverFeature', e.target.feature);
      };

      this.selectFeature = function(ev, feature) {
        if (this.previouslyClicked) {
          this.previouslyClicked.setIcon(this.defaultIcon);
        }
        if (feature) {
          var layer = this.attr.features[feature.geometry.coordinates];
          layer.setIcon(this.grayIcon);
          this.previouslyClicked = layer;

          // re-bind popup to feature with specified preview attribute
          this.bindPopupToFeature(
            layer,
            feature.properties[this.featurePreviewAttr]);

          this.trigger('panTo', {lng: feature.geometry.coordinates[0],
                                 lat: feature.geometry.coordinates[1]});
        } else {
          this.previouslyClicked = null;
        }
      };

      this.selectFeatureByID = function selectFeatureByID (event, data) {
        var features = this._mapData.features;
        var feature = features.filter(function(item, i){
          if(item.properties.uid === data.id){
            return item;
          }
        });
        this.trigger(document, 'selectFeature', feature[0]);
      }

      this.deselectFeature = function(ev, feature) {
        if (this.previouslyClicked) {
          this.previouslyClicked.setIcon(this.defaultIcon);
        }
        var layer = this.attr.features[feature.geometry.coordinates];
        // re-bind popup to feature with specified preview attribute
        this.bindPopupToFeature(
          layer,
          feature.properties[this.featurePreviewAttr]);
        this.previouslyClicked = null;
      };

      this.bindPopupToFeature = function(layer, feature){
        layer.bindPopup(feature,
          {
            closeButton: false,
            offset: L.point(0, -40)
          });
      };

      this.hoverFeature = function(ev, feature) {
        if (feature) {
          var layer = this.attr.features[feature.geometry.coordinates];
          layer.openPopup();
        }
      };

      this.clearHoverFeature = function(ev, feature) {
        if (feature) {
          var layer = this.attr.features[feature.geometry.coordinates];
          layer.closePopup();
        }
      };

      this.panTo = function(ev, latlng) {
        this.map.panTo(latlng);
      };

      this.after('initialize', function() {
        this.map = L.map(this.node, {zoomControl: false});

        this.attr.features = {};

        L.tileLayer(this.attr.tileUrl, {
          attribution: this.attr.tileAttribution,
          subdomains: this.attr.tileSubdomains,
          minZoom: this.attr.tileMinZoom,
          maxZoom: this.attr.tileMaxZoom
        }).addTo(this.map);

        this.on(document, 'config', this.configureMap);
        this.on(document, 'data', this.loadData);
        this.on(document, 'dataFiltered', this.loadData);

        this.on(document, 'selectFeature', this.selectFeature);
        this.on(document, 'selectFeatureByID', this.selectFeatureByID);
        this.on(document, 'deselectFeature', this.deselectFeature);
        this.on(document, 'hoverFeature', this.hoverFeature);
        this.on(document, 'clearHoverFeature', this.clearHoverFeature);
        this.on('panTo', this.panTo);
      });
    });
  });
