import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../lib/supabase';
import { 
  MapIcon, 
  AdjustmentsHorizontalIcon,
  RectangleStackIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface GeoJSONData {
  type: "FeatureCollection";
  features: any[];
}

interface LayerConfig {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  type: 'administrative' | 'forest' | 'asset';
}

const Maps: React.FC = () => {
  // State management
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedForest, setSelectedForest] = useState('');
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Geographic data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forestData, setForestData] = useState<GeoJSONData | null>(null);
  
  // Filter options
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [forests, setForests] = useState<string[]>([]);
  
  // Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Layer configurations
  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: 'administrative', name: 'Administrative Boundary', color: '#3B82F6', visible: true, type: 'administrative' },
    { id: 'forest', name: 'Forest Areas', color: '#10B981', visible: true, type: 'forest' },
    { id: 'land-1', name: 'Land Part 1', color: '#FF6B6B', visible: false, type: 'land' },
    { id: 'land-2', name: 'Land Part 2', color: '#4ECDC4', visible: false, type: 'land' },
    { id: 'land-3', name: 'Land Part 3', color: '#45B7D1', visible: false, type: 'land' },
    { id: 'land-4', name: 'Land Part 4', color: '#96CEB4', visible: false, type: 'land' },
    { id: 'land-5', name: 'Land Part 5', color: '#FFEAA7', visible: false, type: 'land' },
    { id: 'land-6', name: 'Land Part 6', color: '#DDA0DD', visible: false, type: 'land' },
    { id: 'land-7', name: 'Land Part 7', color: '#98D8C8', visible: false, type: 'land' },
    { id: 'land-8', name: 'Land Part 8', color: '#F7DC6F', visible: false, type: 'land' },
    { id: 'land-9', name: 'Land Part 9', color: '#BB8FCE', visible: false, type: 'land' },
    { id: 'land-10', name: 'Land Part 10', color: '#85C1E9', visible: false, type: 'land' },
  ]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Hierarchical data structure
  const hierarchyData = {
    'MADHYA PRADESH': {
      'BALAGHAT': ['AGARWADA', 'AGRI', 'AMBEJHARI', 'AMGAHAN', 'AMGAON', 'ARAMBHA', 'AWLAJHARI', 'DEOGAON', 'MADI', 'UMRI'],
      'CHHINDWARA': ['AGRAPUR', 'AJANGAON', 'ALIWADA', 'ALMOD', 'AMABON', 'AMAKOL', 'AMARI', 'AMBAKUHI', 'DHANNOR', 'ITAWA'],
      'DINDORI': ['AJHWAR RYT', 'AKHDAR (AKHRAD) MAL', 'ALAUNI RYT', 'AMACHUHA', 'AMADONGRI MAL', 'AMAKHOH', 'AMAKHOH RYT', 'AMHAI DEORI RYT', 'ANAKHEDA RYT', 'ISHANPURA RYT'],
      'SEONI': ['AGARI', 'ALESUR', 'AMAI', 'AMAJHIRI', 'AMAKOLA', 'AMANALA', 'AMGAON', 'AMGARH', 'INDAWADI', 'ISHWARPUR']
    },
    'ODISHA': {
      'KANDHAMAL': ['BURADANGA', 'GIRITI', 'MATIKADA', 'MUNDAKURI', 'NILIGUDA', 'PANDAMAHA', 'RALDIPANKA', 'SAJELI', 'SANDHIMAHA', 'SHIKABADI'],
      'KORAPUT': ['AMPABALLI', 'ATANDA', 'BANGARUGUDI', 'DORASUBALAR', 'KONA', 'MALIBHIMDOLA', 'MALISUBULAR', 'PANABADI', 'SORADA', 'TUMBIGUDA'],
      'MALKANGIRI': ['ARABETI', 'BUDUGUDA', 'ESKAPALI', 'KANDHASUAPALI', 'LIMALORI', 'PUTUMPALI', 'SARADAGUDA', 'TAMANPALLI', 'TARLAKOTA', 'TENTALIGUDA'],
      'MAYURBHANJ': ['BAGHAMARA', 'DAUNDIA', 'DEBAGAN', 'JAIPURIA', 'JAMUDIHA', 'KARADAPAL', 'KUANRPAL', 'NIZKAINSARI', 'ORIAM', 'PURADIHI']
    },
    'TAMIL NADU': {
      'DHARMAPURI': ['AMMAPALAYAM', 'CHINNAMANJAVADI', 'ELANDAIKUTTAPATTY', 'KALLATTUPATTI', 'KOMBUR', 'KULLAMPATTY', 'MANGADE', 'MANJAVADI', 'NADUPATTI', 'NONANGANUR'],
      'ERODE': ['ANJUR', 'AVUDAYAPARAI', 'AYYAMPALAYAM', 'CHENNASAMUDRAM (TP)', 'DEVAKIAMMAPURAM', 'ELUNOOTHIMANGALAM', 'KODUMUDI (TP)', 'MURUNGIYAMPALAYAM', 'NAGAMANAICKENPALAYAM', 'VADIVULLAMANGALAM'],
      'KRISHNAGIRI': ['ETTIPATTI', 'HANUMANTHEERTHAM', 'KATTANUR', 'KOTTARAPATTI', 'MEYYANDAPATTI', 'NALLAVAMPATTI', 'ODDAPATTI', 'PONNAGARAPATTI', 'PUDUR', 'PULIYAMPATTI'],
      'THENI': ['ERASAKKANAYACKANUR HILLS', 'GUDALUR (M)', 'KAMAYAGOUNDANPATTI (TP)', 'KAMBAM (M)', 'MELAGUDALUR RF', 'NARAYANATHEVANPATTI', 'PUDUPATTI (TP)', 'ROYAPPANPATTI', 'SURANGANUR RF', 'SURULI RF']
    },
    'TELANGANA': {
      'ADILABAD': ['BANDEMREGAD', 'DHONNORA', 'HEERAPUR J', 'ISPUR', 'KORATKAL (BUZURG)', 'KORATKAL (KHURD)', 'LINGATLA', 'NARAYANAPUR', 'PEECHRA', 'WANKIDI'],
      'BHADRADRI KOTHAGUDEM': ['AKINEPALLE', 'GANESHPADU', 'GUNNEPALLE', 'MALLARAM', 'MANDALAPALLE', 'MODDULAGUDEM', 'NACHARAM', 'NAIDUPETA', 'SAYANARAOPALEM', 'VADLAGUDEM'],
      'KHAMMAM': ['CHILUKURU', 'GATLA GOWRARAM', 'JAMALAPURAM', 'KESIREDDIPALLE', 'PEGALLAPADU', 'RANGAGUDEM', 'REMIDICHERLA', 'TATIGUDEM', 'TRIPURARAM', 'YERRUPALEM'],
      'MULUGU': ['ALLIGUDEM', 'BOLLEPALLE (P.L)', 'CHINTALAKATAPUR', 'KONDAIGUDA', 'LINGALA', 'MOTLAGUDEM', 'NARSAPUR (P.L)', 'POCHA PALLE', 'RANGAPURAM (P.A)', 'VEERAPURAM']
    },
    'TRIPURA': {
      'GOMATI': ['DAKSHIN EKCHHARI', 'DAKSHIN KARBUK', 'DHUPTALI', 'GANGACHHARA', 'JITENDRANAGAR', 'PASCHIM KARBUK', 'PURBA MAGPUSHKARINI', 'PURBA MANIKYA DEWAN', 'RANI', 'TAIRBHUMA'],
      'NORTH TRIPURA': ['BANGLABARI', 'GACHIRAMPARA', 'KALAPANIA', 'LAMBACHHARA', 'PASCHIM TLANGSANBARI (PART)', 'RAMPRASAIPARA', 'SAILO', 'SUNITIPUR', 'TAIYANGPARA', 'TUICHHAMA'],
      'SOUTH TRIPURA': ['BIJOYNAGAR', 'CHALITACHHARA', 'CHATAKCHHARI', 'GAURIFA', 'GOACHAND', 'PASCHIM JALEFA (PART)', 'PASCHIM MUHURIPUR', 'PURBA JALEFA (PART)', 'PURBA LUDHUA', 'TUIGAMARI'],
      'WEST TRIPURA': ['BIKRAMNAGAR', 'JANMEJOYNAGAR', 'KANCHANMALA', 'KATHIRAMBARI', 'KUNJABAN', 'MADHUBAN (CT)', 'MADHUPUR (CT)', 'MANDAINAGAR', 'RADHAKISHORENAGAR (CT)', 'SRINAGAR']
    }
  };

  // Forest data structure
  const forestData_list = {
    'MADHYA PRADESH': ['ANAMALAI RANGE MP', 'BETLA BLOCK MP', 'BHADRA SECTOR MP', 'DUDHWA RANGE MP', 'KANHA SECTOR MP', 'KAZIRANGA PATCH MP', 'MANAS SECTOR MP', 'NAMERI PATCH MP', 'NILGIRI RANGE MP', 'PACHMARHI PATCH MP', 'PERIYAR BLOCK MP', 'SARANDA RANGE MP', 'SIMILIPAL BLOCK MP', 'SUNDARBAN PATCH MP'],
    'ODISHA': ['ANAMALAI RANGE O', 'BANDHAVGARH BLOCK O', 'BHADRA SECTOR O', 'BHITARKANIKA RANGE O', 'DUDHWA RANGE O', 'GIR RANGE O', 'KABINI BLOCK O', 'KANHA SECTOR O', 'MANAS SECTOR O', 'NAMERI PATCH O', 'NILGIRI RANGE O', 'PACHMARHI PATCH O', 'PALANI HILLS SECTOR O', 'PERIYAR BLOCK O', 'SARANDA RANGE O', 'SIMILIPAL BLOCK O'],
    'TAMIL NADU': ['ANAMALAI RANGE TN', 'BANDHAVGARH BLOCK TN', 'BHITARKANIKA RANGE TN', 'GIR RANGE TN', 'KABINI BLOCK TN', 'MANAS SECTOR TN', 'NILGIRI RANGE TN', 'PALANI HILLS SECTOR TN', 'PERIYAR BLOCK TN', 'SARANDA RANGE TN', 'SIMILIPAL BLOCK TN', 'SUNDARBAN PATCH TN'],
    'TELANGANA': ['ANAMALAI RANGE T', 'BANDHAVGARH BLOCK T', 'BETLA BLOCK T', 'BHADRA SECTOR T', 'BHITARKANIKA RANGE T', 'DUDHWA RANGE T', 'GIR RANGE T', 'KABINI BLOCK T', 'KANHA SECTOR T', 'KAZIRANGA PATCH T', 'MANAS SECTOR T', 'NAMERI PATCH T', 'SATPURA PATCH T', 'SUNDARBAN PATCH T'],
    'TRIPURA': ['BETLA BLOCK T', 'GIR RANGE T', 'KANHA SECTOR T', 'NAMERI PATCH T', 'PALANI HILLS SECTOR T', 'PERIYAR BLOCK T', 'SATPURA PATCH T', 'SUNDARBAN PATCH T']
  };

  // Initialize map
  useEffect(() => {
    if (mapboxToken && mapboxToken !== 'your_mapbox_access_token_here' && mapContainer.current && !map.current) {
      mapboxgl.accessToken = mapboxToken;
      
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [78.9629, 20.5937],
          zoom: 5
        });

        map.current.on('load', () => {
          setMapLoaded(true);
          setError(null);
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          setError('Failed to load map. Please check your internet connection and Mapbox token.');
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map. Please check your Mapbox token.');
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update map style when activeLayer changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      const mapStyles = {
        satellite: 'mapbox://styles/mapbox/satellite-v9',
        streets: 'mapbox://styles/mapbox/streets-v12',
        terrain: 'mapbox://styles/mapbox/outdoors-v12'
      };
      
      map.current.setStyle(mapStyles[activeLayer as keyof typeof mapStyles]);
    }
  }, [activeLayer, mapLoaded]);

  // Initialize states
  useEffect(() => {
    setStates(Object.keys(hierarchyData));
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (selectedState && hierarchyData[selectedState as keyof typeof hierarchyData]) {
      setDistricts(Object.keys(hierarchyData[selectedState as keyof typeof hierarchyData]));
      setForests(forestData_list[selectedState as keyof typeof forestData_list] || []);
      setSelectedDistrict('');
      setSelectedVillage('');
      setSelectedForest('');
    } else {
      setDistricts([]);
      setForests([]);
    }
  }, [selectedState]);

  // Update villages when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict && hierarchyData[selectedState as keyof typeof hierarchyData]) {
      const stateData = hierarchyData[selectedState as keyof typeof hierarchyData];
      setVillages(stateData[selectedDistrict as keyof typeof stateData] || []);
      setSelectedVillage('');
    } else {
      setVillages([]);
    }
  }, [selectedState, selectedDistrict]);

  // Fetch GeoJSON data from Supabase storage
  const fetchGeoJSON = useCallback(async (path: string): Promise<{ data: any | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.storage
        .from('maps-for-webgis')
        .download(path);

      if (error) {
        return { data: null, error: `Failed to fetch GeoJSON: ${error.message}` };
      }

      const text = await data.text();
      const geoJson = JSON.parse(text);
      
      return { data: geoJson, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GeoJSON data';
      console.error('Error fetching GeoJSON:', err);
      return { data: null, error: errorMessage };
    }
  }, []);

  // Add GeoJSON layer to map
  const addGeoJSONLayer = useCallback((data: GeoJSONData, layerId: string, color: string, visible: boolean = true) => {
    if (!map.current || !mapLoaded) return;

    // Remove existing layer if it exists
    if (map.current.getLayer(layerId + '-fill')) {
      map.current.removeLayer(layerId + '-fill');
    }
    if (map.current.getLayer(layerId + '-line')) {
      map.current.removeLayer(layerId + '-line');
    }
    if (map.current.getSource(layerId)) {
      map.current.removeSource(layerId);
    }

    // Add source
    map.current.addSource(layerId, {
      type: 'geojson',
      data: data
    });

    // Add fill layer
    map.current.addLayer({
      id: layerId + '-fill',
      type: 'fill',
      source: layerId,
      layout: {
        'visibility': visible ? 'visible' : 'none'
      },
      paint: {
        'fill-color': color,
        'fill-opacity': layerId === 'water' ? 0.7 : 0.3
      }
    });

    // Add line layer
    map.current.addLayer({
      id: layerId + '-line',
      type: 'line',
      source: layerId,
      layout: {
        'visibility': visible ? 'visible' : 'none'
      },
      paint: {
        'line-color': color,
        'line-width': layerId === 'water' ? 3 : 2,
        'line-opacity': layerId === 'water' ? 0.9 : 0.8
      }
    });
  }, [mapLoaded]);

  // Generate mock asset data for demonstration
  const generateAssetData = useCallback((assetType: string, baseCoords: [number, number]) => {
    const features = [];
    const numFeatures = Math.floor(Math.random() * 5) + 3; // 3-7 features
    
    for (let i = 0; i < numFeatures; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.1;
      const offsetLng = (Math.random() - 0.5) * 0.1;
      
      let geometry;
      if (assetType === 'water') {
        // Water bodies as polygons (lakes, ponds)
        const size = Math.random() * 0.02 + 0.005;
        geometry = {
          type: 'Polygon',
          coordinates: [[
            [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat],
            [baseCoords[0] + offsetLng + size, baseCoords[1] + offsetLat],
            [baseCoords[0] + offsetLng + size, baseCoords[1] + offsetLat + size],
            [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat + size],
            [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat]
          ]]
        };
      } else {
        // Other assets as polygons
        const size = Math.random() * 0.03 + 0.01;
        geometry = {
          type: 'Polygon',
          coordinates: [[
            [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat],
            [baseCoords[0] + offsetLng + size, baseCoords[1] + offsetLat],
            [baseCoords[0] + offsetLng + size, baseCoords[1] + offsetLat + size],
            [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat + size],
            [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat]
          ]]
        };
      }
      
      features.push({
        type: 'Feature',
        properties: {
          type: assetType,
          id: `${assetType}_${i + 1}`,
          area: Math.random() * 10 + 1
        },
        geometry
      });
    }
    
    return {
      type: 'FeatureCollection',
      features
    };
  }, []);

  // Load asset layers when administrative boundary is loaded
  useEffect(() => {
    if (selectedState && selectedDistrict && selectedVillage && map.current && mapLoaded) {
      // Load land parts when village is selected
      loadLandParts();
    }
  }, [selectedState, selectedDistrict, selectedVillage, mapLoaded]);

  // Load land parts from storage
  const loadLandParts = async () => {
    if (!selectedState || !selectedDistrict || !selectedVillage) return;
    
    for (let part = 1; part <= 10; part++) {
      const path = `LAND/${selectedState} ${selectedDistrict} ${selectedVillage} ${part}.geojson`;
      const result = await fetchGeoJSON(path);
      if (result.data) {
        const layer = layers.find(l => l.id === `land-${part}`);
        if (layer) {
          addGeoJSONLayer(result.data, `land-${part}`, layer.color, layer.visible);
        }
      } else if (result.error) {
        // Log error but don't show it to user for optional land parts
        console.warn(`Land part ${part} not found for ${selectedState} ${selectedDistrict} ${selectedVillage}:`, result.error);
      }
    }
  };

  // Handle state selection
  const handleStateChange = useCallback(async (state: string) => {
    setLoading(true);
    setError(null);
    setSelectedState(state);
    if (state) {
      const path = `STATE/${state}.geojson`;
      const result = await fetchGeoJSON(path);
      if (result.data) {
        setGeoJsonData(result.data);
        addGeoJSONLayer(data, 'administrative', '#3B82F6');
        addGeoJSONLayer(result.data, 'administrative', '#3B82F6');
        
        // Fit bounds to the data
        if (result.data.features && result.data.features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          result.data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
              });
            }
          });
          if (!bounds.isEmpty()) {
            map.current?.fitBounds(bounds, { padding: 50 });
          }
        }
      } else if (result.error) {
        setError(result.error);
        console.error('Error loading state data:', result.error);
      }
    } else {
      setGeoJsonData(null);
      if (map.current && map.current.getLayer('administrative-fill')) {
        map.current.removeLayer('administrative-fill');
        map.current.removeLayer('administrative-line');
        map.current.removeSource('administrative');
      }
    }
    setLoading(false);
  }, [fetchGeoJSON, addGeoJSONLayer]);

  // Handle district selection
  const handleDistrictChange = useCallback(async (district: string) => {
    setLoading(true);
    setError(null);
    setSelectedDistrict(district);
    if (selectedState && district) {
      const path = `DISTRICT/${selectedState} ${district}.geojson`;
      const result = await fetchGeoJSON(path);
      if (result.data) {
        setGeoJsonData(result.data);
        addGeoJSONLayer(result.data, 'administrative', '#3B82F6');
        
        // Fit bounds to the data
        if (result.data.features && result.data.features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          result.data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
              });
            }
          });
          if (!bounds.isEmpty()) {
            map.current?.fitBounds(bounds, { padding: 50 });
          }
        }
      } else if (result.error) {
        setError(result.error);
        console.error('Error loading district data:', result.error);
      }
    }
    setLoading(false);
  }, [selectedState, fetchGeoJSON, addGeoJSONLayer]);

  // Handle village selection
  const handleVillageChange = useCallback(async (village: string) => {
    setLoading(true);
    setError(null);
    setSelectedVillage(village);
    if (selectedState && selectedDistrict && village) {
      const path = `VILLAGE/${selectedState} ${selectedDistrict} ${village}.geojson`;
      const result = await fetchGeoJSON(path);
      if (result.data) {
        setGeoJsonData(result.data);
        addGeoJSONLayer(result.data, 'administrative', '#3B82F6');
        
        // Fit bounds to the data
        if (result.data.features && result.data.features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          result.data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
              });
            }
          });
          if (!bounds.isEmpty()) {
            map.current?.fitBounds(bounds, { padding: 50 });
          }
        }
      } else if (result.error) {
        setError(result.error);
        console.error('Error loading village data:', result.error);
      }
    }
    setLoading(false);
  }, [selectedState, selectedDistrict, fetchGeoJSON, addGeoJSONLayer]);

  // Handle forest selection
  const handleForestChange = useCallback(async (forest: string) => {
    setLoading(true);
    setError(null);
    setSelectedForest(forest);
    if (selectedState && forest) {
      const path = `FOREST/${selectedState} ${forest}.geojson`;
      const result = await fetchGeoJSON(path);
      if (result.data) {
        setForestData(result.data);
        addGeoJSONLayer(result.data, 'forest', '#10B981');
        
        // Fit bounds to the data
        if (result.data.features && result.data.features.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          result.data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
              });
            }
          });
          if (!bounds.isEmpty()) {
            map.current?.fitBounds(bounds, { padding: 50 });
          }
        }
      } else if (result.error) {
        setError(result.error);
        console.error('Error loading forest data:', result.error);
      }
    }
    setLoading(false);
  }, [selectedState, fetchGeoJSON, addGeoJSONLayer]);

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
    
    // Update map layer visibility
    if (map.current && mapLoaded) {
      const layer = layers.find(l => l.id === layerId);
      if (layer) {
        const newVisibility = !layer.visible;
        
        if (map.current.getLayer(layerId + '-fill')) {
          map.current.setLayoutProperty(layerId + '-fill', 'visibility', newVisibility ? 'visible' : 'none');
        }
        if (map.current.getLayer(layerId + '-line')) {
          map.current.setLayoutProperty(layerId + '-line', 'visibility', newVisibility ? 'visible' : 'none');
        }
      }
    }
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedVillage('');
    setSelectedForest('');
    setGeoJsonData(null);
    setForestData(null);
    
    // Reset map view
    if (map.current) {
      map.current.flyTo({
        center: [78.9629, 20.5937],
        zoom: 5
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FRA Atlas WebGIS Portal</h1>
          <p className="text-gray-600">Interactive mapping of Forest Rights Act areas with real-time data visualization</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Administrative Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Administrative Filters</h2>
              </div>

              <div className="space-y-4">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!selectedState}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Village Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                  <select
                    value={selectedVillage}
                    onChange={(e) => handleVillageChange(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Village</option>
                    {villages.map((village) => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Forest Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Forest Areas</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forest Range/Block</label>
                <select
                  value={selectedForest}
                  onChange={(e) => handleForestChange(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Forest Area</option>
                  {forests.map((forest) => (
                    <option key={forest} value={forest}>{forest}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Mapping Layers</h3>
              <div className="space-y-3">
                {layers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{layer.name}</span>
                    </div>
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      {layer.visible ? (
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Layer Types:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Administrative: State/District/Village boundaries</div>
                  <div>• Forest Areas: Forest ranges and blocks</div>
                  <div>• Land Parts: Village land divisions (1-10)</div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <button 
              onClick={clearSelections}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>

          {/* Map Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Map Controls */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RectangleStackIcon className="h-4 w-4 text-gray-600" />
                    <select 
                      value={activeLayer}
                      onChange={(e) => setActiveLayer(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="satellite">Satellite</option>
                      <option value="streets">Streets</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>
                  {loading && (
                    <div className="flex items-center text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading map data...
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                    {error}
                  </div>
                )}
              </div>

              {/* Map Container */}
              <div className="h-[600px] lg:h-[700px] relative">
                {mapboxToken ? (
                  <>
                    <div ref={mapContainer} className="w-full h-full" />
                    
                    {/* Map Info Overlay */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Current Selection</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {selectedState && <p><strong>State:</strong> {selectedState}</p>}
                        {selectedDistrict && <p><strong>District:</strong> {selectedDistrict}</p>}
                        {selectedVillage && <p><strong>Village:</strong> {selectedVillage}</p>}
                        {selectedForest && <p><strong>Forest:</strong> {selectedForest}</p>}
                        {!selectedState && <p>Select a state to begin mapping</p>}
                        {geoJsonData && <p><strong>Data loaded:</strong> {geoJsonData.features.length} features</p>}
                        {forestData && <p><strong>Forest data:</strong> {forestData.features.length} features</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                    <div className="text-center">
                      <MapIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">FRA Asset Mapping</h3>
                      {!mapboxToken || mapboxToken === 'your_mapbox_access_token_here' ? (
                        <p className="text-sm text-gray-500">
                          Please add your Mapbox API key to .env file as VITE_MAPBOX_ACCESS_TOKEN
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Initializing map...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Maps;

// kamalasudha
// kamal dhrogi