let interactive = true;
let points = {
    "X": [],
    "Y": []
};
let K = 0;

let socket = io("http://127.0.0.1:5000/compute");
socket.on("connect", function () {
    console.log('Connected');
});

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FkOTlrZXYiLCJhIjoiY2p3cmg1YWV0MDdtMjQ4bWVwcjBsOWxxaSJ9.YAmQRxiKv1n2_OtLslMcgQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.5, 40], // starting position
    zoom: 5, // starting zoom
    interactive: interactive
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

map.on('mousemove', function (e) {
    document.getElementById('info').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        JSON.stringify(e.point) +
        '<br />' +
        // e.lngLat is the longitude, latitude geographical position of the event
        JSON.stringify(e.lngLat.wrap());
});

map.on('click', function (e) {
    // The event object (e) contains information like the
    // coordinates of the point on the map that was clicked.
    if (!interactive) {
        if (points['X'].length == 4 || points['Y'].length == 4) {
            alert('Maximum of 4 points can be selected');
            return;
        }
        new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map);
        points['X'].push(e.lngLat.lng);
        points['Y'].push(e.lngLat.lat);
    }
});

map.on('load', function () {
    map.addSource('geojson', {
        'type': 'geojson',
        'data': geojson
    });

    // Add styles to the map
    map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'geojson',
        paint: {
            'circle-radius': 5,
            'circle-color': '#000'
        },
        filter: ['in', '$type', 'Point']
    });
    map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'geojson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#000',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });
});

// GeoJSON object to hold our measurement features
var geojson = {
    'type': 'FeatureCollection',
    'features': []
};

// Used to draw a line between points
var linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

function changeK() {
    K = document.getElementById('quantity').value;
}

function toggleInteractivity() {
    interactive = !interactive;
    if (!interactive) {
        map.boxZoom.disable();
        map.scrollZoom.disable();
        map.dragPan.disable();
        map.dragRotate.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();
    } else {
        map.boxZoom.enable();
        map.scrollZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.keyboard.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
    }
}

function runAlgo() {
    if (!interactive) {
        let data = {}
        data['K'] = K
        data['n'] = points['X'].length;
        data['X'] = points['X'];
        data['Y'] = points['Y'];
        socket.emit("classical", data);
    }
}

socket.on("classical_response", function (message) {
    drawData(message);
});

socket.on("quantum_response", function (message) {
    console.log(message);
});

function drawData(data) {
    let x = data['x'];
    let n = points['X'].length;
    let xc = points['X'];
    let yc = points['Y'];

    for (let i = 0; i < Math.pow(n, 2); i++) {
        if (x[i] > 0) {
            ix = parseInt(i / n);
            iy = i % n;
            var point1 = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [xc[ix], yc[ix]]
                },
                'properties': {
                    'id': String(new Date().getTime())
                }
            };
            let new_x = xc[ix] + (xc[iy] - xc[ix]);
            let new_y = yc[ix] + (yc[iy] - yc[ix]);
            var point2 = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [new_x, new_y]
                },
                'properties': {
                    'id': String(new Date().getTime())
                }
            };
            geojson.features.push(point1);
            geojson.features.push(point2);
            if (geojson.features.length > 1) {
                linestring.geometry.coordinates = geojson.features.map(
                    function (point) {
                        return point.geometry.coordinates;
                    }
                );
                geojson.features.push(linestring);
            }
        }
    }
    map.getSource('geojson').setData(geojson);
}