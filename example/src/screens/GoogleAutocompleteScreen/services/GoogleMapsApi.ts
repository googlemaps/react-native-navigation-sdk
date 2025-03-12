import Config from 'react-native-config';
import type { GoogleDetail } from '../types/GoogleDetail';
import type { GooglePlace } from '../types/GooglePlace';

const createRequestURL = (
  url: string,
  params: Record<string, string>
): string => {
  let resultUrl = url;
  Object.entries(params).forEach(([key, value], index) => {
    resultUrl += `${index === 0 ? '?' : '&'}${key}=${value}`;
  });
  return resultUrl;
};

const API_KEY = Config.MAPS_API_KEY;
if (!API_KEY) {
  throw new Error('[GoogleMapsApi] API_KEY is not set');
}

type ApiResponse<T> = T;

const fetchGoogleMapsApi = <T>(
  endpoint: string,
  params: Record<string, string | number>
): Promise<ApiResponse<T>> => {
  const url = createRequestURL(
    `https://maps.googleapis.com/maps/api/${endpoint}`,
    {
      ...params,
      key: API_KEY,
    }
  );
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      throw new Error(`Failed to fetch data from Google Maps API: ${error}`);
    });
};

const getDetailFromPlaceId = (placeId: string): Promise<GoogleDetail> => {
  return fetchGoogleMapsApi<{
    result: GoogleDetail;
  }>('place/details/json', {
    place_id: placeId,
  })
    .then(response => response.result)
    .catch(error => {
      throw new Error(`Failed to fetch Lat Lng from Place ID: ${error}`);
    });
};

const getPlacesAutocomplete = (params: {
  input: string;
  location: string;
  radius: number;
}) => {
  return fetchGoogleMapsApi<{
    predictions: Array<GooglePlace>;
  }>('place/autocomplete/json', params)
    .then(response => response.predictions)
    .catch(error => {
      throw new Error(`Failed to fetch Places Autocomplete: ${error}`);
    });
};

const GoogleMapsApi = {
  getPlacesAutocomplete,
  getDetailFromPlaceId,
};

export default GoogleMapsApi;
