const API_KEY = 'AIzaSyBtPHKF-p6zR5bCVS3p2az4gVv8Xa0y8ow';

const DEFAULT_COLOUR = '#26C6DA';
const FAIL_COLOUR = '#C62828';

const R = 6371;

const draw_arrow = (angle, height) => {
  const canvas = document.getElementById('arrow-canvas');
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  const canvas_half_width = canvas.width / 2;
  const canvas_half_height = canvas.height / 2;

  const radians = angle * Math.PI / 180;
  const rad30 = 60 * Math.PI / 180;
  const rad60 = 30 * Math.PI / 180;

  const short_length = (height / 4) / Math.cos(rad30);
  const half_width = (height / 4) * Math.tan(rad30);
  const long_length = Math.sqrt(half_width * half_width + height * height);

  context.beginPath();
  context.fillStyle = '#FFFFFF';
  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 5;

  context.shadowColor = 'rgba(0, 0, 0, 0.7)';
  context.shadowBlur = 7;
  context.shadowOffsetX = 7;
  context.shadowOffsetY = 7;

  let x = canvas_half_width;
  let y = canvas_half_height;
  context.moveTo(x, y);

  x += short_length * Math.cos(radians + rad60);
  y += short_length * Math.sin(radians + rad60);
  context.lineTo(x, y);

  const long_angle = Math.atan(height / half_width);
  x += long_length * Math.cos((Math.PI + long_angle) + radians);
  y += long_length * Math.sin((Math.PI + long_angle) + radians);
  context.lineTo(x, y);

  const top_angle = Math.PI - long_angle;
  x += long_length * Math.cos(top_angle + radians);
  y += long_length * Math.sin(top_angle + radians);
  context.lineTo(x, y);

  context.lineTo(canvas_half_width, canvas_half_height);

  context.fill();

  //Reset shadow
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  context.stroke();
};

document.addEventListener('DOMContentLoaded', (event) => {
  // Initialise canvas size to screen size
  const canvas = document.getElementById('arrow-canvas');
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight - 1;

  // Watch for resize events
  window.onresize = (e) => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight - 1;
    draw_arrow(0, canvas.height / 4);
  };

  let autocomplete;
  let critical_failing = false;
  let current_lat = 0;
  let current_lng = 0;

  let absolute_angle = 0;
  let has_touched = false;

  let alphas = [];

  let active = {
    current: -1,
    waypoints: null
  };

  document.body.addEventListener('mouseup', () => {
    has_touched = true;
    document.getElementById('vibration-indicator').style.color = '#4CAF50';
  });

  // Check for compass
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener('deviceorientation', (event) => {
      const alpha = event.alpha; //Yaw (The one we want)
      // if(alphas.length > 2){
      //   // let average_difference =
      // }
      // alphas.push(alpha);
      // if(alphas.length > 10)
      //   alphas.shift();
      // const average_alpha = alphas.reduce((a, x) => a + x) / alphas.length;
      const average_alpha = alpha;
      if(active.current >= 0 && active.waypoints != null){
        draw_arrow(average_alpha - absolute_angle, canvas.height / 4);
        let val = Math.min((alpha - absolute_angle - 30) * 50);
        if(val > 0)
          navigator.vibrate([val, 1000]);
      }else{
        draw_arrow(average_alpha, canvas.height / 4);
      }
    });
  } else {
    critical_failing = true;
    document.getElementById('compass-indicator').style.color = FAIL_COLOUR;
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition((position) => {
      current_lat = position.coords.latitude;
      current_lng = position.coords.longitude;

      if(active.waypoints != null && active.current >= 0 && active.current < active.waypoints.length) {
        let lat = active.waypoints[active.current].lat;
        let lng = active.waypoints[active.current].lng;
        let y = Math.sin(lng - current_lng) * Math.cos(lat);
        let x = Math.cos(current_lat) * Math.sin(lat) - Math.sin(current_lat) * Math.cos(lat) * Math.cos(lng - current_lng);

        absolute_angle = Math.atan2(y, x) * 180 / Math.PI;
      }
    });


    navigator.geolocation.getCurrentPosition((position) => {
      current_lat = position.coords.latitude;
      current_lng = position.coords.longitude;

      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: current_lat, lng: current_lng},
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: false,
        scaleControl: true
      });



      let ds = new google.maps.DirectionsService;
      let ps = new google.maps.places.PlacesService(map);
      autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
        types: ['establishment']
      });
      const circle = new google.maps.Circle({
        center: {
          lat: current_lat,
          lng: current_lng
        },
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
      autocomplete.addListener('place_changed', () => {
        ds.route({
          origin: new google.maps.LatLng(current_lat, current_lng),
          destination: { 'placeId': autocomplete.getPlace().place_id },
          travelMode: 'WALKING'
        }, (res, status) => {
          if(status === 'OK'){
            Promise.all(res.geocoded_waypoints.map((waypoint) => {
              return new Promise((resolve, reject) => {
                ps.getDetails({
                  placeId: waypoint.place_id,
                  fields: ['geometry']
                }, (place, status) => {
                  if(status === 'OK'){
                    console.log(place.geometry.location.lat);
                    resolve({
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng()
                    });
                  } else {
                    reject();
                  }
                });
              })
            })).then((waypoints) => {
              active.current = 1;
              active.waypoints = waypoints;

              let lat = active.waypoints[active.current].lat;
              let lng = active.waypoints[active.current].lng;
              let y = Math.sin(lng - current_lng) * Math.cos(lat);
              let x = Math.cos(current_lat) * Math.sin(lat) - Math.sin(current_lat) * Math.cos(lat) * Math.cos(lng - current_lng);

              absolute_angle = Math.atan2(y, x) * 180 / Math.PI;
            });
          }else{
            console.log(status);
          }
        });
        M.Modal.getInstance(document.getElementById('input-modal')).close();
      });
    });
  } else {
    critical_failing = true;
    document.getElementById('gps-indicator').style.color = FAIL_COLOUR;
  }

  if(critical_failing){
    document.body.style.backgroundColor = '#90A4AE';
    // document.getElementById('fab').style.backgroundColor = '#E57373';
    canvas.style.display = 'none';
  }

  M.Modal.init(document.querySelectorAll('.modal'));
});
