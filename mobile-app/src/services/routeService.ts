interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export const RouteService = {
  // Decode Google polyline format
  decodePolyline(encoded: string): RouteCoordinate[] {
    const points: RouteCoordinate[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b: number;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  },

  // Get route from Google Directions API
  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    apiKey: string
  ): Promise<RouteCoordinate[] | null> {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.lat},${origin.lng}` +
        `&destination=${destination.lat},${destination.lng}` +
        `&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data?.status === 'OK' && Array.isArray(data.routes) && data.routes.length > 0) {
        const route = data.routes[0];
        const polyline = route?.overview_polyline?.points;
        if (typeof polyline === 'string' && polyline.length > 0) {
          return this.decodePolyline(polyline);
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  },
};

export const getRoute = RouteService.getRoute;
export const decodePolyline = RouteService.decodePolyline;

