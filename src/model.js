const fetch = require('cross-fetch');
const config = require('../config/default.json');

function Model (koop) {}

// A Model is a javascript function that encapsulates my custom data access code.
// Each model should have a getData() function to fetch the geo data
// and format it into a geojson
Model.prototype.getData = function (req, callback) {

  const apiURL = config.opensky.url;

  const parseGeoJSON = (body) => {

    return {
      type: 'FeatureCollection',
      features: body.states.map(state => {
        return {
          type: 'Feature',
          properties: {
            id             : Number('0x' + state[0]),
            icao24         : state[0],
            callsign       : state[1],
            origin_country : state[2],
            time_position  : state[3],
            last_contact   : state[4],
            longitude      : state[5],
            latitude       : state[6],
            baro_altitude  : state[7],
            on_ground      : state[8],
            velocity       : state[9],
            true_track     : state[10],
            vertical_rate  : state[11],
            sensors        : state[12] ? state[12].join(',') : '',
            geo_altitude   : state[13],
            squawk         : state[14],
            spi            : state[15],
            position_source : state[16],
            category        : state[17]
          },
          geometry: {
            type: 'Point',
            coordinates: [
              state[5],
              state[6],
              state[13],
            ]
          }
        };
      })
    }
  };

  fetch(apiURL).then(response => {
    response.text().then(body => {

      const json = JSON.parse(body);

      const geojson = parseGeoJSON(json);

      geojson.metadata = { 
        name: "OpenSky_Flights_All",
        idField: "id",
        displayField: "callsign",
        fields: [
          { name: 'id',     type: 'Integer', alias: 'ID' },
          { name: 'icao24', type: 'String', alias: 'ICAO', length: 6 },
          { name: 'callsign', type: 'String', alias: 'Callsign', length: 8 },
          { name: 'origin_country', type: 'String', alias: 'Country name', length: 16 },
          { name: 'time_position', type: 'Date', alias: 'Last Position' },
          { name: 'last_contact', type: 'Date', alias: 'Last Update' },
          { name: 'longitude', type: 'Double', alias: 'Longitude' },
          { name: 'latitude', type: 'Double', alias: 'Latitude' },
          { name: 'baro_altitude', type: 'Integer', alias: 'Barometric Altitude (m)' },
          { name: 'on_ground', type: 'Boolean', alias: 'On Ground' },
          { name: 'velocity', type: 'Double', alias: 'Velocity (m/s)' },
          { name: 'true_track', type: 'Double', alias: 'True Track (deg)' },
          { name: 'vertical_rate', type: 'Double', alias: 'Vertical Rate (m/s)' },
          { name: 'sensors', type: 'String', alias: 'Sensors', length: 256 },
          { name: 'geo_altitude', type: 'Double', alias: 'Geometric Altitude (m)' },
          { name: 'squawk', type: 'String', alias: 'Squawk' , length: 16 },
          { name: 'spi', type: 'Boolean', alias: 'Special Purpose Indicator' },
          { name: 'position_source', type: 'Integer', alias: 'Position Source' },
          { name: 'category', type: 'Integer', alias: 'Category' }
        ]
      };

      // the callback function expects a geojson for its second parameter
      callback(null, geojson);
    }).catch(e => {
      callback(e);
    });
  }).catch(e => {
    callback(e);
  });
}

module.exports = Model
