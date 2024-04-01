# open-layers-vector-layer-demo
Demo of use of OpenLayers 'vector' map layer.



## How the Demo App Works
Steps:
1. Create OpenLayers map consisting of: 
* oBaseLayer - OL base layer, consisting of a few vanilla WMS layers
* oHighlightLayer - OL vector layer

2. The vector layer is styled:
* 3px blue border ("stroke"), complety opaque
* red "fill", 50% opaque

3. Features in the vector layer is labeled with the 'town' attribute of the feature

4. An 'on-pointermove' (i.e., 'on-hover') event handler for the vector layer
is created that dispalys a "popup" (an OL "overlay") when the mouse hovers over 
any feature in the vector layer

5. Make WFS request for features from MassGIS TOWNSSURVEY_POLYM
data layer to be added to vector layer

6. Upon successful completion of WFS request, add the features
returned by the WFS request to the vector layer

## Software Dependencies
This demo uses the following external libraries, each of which is loaded from a CDN:
* OpenLayers version 9.0.0
* jQuery version 3.4.1

## Serivce Dependencies

This demo relies upon the following layers published as web map services \(WMS\)
and web feature services \(WFS\). In the case of WMS layers, the specified style
is also required.
  
| Layer    | WMS | WFS | Style |
| -------- | --- | --- | ------- |
| postgis:ctps_oceanmask_poly_small | yes | no  | oceanmask_poly |
| postgis:mgis_nemask_poly          | yes | no  | ne_states |
| postgis:mgis_townssurvey_polym    | yes | yes | towns_blank |
| postgis:ctps_ma_wo_model_area     | yes | no  | non_boston_mpo_gray_mask |

The URL of the CTPS WFS is https://www.ctps.org/maploc/wfs

## Colophon
Author: Ben Krepp  
Date: 11 May 2020  
Modified: 5 June 2020
Location: Cyberspace
