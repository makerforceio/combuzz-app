import 'dart:async';
import 'package:flutter/material.dart';
import 'package:map_view/map_view.dart';

const API_KEY = "AIzaSyBtPHKF-p6zR5bCVS3p2az4gVv8Xa0y8ow";

void main() {
  MapView.setApiKey(API_KEY);
  runApp(new CompassApp());
}

class CompassApp extends StatefulWidget {
  @override
  _CompassAppState createState() => new _CompassAppState();
}

class _CompassAppState extends State<CompassApp> {
  MapView mapView = new MapView();
  CameraPosition cameraPosition;
  var provider = new StaticMapProvider(API_KEY);
  var compositeSubscription = new CompositeSubscription();
  Uri staticMapUri;

  @override
  initState() {
    super.initState();
    cameraPosition = new CameraPosition(Locations.portland, 2.0);
    staticMapUri = provider.getStaticUri(Locations.portland, 12,
        width: 900, height: 400, mapType: StaticMapViewType.roadmap);
  }

  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      home: new Scaffold(
          appBar: new AppBar(
            title: new Text('Map View Example'),
          ),
          body: new Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              new Container(
                height: 250.0,
                child: new Stack(
                  children: <Widget>[
                    new Center(
                        child: new Container(
                      child: new Text(
                        "You are supposed to see a map here.\n\nAPI Key is not valid.\n\n"
                            "To view maps in the example application set the "
                            "API_KEY variable in example/lib/main.dart. "
                            "\n\nIf you have set an API Key but you still see this text "
                            "make sure you have enabled all of the correct APIs "
                            "in the Google API Console. See README for more detail.",
                        textAlign: TextAlign.center,
                      ),
                      padding: const EdgeInsets.all(20.0),
                    )),
                    new InkWell(
                      child: new Center(
                        child: new Image.network(staticMapUri.toString()),
                      ),
                      onTap: showMap,
                    )
                  ],
                ),
              ),
              new Container(
                padding: new EdgeInsets.only(top: 10.0),
                child: new Text(
                  "Tap the map to interact",
                  style: new TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              new Container(
                padding: new EdgeInsets.only(top: 25.0),
                child:
                    new Text("Camera Position: \n\nLat: ${cameraPosition.center
                    .latitude}\n\nLng:${cameraPosition.center
                    .longitude}\n\nZoom: ${cameraPosition.zoom}"),
              ),
            ],
          )),
    );
  }

  showMap() {
    mapView.show(
        new MapOptions(
            mapViewType: MapViewType.normal,
            showUserLocation: true,
            showMyLocationButton: true,
            showCompassButton: true,
            initialCameraPosition: new CameraPosition(
                new Location(45.526607443935724, -122.66731660813093), 15.0),
            hideToolbar: false,
            title: "Recently Visited"),
        toolbarActions: [new ToolbarAction("Close", 1)]);
    StreamSubscription sub = mapView.onMapReady.listen((_) {
    });
    compositeSubscription.add(sub);
    sub = mapView.onToolbarAction.listen((id) {
      print("Toolbar button id = $id");
      if (id == 1) {
        _handleDismiss();
      }
    });
    compositeSubscription.add(sub);
  }

   _handleDismiss() async {
    double zoomLevel = await mapView.zoomLevel;
    Location centerLocation = await mapView.centerLocation;
   
    print("Zoom Level: $zoomLevel");
    print("Center: $centerLocation");
    
    var uri = await provider.getImageUriFromMap(mapView,
        width: 900, height: 400);
    setState(() => staticMapUri = uri);
    mapView.dismiss();
    compositeSubscription.cancel();
  }
}

class CompositeSubscription {
  Set<StreamSubscription> _subscriptions = new Set();

  void cancel() {
    for (var n in this._subscriptions) {
      n.cancel();
    }
    this._subscriptions = new Set();
  }

  void add(StreamSubscription subscription) {
    this._subscriptions.add(subscription);
  }

  void addAll(Iterable<StreamSubscription> subs) {
    _subscriptions.addAll(subs);
  }

  bool remove(StreamSubscription subscription) {
    return this._subscriptions.remove(subscription);
  }

  bool contains(StreamSubscription subscription) {
    return this._subscriptions.contains(subscription);
  }

  List<StreamSubscription> toList() {
    return this._subscriptions.toList();
  }
}
