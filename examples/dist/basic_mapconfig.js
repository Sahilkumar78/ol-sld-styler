// ol-sld-styler Map Configuration: ol-sld-styler basic layer styling demo
// All styling/data-specific settings can reside here
// - changes to this file do not require a Webpack rebuild

/* eslint no-unused-vars: 0 */

var mapConfig = {
    // Vector data layers (+ styles) imported from QGIS in OGC GeoPackage format.
    // (Generated directly in QGIS using Processing > Package Layers)
    gpkgFile: 'QGIS Packaged Layers (D+S Canal).gpkg',

    // Map View Projection
    displayProjection: 'EPSG:3857',

    // Initial map view [xmin, ymin, xmax, ymax]
    initialMapExtent: [-264129.300615, 6662945.427783, -257542.479715, 6667240.593291],

    // (Optional) DEBUG: Display (in console) dataLayersConfig template data
    // for this file, i.e. all tables in the GeoPackage
    debugShowTableJson: true,

    // (Optional) DEBUG: display (in console) raw SLD for all layer_style tables
    debugShowSLD: true,

    // Order, grouping and configuration of data layers
    dataLayersConfig: [
        {
            table: 'Notable features (SVG Marker)'
        },
        {
            table: 'Probable path evidence'
        },
        {
            table: 'Planned route (1796 Parliament Act map)'
        },
        {
            table: 'Possible infrastructure'
        },
        {
            table: 'Possible canal centreline'
        },
        {
            table: '1840s Tithe (boundary lines)'
        },
        {
            table: '1840s Tithe (canal)'
        },
        {
            table: 'OS 1st edition (SVG Fill)'
        },
        {
            table: 'Mapping extent'
        }
    ],

    // Configuration of layer styling, for debug and for (optionally)
    // generating symbology icons for Legend and/or Layer Switcher
    sldStylerOptions: {
        // (Optional) DEBUG: display (in console) for all SLD-styled layers the
        // "featureTypeStyle" (i.e. styling from the SLD after parsing)
        //debugShowFeatureTypeStyle: true,

        // (Optional) custom tweaks to "featureTypeStyle" extracted from QGIS
        // "layer_styles" SLD style information in OGC GeoPackage
        tweakFeatureTypeStyle: function(styleName, featureTypeStyle) {
            switch (styleName) {

                // Scale stroke dasharrays by stroke width to overcome bug in QGIS
                // "package layers" export of predefined (not custom) dash patterns
                case 'Probable path evidence':
                case 'Mapping extent':
                case 'Possible infrastructure':
                case 'Possible canal centreline':
                    scaleLineSymbolizerDashArray(featureTypeStyle);
                    break;
            }
            return featureTypeStyle;

            /**
             * Scale all stroke dasharrays in FeatureTypeStyle by stroke width
             * (helper function to overcome bug in QGIS "package layers" export
             *  when using predefined (not custom) dash patterns)
             * @param {object} o - FeatureTypeStyle object
             */
            function scaleLineSymbolizerDashArray(o) {
                if (o.strokeDasharray && o.strokeWidth > 1) {
                    o.strokeDasharray = o.strokeDasharray.split(' ')
                        .map(x => parseFloat(x) * o.strokeWidth).join(' ');
                }
                for (var p in o) {
                    if (Object.prototype.hasOwnProperty.call(o, p) &&
                        typeof o[p] === 'object' ) {
                        scaleLineSymbolizerDashArray(o[p]);
                    }
                }
            }
        },

        // (Optional) overrides to olStyle for things not possible to define
        // in "featureTypeStyle" itself. Gets called for every visible feature
        // (i.e. olStyle array will not be empty)
        // Args:
        //  featureTypeStyle: symbol style definition
        //  olStyle: OpenLayers Styles array
        //  styleName: styleName (or if not defined: table) from dataLayersConfig
        //  feature: current Openlayers Feature (or example feature if createSymbol true)
        //  resolution: (real) resolution in metres/pixel
        //  resolutionChanged: has resolution changed for any styles used by current feature
        //  createSymbol: call is only to create a symbol for Layer Switcher / Legend
        //  symbolLabel: symbol label (only defined when createSymbol true)
        tweakOlStyle: function(featureTypeStyle, olStyle, styleName, feature,
            resolution, resolutionChanged, createSymbol, symbolLabel) {

            // Current layers only need adjusting when resolution (zoom) changes
            if (!resolutionChanged) {
                return olStyle;
            }

            switch (styleName) {
                case 'Notable features (SVG Marker)':
                    // Set anchor points of external graphic and its label from
                    // SLD values exported by QGIS (currently ignored by sldreader)
                    setIconAnchorFromDisplacement(
                        featureTypeStyle.rules[0].pointsymbolizer.graphic,
                        olStyle[0].getImage());
                    break;
            }
            return olStyle;

            /**
             * Set anchor point of external graphic from SLD displacement values
             * (as exported by QGIS) but currently ignored by sldReader
             * @param {object} ftsGraphic - Feature Type Style rule
             *      pointsymbolizer.graphic object
             * @param {object} olStyleIcon - OpenLayers Style Icon Image object
             */
            function setIconAnchorFromDisplacement(ftsGraphic, olStyleIcon) {
                // Only define anchor once
                if (olStyleIcon.anchorDefined) {
                    return;
                }
                // setAnchor() method only exists after external graphic loaded
                if (typeof olStyleIcon.setAnchor === 'function') {
                    // TBD: if icon is not square, offsetX denominator may be wrong,
                    //      but getAnchor() could be used to determine aspect ratio.
                    var offsetX = ftsGraphic.displacement.displacementx /
                        ftsGraphic.size;
                    var offsetY = ftsGraphic.displacement.displacementy /
                        ftsGraphic.size;
                    olStyleIcon.setAnchor([0.5 - offsetX, 0.5 - offsetY]);
                    olStyleIcon.anchorDefined = true;
                }
            }
        }
    }
};
