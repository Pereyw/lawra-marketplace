/**
 * Geolocation Utility
 * Handles distance calculations and nearby search using Haversine formula
 */

class GeolocationUtil {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in kilometers
   *
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinates(lat, lon) {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  /**
   * Get bounding box for a radius around a point
   * Useful for database queries
   *
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Object} Bounding box { minLat, maxLat, minLon, maxLon }
   */
  static getBoundingBox(lat, lon, radiusKm) {
    // Approximate conversion (varies by latitude)
    const latChange = radiusKm / 111;
    const lonChange = radiusKm / (111 * Math.cos(this.toRad(lat)));

    return {
      minLat: lat - latChange,
      maxLat: lat + latChange,
      minLon: lon - lonChange,
      maxLon: lon + lonChange
    };
  }

  /**
   * Filter results by distance
   */
  static filterByDistance(centerLat, centerLon, results, maxDistanceKm) {
    return results.filter((item) => {
      const distance = this.calculateDistance(
        centerLat,
        centerLon,
        item.location_lat,
        item.location_lng
      );
      return distance <= maxDistanceKm;
    });
  }

  /**
   * Sort results by distance
   */
  static sortByDistance(centerLat, centerLon, results) {
    return results.sort((a, b) => {
      const distA = this.calculateDistance(
        centerLat,
        centerLon,
        a.location_lat,
        a.location_lng
      );
      const distB = this.calculateDistance(
        centerLat,
        centerLon,
        b.location_lat,
        b.location_lng
      );
      return distA - distB;
    });
  }

  /**
   * Add distance to results
   */
  static addDistanceToResults(centerLat, centerLon, results) {
    return results.map((item) => ({
      ...item,
      distance: this.calculateDistance(
        centerLat,
        centerLon,
        item.location_lat,
        item.location_lng
      )
    }));
  }
}

module.exports = GeolocationUtil;
