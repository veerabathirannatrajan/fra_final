import json
import math
import requests
from PIL import Image, ImageDraw
import io
from typing import List, Tuple
import numpy as np
from sklearn.cluster import DBSCAN
import cv2
import concurrent.futures
import time

class VillageMapCropper:
    def __init__(self, max_workers=8):
        # OpenStreetMap tile server (free to use)
        self.tile_server = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        self.max_workers = max_workers
        self.session = requests.Session()  # Reuse connection
        
        # Add headers to avoid rate limiting
        self.session.headers.update({
            'User-Agent': 'VillageMapCropper/1.0 (Educational Purpose)',
            'Accept': 'image/png',
            'Connection': 'keep-alive'
        })
        
    def deg2num(self, lat_deg: float, lon_deg: float, zoom: int) -> Tuple[int, int]:
        """Convert lat/lon to tile numbers"""
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        xtile = int((lon_deg + 180.0) / 360.0 * n)
        ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return (xtile, ytile)
    
    def num2deg(self, xtile: int, ytile: int, zoom: int) -> Tuple[float, float]:
        """Convert tile numbers to lat/lon"""
        n = 2.0 ** zoom
        lon_deg = xtile / n * 360.0 - 180.0
        lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
        lat_deg = math.degrees(lat_rad)
        return (lat_deg, lon_deg)
    
    def get_bbox_from_geojson(self, geojson: dict) -> Tuple[float, float, float, float]:
        """Extract bounding box from GeoJSON polygon"""
        coordinates = geojson['geometry']['coordinates'][0]
        lats = [coord[1] for coord in coordinates]
        lons = [coord[0] for coord in coordinates]
        return min(lats), min(lons), max(lats), max(lons)
    
    def latlon_to_pixel(self, lat: float, lon: float, zoom: int, 
                       min_tile_x: int, min_tile_y: int) -> Tuple[int, int]:
        """Convert lat/lon to pixel coordinates in the stitched image"""
        tile_x, tile_y = self.deg2num(lat, lon, zoom)
        
        # Get the exact position within the tile
        n = 2.0 ** zoom
        x_exact = (lon + 180.0) / 360.0 * n
        lat_rad = math.radians(lat)
        y_exact = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
        
        # Convert to pixel coordinates
        pixel_x = int((x_exact - min_tile_x) * 256)
        pixel_y = int((y_exact - min_tile_y) * 256)
        
        return pixel_x, pixel_y
    
    def download_tile(self, x: int, y: int, z: int) -> Image.Image:
        """Download a single map tile with optimization"""
        url = self.tile_server.format(z=z, x=x, y=y)
        
        try:
            response = self.session.get(url, timeout=5)  # Reduced timeout
            response.raise_for_status()
            return Image.open(io.BytesIO(response.content))
        except Exception as e:
            print(f"Error downloading tile {x}/{y}/{z}: {e}")
            # Return a blank tile if download fails
            return Image.new('RGB', (256, 256), color='lightgray')
    
    def download_tiles_parallel(self, tile_coords: List[Tuple[int, int, int]]) -> dict:
        """Download multiple tiles in parallel"""
        tiles = {}
        
        def download_single_tile(coord):
            x, y, z = coord
            tile = self.download_tile(x, y, z)
            return (x, y), tile
        
        print(f"Downloading {len(tile_coords)} tiles in parallel...")
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_coord = {executor.submit(download_single_tile, coord): coord for coord in tile_coords}
            
            completed = 0
            for future in concurrent.futures.as_completed(future_to_coord):
                (x, y), tile = future.result()
                tiles[(x, y)] = tile
                completed += 1
                
                # Progress indicator
                if completed % max(1, len(tile_coords) // 10) == 0:
                    progress = (completed / len(tile_coords)) * 100
                    print(f"Progress: {progress:.1f}% ({completed}/{len(tile_coords)})")
        
        download_time = time.time() - start_time
        print(f"Downloaded {len(tile_coords)} tiles in {download_time:.2f} seconds")
        return tiles
    
    def pixel_to_latlon(self, pixel_x: int, pixel_y: int, zoom: int,
                      min_tile_x: int, min_tile_y: int) -> Tuple[float, float]:
        """Convert pixel coordinates back to lat/lon"""
        # Convert pixel to exact tile coordinates
        tile_x_exact = min_tile_x + (pixel_x / 256.0)
        tile_y_exact = min_tile_y + (pixel_y / 256.0)
        
        # Convert to lat/lon
        n = 2.0 ** zoom
        lon = tile_x_exact / n * 360.0 - 180.0
        lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * tile_y_exact / n)))
        lat = math.degrees(lat_rad)
        
        return lat, lon
    
    def detect_blue_polygons(self, image: Image.Image, zoom: int,
                           min_tile_x: int, min_tile_y: int, debug_mode: bool = False) -> List[dict]:
        """Detect blue polygons in the map image and convert to GeoJSON (optimized)"""
        print("Processing image for blue detection...")
        start_time = time.time()
        
        # Convert PIL image to OpenCV format
        img_array = np.array(image.convert('RGB'))
        img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        if debug_mode:
            cv2.imwrite('debug_original_image.png', img_cv)
            print(f"Original image size: {img_cv.shape}")
        
        # Optimized blue detection - use fewer ranges for speed
        hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        
        # Reduced to 3 most effective blue ranges for speed
        blue_ranges = [
            # Standard water blue
            ([100, 50, 50], [130, 255, 255]),
            # Light blue / cyan  
            ([80, 50, 100], [110, 255, 255]),
            # River blue
            ([90, 30, 100], [120, 200, 255])
        ]
        
        # Combine all blue masks efficiently
        combined_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        
        for i, (lower, upper) in enumerate(blue_ranges):
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            combined_mask = cv2.bitwise_or(combined_mask, mask)
        
        # Add RGB backup detection (simplified)
        rgb_mask = cv2.inRange(img_array, np.array([0, 100, 150]), np.array([100, 200, 255]))
        combined_mask = cv2.bitwise_or(combined_mask, rgb_mask)
        
        if debug_mode:
            cv2.imwrite('debug_combined_blue_mask.png', combined_mask)
            print(f"Total blue pixels found: {np.sum(combined_mask > 0)}")
        
        # Optimized morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if debug_mode:
            print(f"Found {len(contours)} contours")
            contour_image = img_cv.copy()
            cv2.drawContours(contour_image, contours, -1, (0, 255, 0), 2)
            cv2.imwrite('debug_contours.png', contour_image)
        
        blue_polygons = []
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            
            if area < 30:  # Even lower threshold for speed
                continue
            
            # More aggressive simplification for speed
            epsilon = 0.01 * cv2.arcLength(contour, True)
            simplified_contour = cv2.approxPolyDP(contour, epsilon, True)
            
            # Convert to lat/lon
            coordinates = []
            for point in simplified_contour:
                pixel_x, pixel_y = point[0][0], point[0][1]
                lat, lon = self.pixel_to_latlon(pixel_x, pixel_y, zoom, min_tile_x, min_tile_y)
                coordinates.append([lon, lat])
            
            if len(coordinates) > 2:
                coordinates.append(coordinates[0])
                
                polygon_geojson = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [coordinates]
                    },
                    "properties": {
                        "id": i + 1,
                        "type": "blue_polygon",
                        "area_pixels": int(area),
                        "detected_from": "map_analysis",
                        "coordinate_count": len(coordinates)
                    }
                }
                blue_polygons.append(polygon_geojson)
        
        processing_time = time.time() - start_time
        print(f"Blue polygon detection completed in {processing_time:.2f} seconds")
        return blue_polygons
    
    def detect_blue_rgb(self, img_array: np.ndarray) -> np.ndarray:
        """Backup RGB-based blue detection"""
        # Define blue color ranges in RGB
        blue_ranges_rgb = [
            # Standard water blue
            ([0, 100, 150], [100, 180, 255]),
            # Light blue
            ([100, 150, 200], [180, 200, 255]),
            # Dark blue
            ([0, 50, 100], [80, 120, 200]),
            # Cyan-ish blue
            ([0, 150, 150], [120, 255, 255])
        ]
        
        combined_mask = np.zeros(img_array.shape[:2], dtype=np.uint8)
        
        for lower, upper in blue_ranges_rgb:
            lower_rgb = np.array(lower)
            upper_rgb = np.array(upper)
            mask = cv2.inRange(img_array, lower_rgb, upper_rgb)
            combined_mask = cv2.bitwise_or(combined_mask, mask)
        
        return combined_mask
    
    def point_in_polygon(self, point: Tuple[float, float], polygon: List[Tuple[float, float]]) -> bool:
        """Check if a point is inside a polygon using ray casting algorithm"""
        x, y = point
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        
        return inside
    
    def polygon_intersects_village(self, blue_polygon_coords: List[List[float]], 
                                 village_coords: List[List[float]]) -> bool:
        """Check if blue polygon intersects with village boundary"""
        # Convert to tuples for easier processing
        village_poly = [(coord[0], coord[1]) for coord in village_coords[:-1]]  # Remove last duplicate point
        blue_poly = [(coord[0], coord[1]) for coord in blue_polygon_coords[:-1]]  # Remove last duplicate point
        
        # Check if any vertex of blue polygon is inside village
        for point in blue_poly:
            if self.point_in_polygon(point, village_poly):
                return True
        
        # Check if any vertex of village is inside blue polygon
        for point in village_poly:
            if self.point_in_polygon(point, blue_poly):
                return True
        
        # Check if blue polygon center is inside village (additional safety check)
        if blue_poly:
            center_lon = sum(p[0] for p in blue_poly) / len(blue_poly)
            center_lat = sum(p[1] for p in blue_poly) / len(blue_poly)
            if self.point_in_polygon((center_lon, center_lat), village_poly):
                return True
        
        return False
    
    def filter_blue_polygons_within_village(self, blue_polygons: List[dict], 
                                          village_geojson: dict) -> List[dict]:
        """Filter blue polygons to only include those within village boundary (optimized)"""
        if not blue_polygons:
            return []
            
        village_coords = village_geojson['geometry']['coordinates'][0]
        filtered_polygons = []
        
        print(f"Filtering {len(blue_polygons)} blue polygons...")
        
        # Pre-calculate village bounding box for quick elimination
        village_lats = [coord[1] for coord in village_coords]
        village_lons = [coord[0] for coord in village_coords]
        village_min_lat, village_max_lat = min(village_lats), max(village_lats)
        village_min_lon, village_max_lon = min(village_lons), max(village_lons)
        
        for i, polygon in enumerate(blue_polygons):
            blue_coords = polygon['geometry']['coordinates'][0]
            
            # Quick bounding box check first
            blue_lats = [coord[1] for coord in blue_coords]
            blue_lons = [coord[0] for coord in blue_coords]
            blue_center_lat = sum(blue_lats) / len(blue_lats)
            blue_center_lon = sum(blue_lons) / len(blue_lons)
            
            # Quick elimination: if center is completely outside village bbox, skip detailed check
            if (blue_center_lat < village_min_lat or blue_center_lat > village_max_lat or
                blue_center_lon < village_min_lon or blue_center_lon > village_max_lon):
                print(f"✗ Blue polygon {i+1}: OUTSIDE village boundary (quick check)")
                continue
            
            # Detailed intersection check only for polygons that pass bbox test
            is_within = self.polygon_intersects_village(blue_coords, village_coords)
            
            if is_within:
                polygon['properties']['within_village'] = True
                filtered_polygons.append(polygon)
                print(f"✓ Blue polygon {i+1}: INSIDE village boundary")
            else:
                print(f"✗ Blue polygon {i+1}: OUTSIDE village boundary")
        
        print(f"Filtered result: {len(filtered_polygons)} blue polygons within village boundary")
        return filtered_polygons
    def compare_with_village_boundary(self, blue_polygons: List[dict], 
                                    village_geojson: dict) -> dict:
        """Compare detected blue polygons with village boundary (all should be within now)"""
        village_coords = village_geojson['geometry']['coordinates'][0]
        
        # Calculate village area (approximate)
        village_lats = [coord[1] for coord in village_coords]
        village_lons = [coord[0] for coord in village_coords]
        village_bbox_area = (max(village_lats) - min(village_lats)) * (max(village_lons) - min(village_lons))
        
        comparison_results = {
            "village_info": {
                "name": village_geojson.get('properties', {}).get('name', 'Unknown'),
                "bbox_area": village_bbox_area,
                "coordinate_count": len(village_coords)
            },
            "blue_polygons_count": len(blue_polygons),
            "blue_polygons": [],
            "analysis": {
                "polygons_within_village": len(blue_polygons),  # All should be within now
                "polygons_outside_village": 0,  # Should be 0 after filtering
                "polygons_overlapping": 0,
                "total_blue_area": 0.0
            }
        }
        
        total_area = 0.0
        
        for i, polygon in enumerate(blue_polygons):
            blue_coords = polygon['geometry']['coordinates'][0]
            blue_lats = [coord[1] for coord in blue_coords]
            blue_lons = [coord[0] for coord in blue_coords]
            
            # Calculate blue polygon center and area
            blue_center_lat = sum(blue_lats) / len(blue_lats)
            blue_center_lon = sum(blue_lons) / len(blue_lons)
            blue_area = (max(blue_lats) - min(blue_lats)) * (max(blue_lons) - min(blue_lons))
            total_area += blue_area
            
            polygon_info = {
                "id": i + 1,
                "relationship_to_village": "within",  # All should be within after filtering
                "center_coordinates": [blue_center_lon, blue_center_lat],
                "bbox_area": blue_area,
                "area_pixels": polygon['properties'].get('area_pixels', 0),
                "geojson": polygon
            }
            
            comparison_results["blue_polygons"].append(polygon_info)
        
        comparison_results["analysis"]["total_blue_area"] = total_area
        
        return comparison_results
        """Create a mask from polygon coordinates"""
        mask = Image.new('L', image_size, 0)
        draw = ImageDraw.Draw(mask)
        draw.polygon(polygon_pixels, fill=255)
        return mask
    
    def create_polygon_mask(self, image_size: Tuple[int, int], 
                           polygon_pixels: List[Tuple[int, int]]) -> Image.Image:
        """Create a mask from polygon coordinates"""
        mask = Image.new('L', image_size, 0)
        draw = ImageDraw.Draw(mask)
        draw.polygon(polygon_pixels, fill=255)
        return mask
    
    def crop_map_to_village(self, geojson_file: str, zoom: int = 15) -> Tuple[Image.Image, dict, dict, int, int]:
        """Main function to crop map to village boundary and detect blue polygons"""
        """Main function to crop map to village boundary"""
        # Load GeoJSON
        with open(geojson_file, 'r') as f:
            geojson = json.load(f)
        
        if geojson['type'] == 'FeatureCollection':
            geojson = geojson['features'][0]
        
        # Get bounding box
        min_lat, min_lon, max_lat, max_lon = self.get_bbox_from_geojson(geojson)
        
        # Calculate village size
        lat_span = max_lat - min_lat
        lon_span = max_lon - min_lon
        
        print(f"Village bounding box: {min_lat:.6f}, {min_lon:.6f} to {max_lat:.6f}, {max_lon:.6f}")
        print(f"Village size: {lat_span:.6f} lat x {lon_span:.6f} lon")
        
        # Add intelligent padding - ensure minimum size and reasonable padding
        min_padding_lat = 0.005  # Minimum padding in degrees (~500m)
        min_padding_lon = 0.005
        
        # Use larger of: 50% of village size or minimum padding
        lat_padding = max(lat_span * 0.5, min_padding_lat)
        lon_padding = max(lon_span * 0.5, min_padding_lon)
        
        # Apply padding
        min_lat -= lat_padding
        max_lat += lat_padding
        min_lon -= lon_padding
        max_lon += lon_padding
        
        print(f"After padding: {min_lat:.6f}, {min_lon:.6f} to {max_lat:.6f}, {max_lon:.6f}")
        print(f"Padded size: {max_lat - min_lat:.6f} lat x {max_lon - min_lon:.6f} lon")
        
        # Get tile coordinates
        min_tile_x, max_tile_y = self.deg2num(min_lat, min_lon, zoom)
        max_tile_x, min_tile_y = self.deg2num(max_lat, max_lon, zoom)
        
        print(f"Downloading tiles from ({min_tile_x},{min_tile_y}) to ({max_tile_x},{max_tile_y})")
        
        # Calculate image dimensions
        width = (max_tile_x - min_tile_x + 1) * 256
        height = (max_tile_y - min_tile_y + 1) * 256
        
        print(f"Image dimensions: {width} x {height} pixels")
        print(f"Tiles needed: {max_tile_x - min_tile_x + 1} x {max_tile_y - min_tile_y + 1}")
        
        # Ensure minimum image size
        if width < 512 or height < 512:
            print(f"Warning: Image size ({width}x{height}) is very small. Consider using higher zoom level.")
            print("Recommendation: Try zoom=17 or zoom=18 for small villages")
        
        # Prepare tile coordinates for parallel download
        tile_coords = []
        for x in range(min_tile_x, max_tile_x + 1):
            for y in range(min_tile_y, max_tile_y + 1):
                tile_coords.append((x, y, zoom))
        
        # Download all tiles in parallel
        tiles = self.download_tiles_parallel(tile_coords)
        
        # Create the stitched image
        print("Stitching tiles...")
        stitched = Image.new('RGB', (width, height))
        
        for x in range(min_tile_x, max_tile_x + 1):
            for y in range(min_tile_y, max_tile_y + 1):
                if (x, y) in tiles:
                    paste_x = (x - min_tile_x) * 256
                    paste_y = (y - min_tile_y) * 256
                    stitched.paste(tiles[(x, y)], (paste_x, paste_y))
        
        print("Tile stitching completed")
        
        # Detect blue polygons BEFORE cropping
        print("Detecting blue polygons...")
        all_blue_polygons = self.detect_blue_polygons(stitched, zoom, min_tile_x, min_tile_y, debug_mode=False)  # Disable debug for speed
        print(f"Found {len(all_blue_polygons)} total blue polygons")
        
        # Filter blue polygons to only those within village boundary
        print("Filtering polygons within village boundary...")
        filter_start = time.time()
        blue_polygons = self.filter_blue_polygons_within_village(all_blue_polygons, geojson)
        filter_time = time.time() - filter_start
        print(f"Filtering completed in {filter_time:.2f} seconds")
        
        # Compare with village boundary (using filtered polygons)
        comparison_results = self.compare_with_village_boundary(blue_polygons, geojson)
        
        # Convert polygon coordinates to pixel coordinates for cropping
        coordinates = geojson['geometry']['coordinates'][0]
        polygon_pixels = []
        
        for coord in coordinates:
            lon, lat = coord[0], coord[1]
            pixel_x, pixel_y = self.latlon_to_pixel(lat, lon, zoom, min_tile_x, min_tile_y)
            polygon_pixels.append((pixel_x, pixel_y))
        
        # Create mask and apply it
        mask = self.create_polygon_mask((width, height), polygon_pixels)
        
        # Create transparent background
        result = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        stitched_rgba = stitched.convert('RGBA')
        
        # Apply mask
        result.paste(stitched_rgba, mask=mask)
        
        # Crop to the actual polygon bounds
        mask_array = np.array(mask)
        coords = np.column_stack(np.where(mask_array > 0))
        
        if len(coords) > 0:
            min_y, min_x = coords.min(axis=0)
            max_y, max_x = coords.max(axis=0)
            result = result.crop((min_x, min_y, max_x + 1, max_y + 1))
        
        return result, blue_polygons, comparison_results, min_tile_x, min_tile_y
    
    def save_village_map_with_analysis(self, geojson_file: str, output_file: str = "village_map.png", 
                                     zoom: int = 15):
        """Save the cropped village map and analyze blue polygons (optimized)"""
        overall_start = time.time()
        
        try:
            result, blue_polygons, comparison_results, min_tile_x, min_tile_y = self.crop_map_to_village(geojson_file, zoom)
            
            # Save the cropped village map
            print("Saving village map...")
            result.save(output_file, 'PNG')
            print(f"Village map saved as {output_file}")
            
            # Save results efficiently
            if blue_polygons:
                print("Saving blue polygon results...")
                
                # Save all blue polygons as one GeoJSON collection
                blue_collection = {
                    "type": "FeatureCollection",
                    "features": blue_polygons,
                    "properties": {
                        "source": "detected_from_map_within_village",
                        "total_polygons": len(blue_polygons),
                        "detection_zoom_level": zoom,
                        "filtered": "only_within_village_boundary"
                    }
                }
                
                with open('blue_polygons_within_village.geojson', 'w') as f:
                    json.dump(blue_collection, f, indent=2)
                
                # Save individual polygons (optional - can be disabled for speed)
                # for i, polygon in enumerate(blue_polygons):
                #     filename = f'blue_polygon_within_village_{i+1}.geojson'
                #     with open(filename, 'w') as f:
                #         json.dump(polygon, f, indent=2)
                
                print(f"Saved {len(blue_polygons)} blue polygons to 'blue_polygons_within_village.geojson'")
            else:
                print("No blue polygons found within the village boundary.")
            
            # Save comparison analysis
            with open('blue_polygons_within_village_analysis.json', 'w') as f:
                json.dump(comparison_results, f, indent=2)
            
            overall_time = time.time() - overall_start
            
            # Print optimized summary
            print(f"\n=== COMPLETED IN {overall_time:.2f} SECONDS ===")
            print(f"Village: {comparison_results['village_info']['name']}")
            print(f"Blue polygons found within village: {comparison_results['blue_polygons_count']}")
            
            if comparison_results['blue_polygons_count'] > 0:
                print(f"Total blue area: {comparison_results['analysis']['total_blue_area']:.8f}")
                print("✓ Files generated:")
                print(f"  - {output_file}")
                print("  - blue_polygons_within_village.geojson")
                print("  - blue_polygons_within_village_analysis.json")
            
            return output_file, blue_polygons, comparison_results
            
        except Exception as e:
            print(f"Error creating village map with analysis: {e}")
            return None, [], {}, f"Polygons found within village: {comparison_results['blue_polygons_count']}"

            #return None, [], {}ons found within village: {comparison_results['blue_polygons_count']}")
            print(f"Total blue area within village: {comparison_results['analysis']['total_blue_area']:.8f}")
            
            if comparison_results['blue_polygons_count'] > 0:
                print("\nBlue polygon details (all within village boundary):")
                for poly in comparison_results['blue_polygons']:
                    print(f"  Polygon {poly['id']}:")
                    print(f"    Center: {poly['center_coordinates']}")
                    print(f"    Area: {poly['bbox_area']:.8f}")
                    print(f"    Pixel area: {poly['area_pixels']} pixels")
            else:
                print("\nNo blue polygons found within the village boundary.")
                print("This could mean:")
                print("  - No water bodies/rivers within village limits")
                print("  - Blue features too small to detect")
                print("  - Different blue color shade than expected")
            
            return output_file, blue_polygons, comparison_results
            
        except Exception as e:
            print(f"Error creating village map with analysis: {e}")
            return None, [], {}
    
    def save_village_map(self, geojson_file: str, output_file: str = "village_map.png", zoom: int = 15):
        """Legacy method for backward compatibility"""
        result_file, _, _ = self.save_village_map_with_analysis(geojson_file, output_file, zoom)
        return result_file

# Example usage
if __name__ == "__main__":
    # Create cropper instance
    cropper = VillageMapCropper()
    
    # Update the path to your specific file
    geojson_file_path = r"D:\selected_maps_for_SIH\splitted_villages\MADHYA PRADESH BALAGHAT AGARWADA.geojson"
    
    # METHOD 2: Create GeoJSON from coordinates (if you don't have a file)
    # Replace these coordinates with your actual village boundary coordinates
    your_village_geojson = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[7
                [77.4126, 11.0168],  # Replace with your village coordinates
                [77.4136, 11.0168],  # [longitude, latitude] format
                [77.4136, 11.0178],
                [77.4126, 11.0178],
                [77.4126, 11.0168]
            ]]
        },
        "properties": {
            "name": "Your Village Name"
        }
    }
    
    # Save your GeoJSON to a file
    with open('my_village.geojson', 'w') as f:
        json.dump(your_village_geojson, f)
    
    # METHOD 3: Specify the exact file path where your GeoJSON is located
    # Examples of different file paths:
    
    # If file is in the same folder as the script:
    # geojson_file_path = 'village.geojson'
    
    # If file is in a different folder:
    # geojson_file_path = '/home/user/maps/village.geojson'  # Linux/Mac
    # geojson_file_path = 'C:\\Users\\YourName\\Documents\\village.geojson'  # Windows
    
    # If you created the GeoJSON above, use this:
    geojson_file_path = r"D:\selected_maps_for_SIH\splitted_villages\TAMIL NADU THENI ROYAPPANPATTI.geojson"
    
    # Generate the map
    print("Generating village map...")
    output_file = cropper.save_village_map(geojson_file_path, 'village_map.png', zoom=16)
    
    if output_file:
        print(f"Success! Village map saved as {output_file}")
    else:
        print("Failed to generate village map")

# HOW TO USE:
# 1. Save your village boundary as a .geojson file
# 2. Update the 'geojson_file_path' variable above with your file's location
# 3. Run this script

# Installation requirements:
# pip install Pillow requests numpy