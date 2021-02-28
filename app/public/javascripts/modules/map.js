import axios from 'axios';
import { $ } from './bling'; 

const mapOptions = {
    center : {lat: 43.2, lng: -79.8},
    zoom: 11
}

function LoadPlaces(map, lat = 43.2, lng = -79.8) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
      .then(res => {
          const places = res.data;
          if (!places.length) {
              alert('no places');
              return
          }

          // create a bounds
          const bounds = new google.maps.LatLngBounds();
          // create info window
          const infoWindow = new google.maps.InfoWindow();

          const markers = places.map(place => {
              const [placeLng, placeLat] = place.location.coordinates;
              const position = { lat: placeLat, lng: placeLng};
              bounds.extend(position);
              const marker = new google.maps.Marker({ map, position });
              marker.place = place;
              return marker;
          });

          markers.forEach(marker => marker.addListener('click', function() {
              infoWindow.setContent(getStoreInfoWindowHTML(this));
              infoWindow.open(map, this);
          }));

          // zoom the map to fit all the markers perfectly
          map.setCenter(bounds.getCenter());
          map.fitBounds(bounds);

      })

}

function makeMap(mapDiv) {
    if (!mapDiv) return;
    const map = new google.maps.Map(mapDiv, mapOptions);
    LoadPlaces(map);

    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        LoadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng())
    })
}

function getStoreInfoWindowHTML(store) {
    return `
    <div class="popup">
        <a href="/store/${store.place.slug}">
            <img src="/uploads/${store.place.photo || 'store.png'}" alt="${store.place.name}" />
            <p>${store.place.name} - ${store.place.location.address}</p>
        </a>
    </div>
    `
}

export default makeMap;