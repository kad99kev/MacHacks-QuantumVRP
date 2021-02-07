let interactive = true;
let points = {
    "X": [],
    "Y": [],
    "markers": []
};
let K = 0;

let socket = io("http://127.0.0.1:5000/compute");
socket.on("connect", function () {
    console.log('Connected');
});

socket.on("classical_response", function (message) {
    drawData(message, 'classical');
});

socket.on("quantum_response", function (message) {
    drawData(message, 'quantum');
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
        let marker = new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map);
        points['X'].push(e.lngLat.lng);
        points['Y'].push(e.lngLat.lat);
        points["markers"].push(marker);
    }
});

// GeoJSON object to hold our measurement features
var classicalJson = {
    'type': 'FeatureCollection',
    'features': []
};

// Used to draw a line between points
var classicalString = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

// GeoJSON object to hold our measurement features
var quantumJson = {
    'type': 'FeatureCollection',
    'features': []
};

// Used to draw a line between points
var quantumString = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

map.on('load', function () {
    map.addSource('classicalJson', {
        'type': 'geojson',
        'data': classicalJson
    });

    map.addSource('quantumJson', {
        'type': 'geojson',
        'data': classicalJson
    });

    // Add styles to the map
    map.addLayer({
        id: 'classical-measure-points',
        type: 'circle',
        source: 'classicalJson',
        paint: {
            'circle-radius': 5,
            'circle-color': 'red'
        },
        filter: ['in', '$type', 'Point']
    });
    map.addLayer({
        id: 'classical-measure-lines',
        type: 'line',
        source: 'classicalJson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': 'red',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });

    // Add styles to the map
    map.addLayer({
        id: 'quantum-measure-points',
        type: 'circle',
        source: 'quantumJson',
        paint: {
            'circle-radius': 5,
            'circle-color': 'black'
        },
        filter: ['in', '$type', 'Point']
    });
    map.addLayer({
        id: 'quantum-measure-lines',
        type: 'line',
        source: 'quantumJson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': 'black',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });
});

function changeK() {
    K = document.getElementById('quantity').value;
}

function toggleInteractivity() {
    interactive = !interactive;
    if (!interactive) {
        let ref = document.getElementById('selection');
        ref.innerHTML = "Clear Selection";
        map.boxZoom.disable();
        map.scrollZoom.disable();
        map.dragPan.disable();
        map.dragRotate.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();
    } else {
        let ref = document.getElementById('selection');
        ref.innerHTML = "Select Points";
        clearMarkers();
        map.boxZoom.enable();
        map.scrollZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.keyboard.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
    }
}

function runAlgo(type) {
    if (!interactive) {
        let data = {}
        data['K'] = K
        data['n'] = points['X'].length;
        data['X'] = points['X'];
        data['Y'] = points['Y'];
        if (type === 'classical') {
            socket.emit("classical", data);
        } else {
            socket.emit("quantum", data);
        }
    }
}

function drawData(data, type) {


    if (type === 'classical') {
        clearData('quantum');
    } else {
        clearData('classical')
    }

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
            if (type === 'classical') {
                classicalJson.features.push(point1);
                classicalJson.features.push(point2);
                if (classicalJson.features.length > 1) {
                    classicalString.geometry.coordinates = classicalJson.features.map(
                        function (point) {
                            return point.geometry.coordinates;
                        }
                    );
                    classicalJson.features.push(classicalString);
                }
            } else {
                quantumJson.features.push(point1);
                quantumJson.features.push(point2);
                if (quantumJson.features.length > 1) {
                    quantumString.geometry.coordinates = quantumJson.features.map(
                        function (point) {
                            return point.geometry.coordinates;
                        }
                    );
                    quantumJson.features.push(quantumString);
                }
            }

        }
    }
    if (type === 'classical') {
        map.getSource('classicalJson').setData(classicalJson);

    } else {
        map.getSource('quantumJson').setData(quantumJson);

    }
}

function clearData(type) {
    if (type === 'classical') {
        // GeoJSON object to hold our measurement features
        classicalJson = {
            'type': 'FeatureCollection',
            'features': []
        };

        // Used to draw a line between points
        classicalString = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        };
        map.getSource('classicalJson').setData(classicalJson);
    } else {
        // GeoJSON object to hold our measurement features
        quantumJson = {
            'type': 'FeatureCollection',
            'features': []
        };

        // Used to draw a line between points
        quantumString = {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        };
        map.getSource('quantumJson').setData(quantumJson);
    }
}

function clearMarkers() {
    for (let marker of points["markers"]) {
        marker.remove();
    }
    points["X"] = [];
    points["Y"] = [];
}