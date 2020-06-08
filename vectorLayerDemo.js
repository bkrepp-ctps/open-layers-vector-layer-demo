// Demo of OpenLayers vector layer
//
// OpenLayers map consisting of: 
//      * oBaseLayer - OL base layer, consisting of a few vanilla WMS layers
//      * oHighlightLayer - OL vector layer
//
// The vector layer is styled:
//      * 3px blue border ("stroke"), complety opaque
//      * red "fill", 50% opaque
//
// The vector layer is also labeled with the town name in 10px black font.
// See the code for additional details on the styling of the labels for 
// the vector features.
// Note: See https://openlayers.org/en/latest/examples/vector-labels.html
//       for a demo of labeling OpenLayers vector features
//
// This demo also supports an 'on-pointermove' (i.e., 'on-hover') event handler
// that displays a "popup" (an OL "overlay") when the mouse hovers over 
// any feature in the vector layer.
//
// Make WFS request for features to be added to vector layer
//
// Upon successful completion of WFS request, add the features
//     returned by the WFS request to the vector layer
//
// B. Krepp, attending metaphysician
// 11 May 2020, 5 June 2020

var szServerRoot = location.protocol + '//' + location.hostname + '/maploc/';  
var szWMSserverRoot = szServerRoot + '/wms'; 
var szWFSserverRoot = szServerRoot + '/wfs'; 

// Set up OpenLayers Map Projection (MA State Plane NAD83, meters)
// FYI - This can be done more simply via the inclusion of proj4.js,
//       and the relevant projection file.
//       Leaving this code as-is, though, since this demo was cooked
//       up very quickly from pieces of existing code.
var projection = new ol.proj.Projection({
	code: 'EPSG:26986',
	extent: [33861.26,777514.31,330846.09,959747.44],
	units: 'm'
});
ol.proj.addProjection(projection);
var MaStatePlane = '+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
ol.proj.addCoordinateTransforms(
	'EPSG:4326',
	projection,
	function(coordinate){
		var WGS_to_MAState = proj4(MaStatePlane).forward(coordinate);
		return WGS_to_MAState;
	},
	function(coordinate){
		var MAState_to_WGS = proj4(MaStatePlane).inverse(coordinate);
		return MAState_to_WGS;
	}
);

// Initial center point and zoom level for OL map
var mapCenter = [232908.27147578463, 902215.0940791398];
var mapZoom = 3.0;


// Define the base layer for the OpenLayers map
//
// It consists of: ocean background, NE states, MA towns, MPO boundary 
// By default, the 'transparent' property is set to false, to indicate
// that this is the map's BASE layer
var oBaseLayer = new ol.layer.Tile({	
    source: new ol.source.TileWMS({
        url		:  szWMSserverRoot,
        params	: {
            'LAYERS': [	'postgis:ctps_oceanmask_poly_small',
                        'postgis:mgis_nemask_poly', 
                        'postgis:mgis_townssurvey_polym',  
                        'postgis:ctps_ma_wo_model_area' ],
            'STYLES': [	'oceanmask_poly',
                        'ne_states',
                        'towns_blank',
                        'non_boston_mpo_gray_mask'	]
        }
    })
});

// The following declarations are to support the vector layer:
//
// Define OpenLayers vector layer - it will overlay the base layer
//
var oHighlightLayer = new ol.layer.Vector({source: new ol.source.Vector({ wrapX: false }) });

// Max map resolution at which to label vector features.
var maxResolutionForLabelingVectorFeatures = 1200;   

// Our function to return text to label vector features
//
// Unabashedly borrowed from https://openlayers.org/en/latest/examples/vector-labels.html,
// and subsequently morphed for our purposes.
//
var getText = function(feature, resolution) {
  var maxResolution = maxResolutionForLabelingVectorFeatures;
  var text = feature.get('town');
  if (resolution > maxResolution) {
    text = '';
  }
  return text;
};

// Our createTextStyle function for labeling the vector layer
//
// Unabashedly borrowed from https://openlayers.org/en/latest/examples/vector-labels.html,
// and subsequently morphed for our purposes.
//
var createTextStyle = function(feature, resolution) {
  var align = 'center';
  var baseline = 'middle';
  var size = '10px';
  var height = 1;
  var offsetX = 0;
  var offsetY = 10;     // Displace by 10px "south", so the label from the WMS layer is also visible.
  var weight = 'normal';
  var placement = 'point';
  var maxAngle = 45;
  var overflow = 'true'; 
  var rotation = 0;
  var font = weight + ' ' + size + '/' + height + ' ' + 'Arial';
  var fillColor = 'black';      // Color of label TEXT itself
  var outlineColor = 'white';   // Color of label OUTLINE
  var outlineWidth = 0;

  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    placement: placement,
    maxAngle: maxAngle,
    overflow: overflow,
    rotation: rotation
  });
};

// Define a function to style the polygon vector layer, and set the vector layer's style to use it
function myVectorPolygonStyleFunction(feature, resolution) {
    return new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'rgba(0,0,255,1.0)', width: 3.0}),
                                fill:   new ol.style.Fill({ color: 'rgba(255,0,0,0.5)' }),
                                text:   createTextStyle(feature, resolution)
                              });
}
oHighlightLayer.setStyle(myVectorPolygonStyleFunction);

// The following is to support the 'popup':
//
// Elements that make up the popup:
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
// Create an overlay to anchor the popup to the map:
var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});
// Add an on-click handler to hide the popup
// (This is no longer necessary)
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


// Define OpenLayers map object
// Notes:
//     1. the vector layer is listed after the base layer in the "layers" array,
//        so that it will be rendered on top of the base layer
//     2. the "overlay" is to support the on-hover popup for the vector layer
//
var map = new ol.Map({  target: 'map',
                        layers: [ oBaseLayer,
                                  oHighlightLayer
                                ],
                        overlays: [overlay],
                        view: new ol.View({ projection: projection,
                                            center	: mapCenter,
                                            zoom	:mapZoom
                        })
                    });
                    

// On 'pointermove' event handler for OL map object.
// This function displays the "popup" when the mouse hovers over the vector layer.
//
// With thanks to:
//     https://gis.stackexchange.com/questions/202473/openlayers3-add-click-hover-action-on-ol-layer-vector
//     https://stackoverflow.com/questions/55743504/how-to-implement-feature-popups-in-openlayers-5-on-mouse-hover-and-click
map.on('pointermove', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, 
                     // Restrict the listener to the oHighlightLayer
                     function(feature, layer) {
                        var retval;
                        if (layer == oHighlightLayer) {
                            retval = feature;
                        } else {
                            retval = null;
                        }
                        return retval;
                   });
    if (feature) {
        // Here: code to display/hide a popup, or whatever
        var _DEBUG_HOOK = 0;
        var props = feature.getProperties();
        var s = 'You hovered over ' + props['town'] + '.';
        console.log(s);
        var coordinate = evt.coordinate;
        content.innerHTML = '<p>' + s + '</p>';
        content.hidden = false;
        container.hidden = false;
        overlay.setPosition(coordinate);
    } else {
        content.innerHTML = '';
        content.hidden = true;
        container.hidden = true;
    }
}); // end of OL map's on-pointermove handler


// Issue WFS request for all towns in MassGIS TOWNSSURVEY_POLYM with
// a town_id attribute < 10
//
var cqlFilter = "(town_id < 10)";
var szUrl = szWFSserverRoot + '?';
    szUrl += '&service=wfs';
    szUrl += '&version=1.0.0';
    szUrl += '&request=getfeature';
    szUrl += '&typename=postgis:townssurvey_polym';
    szUrl += '&outputformat=json';
    szUrl += '&cql_filter=' + cqlFilter;
	
$.ajax({ url		: szUrl,
         type		: 'GET',
         dataType	: 'json',
         success	: 	function (data, textStatus, jqXHR) {	
                            var reader, aFeatures = [], props = {}, point, coords, view, size;
                            reader = new ol.format.GeoJSON();
                            aFeatures = reader.readFeatures(jqXHR.responseText);
                            if (aFeatures.length === 0) {
                                alert('WFS request returned no features.');
                                return;
                            } 
                            // Upon success of WFS request:
                            // 1. Clear anything that might previously be in the vector layer
                            // 2. Add features returned by the WFS request to 
                            //    the vector layer's "source"
                            // 3. Set the vector layers's "source" to the data accumulated
                            //    in step (2)
                            var i;
                            var vSource = oHighlightLayer.getSource();
                            //(1)  Clear anything that might previously be in the vector layer
                            vSource.clear();
                            // (2) Add features returned by the WFS request to 
                            //     the vector layer's "source"
                            for (i = 0; i < aFeatures.length; i++) {
                                vSource.addFeature(aFeatures[i]);
                            }
                            // (3) Set the vector layers's "source" to the data accumulated
                            //    in step (2)
                            oHighlightLayer.setSource(vSource);                      
                        },
         error       :   function (qXHR, textStatus, errorThrown ) {
                            alert('WFS request failed.\n' +
                                    'Status: ' + textStatus + '\n' +
                                    'Error:  ' + errorThrown);
                        }
});
