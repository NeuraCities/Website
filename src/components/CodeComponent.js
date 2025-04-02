import React, { useState } from "react";
import { Copy, Play, CheckCircle } from "lucide-react";

const CodeComponent = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const codeExamples = [
    {
      title: "GIS Analysis Function",
      language: "python",
      description: "Function to analyze spatial data and calculate statistics",
      code: `import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import matplotlib.pyplot as plt

def analyze_spatial_distribution(df, lat_col='latitude', lon_col='longitude', value_col=None, 
                               buffer_distance=1000, crs="EPSG:4326"):
    """
    Analyze the spatial distribution of points and perform statistical analysis.
    
    Parameters:
    -----------
    df : pandas.DataFrame
        DataFrame containing point data
    lat_col : str
        Column name for latitude
    lon_col : str
        Column name for longitude
    value_col : str, optional
        Column name for the value to analyze
    buffer_distance : float
        Distance in meters to create buffers around points
    crs : str
        Coordinate reference system
        
    Returns:
    --------
    dict
        Dictionary containing analysis results
    """
    # Convert to GeoDataFrame
    geometry = [Point(xy) for xy in zip(df[lon_col], df[lat_col])]
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs=crs)
    
    # Reproject to a projected CRS for accurate distance calculations
    projected_crs = "EPSG:3857"  # Web Mercator
    gdf = gdf.to_crs(projected_crs)
    
    # Create buffers
    buffered = gdf.copy()
    buffered['geometry'] = gdf.geometry.buffer(buffer_distance)
    
    # Calculate basic statistics
    result = {
        'total_points': len(gdf),
        'bounding_box': gdf.total_bounds.tolist(),
        'centroid': [gdf.geometry.centroid.x.mean(), gdf.geometry.centroid.y.mean()]
    }
    
    # If value column provided, calculate statistics on it
    if value_col and value_col in df.columns:
        result['value_stats'] = {
            'mean': df[value_col].mean(),
            'median': df[value_col].median(),
            'min': df[value_col].min(),
            'max': df[value_col].max(),
            'std': df[value_col].std()
        }
        
        # Calculate spatial autocorrelation (simplified)
        from libpysal.weights import DistanceBand
        from esda.moran import Moran
        
        w = DistanceBand.from_dataframe(gdf, threshold=buffer_distance*2)
        moran = Moran(gdf[value_col], w)
        result['spatial_autocorrelation'] = {
            'moran_i': moran.I,
            'p_value': moran.p_sim
        }
    
    # Calculate point density per area
    total_area = buffered.geometry.area.sum()
    result['point_density'] = len(gdf) / total_area
    
    # Identify clusters (simplified)
    from sklearn.cluster import DBSCAN
    
    coords = gdf[['geometry']].copy()
    coords['x'] = gdf.geometry.x
    coords['y'] = gdf.geometry.y
    
    clustering = DBSCAN(eps=buffer_distance, min_samples=3).fit(coords[['x', 'y']])
    gdf['cluster'] = clustering.labels_
    
    # Number of clusters (excluding noise points which have label -1)
    n_clusters = len(set(clustering.labels_)) - (1 if -1 in clustering.labels_ else 0)
    result['clusters'] = {
        'num_clusters': n_clusters,
        'noise_points': (clustering.labels_ == -1).sum()
    }
    
    return result`
    },
    {
      title: "Map Rendering Function",
      language: "javascript",
      description: "Function to render a choropleth map using Leaflet",
      code: `// Initialize map and add choropleth layer
function initChoroplethMap(containerId, geoJsonData, dataProperty, options = {}) {
  // Default options
  const defaultOptions = {
    center: [0, 0],
    zoom: 2,
    colorScale: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'],
    legendTitle: 'Legend',
    tooltipTemplate: feature => \`\${feature.properties.name}: \${feature.properties[dataProperty]}\`
  };

  // Merge options
  const mapOptions = { ...defaultOptions, ...options };

  // Initialize map
  const map = L.map(containerId, {
    center: mapOptions.center,
    zoom: mapOptions.zoom,
    scrollWheelZoom: true
  });

  // Add basemap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Calculate value range for color scale
  const values = geoJsonData.features
    .map(feature => feature.properties[dataProperty])
    .filter(value => value !== null && !isNaN(value));
  
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Create color scale function
  function getColor(value) {
    if (value === null || isNaN(value)) return '#ccc';
    
    const normalized = (value - minValue) / (maxValue - minValue);
    const colorIndex = Math.min(
      Math.floor(normalized * mapOptions.colorScale.length),
      mapOptions.colorScale.length - 1
    );
    
    return mapOptions.colorScale[colorIndex];
  }
  
  // Style function for GeoJSON
  function style(feature) {
    return {
      fillColor: getColor(feature.properties[dataProperty]),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
  
  // Highlight feature on mouseover
  function highlightFeature(e) {
    const layer = e.target;
    
    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.9
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    
    info.update(layer.feature);
  }
  
  // Reset highlight
  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
  }
  
  // Zoom to feature on click
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }
  
  // Set interaction listeners
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }
  
  // Add GeoJSON layer
  const geojsonLayer = L.geoJson(geoJsonData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
  
  // Add info control
  const info = L.control();
  
  info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  
  info.update = function(feature) {
    this._div.innerHTML = '<h4>' + mapOptions.legendTitle + '</h4>' +
      (feature ? mapOptions.tooltipTemplate(feature) : 'Hover over a region');
  };
  
  info.addTo(map);
  
  // Add legend
  const legend = L.control({ position: 'bottomright' });
  
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'legend');
    const grades = [];
    const step = (maxValue - minValue) / (mapOptions.colorScale.length - 1);
    
    for (let i = 0; i < mapOptions.colorScale.length; i++) {
      grades.push(Math.round((minValue + i * step) * 100) / 100);
    }
    
    div.innerHTML = '<h4>' + mapOptions.legendTitle + '</h4>';
    
    // Loop through intervals and generate a label with a colored square for each
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + mapOptions.colorScale[i] + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    
    return div;
  };
  
  legend.addTo(map);
  
  // Return map instance to allow further manipulation
  return {
    map,
    geojsonLayer,
    info,
    legend
  };
}`
    },
    {
      title: "Data Processing Script",
      language: "python",
      description: "Script to clean and process geospatial data from multiple sources",
      code: `#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Data Processing Script for Geospatial Analysis
---------------------------------------------
This script cleans and processes multiple geospatial datasets,
merging them into a single output for analysis.
"""

import os
import pandas as pd
import geopandas as gpd
import numpy as np
from shapely.geometry import Point, LineString
from datetime import datetime

# Configuration
INPUT_DIR = './data/raw'
OUTPUT_DIR = './data/processed'
LOG_FILE = './logs/processing.log'

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def setup_logging():
    """Set up logging to file"""
    import logging
    logging.basicConfig(
        filename=LOG_FILE,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger()

logger = setup_logging()
logger.info(f"Starting data processing job at {datetime.now()}")

def load_datasets():
    """Load all datasets from input directory"""
    datasets = {}
    
    try:
        # Load point data (CSV)
        point_data_path = os.path.join(INPUT_DIR, 'points.csv')
        if os.path.exists(point_data_path):
            df_points = pd.read_csv(point_data_path)
            logger.info(f"Loaded {len(df_points)} records from points.csv")
            datasets['points'] = df_points
        
        # Load polygon data (Shapefile)
        polygon_data_path = os.path.join(INPUT_DIR, 'boundaries.shp')
        if os.path.exists(polygon_data_path):
            gdf_polygons = gpd.read_file(polygon_data_path)
            logger.info(f"Loaded {len(gdf_polygons)} polygons from boundaries.shp")
            datasets['polygons'] = gdf_polygons
            
        # Load line data (GeoJSON)
        line_data_path = os.path.join(INPUT_DIR, 'routes.geojson')
        if os.path.exists(line_data_path):
            gdf_lines = gpd.read_file(line_data_path)
            logger.info(f"Loaded {len(gdf_lines)} lines from routes.geojson")
            datasets['lines'] = gdf_lines
            
        return datasets
    
    except Exception as e:
        logger.error(f"Error loading datasets: {str(e)}")
        raise

def clean_point_data(df):
    """Clean and prepare point data"""
    logger.info("Cleaning point data...")
    
    # Make a copy to avoid modifying the original
    df_clean = df.copy()
    
    # Remove rows with missing coordinates
    initial_count = len(df_clean)
    df_clean = df_clean.dropna(subset=['latitude', 'longitude'])
    logger.info(f"Removed {initial_count - len(df_clean)} rows with missing coordinates")
    
    # Remove invalid coordinates
    valid_coords = (
        (df_clean['latitude'] >= -90) & 
        (df_clean['latitude'] <= 90) & 
        (df_clean['longitude'] >= -180) & 
        (df_clean['longitude'] <= 180)
    )
    df_clean = df_clean[valid_coords]
    logger.info(f"Removed {initial_count - len(df_clean)} rows with invalid coordinates")
    
    # Convert to GeoDataFrame
    geometry = [Point(xy) for xy in zip(df_clean['longitude'], df_clean['latitude'])]
    gdf = gpd.GeoDataFrame(df_clean, geometry=geometry, crs="EPSG:4326")
    
    # Standardize column names
    gdf = gdf.rename(columns={
        'name': 'location_name',
        'type': 'location_type',
        'value': 'measurement_value'
    })
    
    # Convert date columns to datetime
    if 'date' in gdf.columns:
        gdf['date'] = pd.to_datetime(gdf['date'], errors='coerce')
        gdf = gdf.dropna(subset=['date'])
    
    return gdf

def process_datasets(datasets):
    """Process and merge datasets"""
    results = {}
    
    try:
        # Clean and process point data
        if 'points' in datasets:
            points_gdf = clean_point_data(datasets['points'])
            results['points_processed'] = points_gdf
            
            # Save processed points
            output_path = os.path.join(OUTPUT_DIR, 'points_processed.gpkg')
            points_gdf.to_file(output_path, driver='GPKG')
            logger.info(f"Saved processed points to {output_path}")
        
        # Spatial join of points and polygons if both exist
        if 'points' in results and 'polygons' in datasets:
            # Ensure same CRS
            polygons = datasets['polygons']
            if polygons.crs != results['points_processed'].crs:
                polygons = polygons.to_crs(results['points_processed'].crs)
            
            # Spatial join
            points_with_polygons = gpd.sjoin(
                results['points_processed'], 
                polygons, 
                how='left', 
                predicate='within'
            )
            
            results['points_with_regions'] = points_with_polygons
            
            # Save joined data
            output_path = os.path.join(OUTPUT_DIR, 'points_with_regions.gpkg')
            points_with_polygons.to_file(output_path, driver='GPKG')
            logger.info(f"Saved points with region data to {output_path}")
            
        # Create summary statistics by region
        if 'points_with_regions' in results:
            points_with_regions = results['points_with_regions']
            if 'region_id' in points_with_regions.columns and 'measurement_value' in points_with_regions.columns:
                # Group by region and calculate statistics
                region_stats = points_with_regions.groupby('region_id').agg({
                    'measurement_value': ['count', 'min', 'max', 'mean', 'std']
                })
                
                # Flatten MultiIndex
                region_stats.columns = ['_'.join(col).strip() for col in region_stats.columns.values]
                region_stats = region_stats.reset_index()
                
                # Save statistics
                output_path = os.path.join(OUTPUT_DIR, 'region_statistics.csv')
                region_stats.to_csv(output_path, index=False)
                logger.info(f"Saved region statistics to {output_path}")
            
        return results
    
    except Exception as e:
        logger.error(f"Error processing datasets: {str(e)}")
        raise

def main():
    """Main processing function"""
    try:
        logger.info("Starting data processing")
        
        # Load all datasets
        datasets = load_datasets()
        if not datasets:
            logger.warning("No datasets found to process")
            return
        
        # Process datasets
        processed_data = process_datasets(datasets)
        
        logger.info("Data processing completed successfully")
        
    except Exception as e:
        logger.error(f"Fatal error in data processing: {str(e)}")
        raise

if __name__ == "__main__":
    main()`
    }
  ];

  const handleCopyCode = () => {
    const code = codeExamples[activeTab].code;
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Function to add syntax highlighting classes to code
  const highlightCode = (code) => {
    if (!code) return '';
    
    // This is a very simplified version - in a real app, you'd use a proper syntax highlighter
    // like Prism.js or highlight.js
    
    // Replace common syntax elements with spans that have appropriate classes
    let highlightedCode = code
      // Comments
      .replace(/(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>')
      // Strings
      .replace(/(['"`])(.*?)\1/g, '<span class="text-amber-600">$1$2$1</span>')
      // Keywords (Python)
      .replace(/\b(import|from|def|return|if|for|in|try|except|class|with|as|self|None|True|False)\b/g, 
               '<span class="text-purple-600 font-medium">$1</span>')
      // Keywords (JavaScript)
      .replace(/\b(function|const|let|var|return|if|for|of|try|catch|class|this|null|undefined|true|false)\b/g, 
               '<span class="text-purple-600 font-medium">$1</span>')
      // Functions
      .replace(/(\w+)(\s*\()/g, '<span class="text-blue-600">$1</span>$2')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-green-600">$1</span>');
    
    // Return with line breaks preserved
    return highlightedCode.replace(/\n/g, '<br/>');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with tabs */}
      <div className="border-b border-gray-200 px-4 pt-3">
        <div className="flex space-x-2 overflow-x-auto pb-3">
          {codeExamples.map((example, index) => (
            <button
              key={index}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === index 
                  ? "bg-gray-100 border-b-2 border-teal-600 text-teal-600" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* Code description */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h3 className="text-base font-medium text-gray-900">{codeExamples[activeTab].title}</h3>
            <p className="text-sm text-gray-500">{codeExamples[activeTab].description}</p>
          </div>
          <div className="flex mt-2 sm:mt-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              {codeExamples[activeTab].language}
            </span>
            <button 
              onClick={handleCopyCode}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {copySuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Code display */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm font-mono bg-gray-800 text-gray-200 h-full overflow-auto">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(codeExamples[activeTab].code, codeExamples[activeTab].language) }} />
        </pre>
      </div>
      
      {/* Action bar */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="text-gray-900 font-medium">{codeExamples[activeTab].language}</span> code example 
          • Last updated: <span className="italic">March 10, 2025</span>
        </div>
        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          <Play className="h-4 w-4 mr-1" />
          Run Code
        </button>
      </div>
    </div>
  );
};

export default CodeComponent;