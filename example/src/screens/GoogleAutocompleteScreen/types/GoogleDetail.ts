export type GoogleDetail = {
  address_components: AddressComponent[];
  adr_address: string;
  formatted_address: string;
  geometry: Geometry;
  icon: string;
  icon_background_color: string;
  icon_mask_base_uri: string;
  name: string;
  photos: Photo[];
  place_id: string;
  reference: string;
  types: string[];
  url: string;
  utc_offset: number;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type Geometry = {
  location: Location;
  viewport: Viewport;
};

type Location = {
  lat: number;
  lng: number;
};

type Viewport = {
  northeast: Northeast;
  southwest: Southwest;
};

type Northeast = {
  lat: number;
  lng: number;
};

type Southwest = {
  lat: number;
  lng: number;
};

type Photo = {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
};
