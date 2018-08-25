const API_KEY = 'AIzaSyBtPHKF-p6zR5bCVS3p2az4gVv8Xa0y8ow';

let autocomplete;

function initMaps() {
  autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
    types: ['(establishment)']
  });
  autocomplete.addListener('place_changed', () => {
    console.log(autocomplete.getPlace());
  });
};

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

  // MapView stuff
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  let critical_failing = false;
  let current_lat = 0;
  let current_lng = 0;

  // Check for compass
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    console.log('1')
    window.addEventListener('deviceorientation', (event) => {
      const alpha = event.alpha; //Yaw (The one we want)
      draw_arrow(alpha, canvas.height / 4);
    });
  } else {
    critical_failing = true;
    document.getElementById('compass-indicator').style.color = '#C62828';
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition((position) => {
      current_lat = position.coords.latitude;
      current_lng = position.coords.longitude;
    });
    navigator.geolocation.getCurrentPosition((position) => {
      current_lat = position.coords.latitude;
      current_lng = position.coords.longitude;
    });
  } else {
    critical_failing = true;
    document.getElementById('gps-indicator').style.color = '#C62828';
  }

  if(critical_failing){
    document.body.style.backgroundColor = '#90A4AE';
    // document.getElementById('fab').style.backgroundColor = '#E57373';
    canvas.style.display = 'none';
  }else{
    document.getElementById('fab').addEventListener('mouseup', (e) => {

    });
  }

  M.Modal.init(document.querySelectorAll('.modal'));
});
