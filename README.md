# open-layers-vector-layer-demo
Demo of use of OpenLayers 'vector' map layer

This demo uses the following external libraries:
* OpenLayers version 6.1.0
* jQuery version 3.4.1

Steps:
1. Create OpenLayers map consisting of: 
* oBaseLayer - OL base layer, consisting of a few vanilla WMS layers
* oHighlightLayer - OL vector layer

2. The vector layer is styled:
* 3px blue border ("stroke"), complety opaque
* red "fill", 50% opaque

3. Make WFS request for features from MassGIS TOWNSSURVEY_POLYM
data layer to be added to vector layer

4. Upon successful completion of WFS request, add the features
returned by the WFS request to the vector layer

B. Krepp, attending metaphysician  
11 May 2020, 5 June 2020
