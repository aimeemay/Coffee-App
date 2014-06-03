//to do
//SWIPEBOX: $(function(){ $('.swipebox' ).swipebox(); });
  //1. add
    //1.1 return something to signal it worked
    //1.2 id
    //1.3 clear controller variables
  //2. edit
    //2.1 add validation that page has been edited http://emberjs.com/guides/getting-started/accepting-edits/
App = Ember.Application.create();

var isLoggedinAsAdmin = true;

App.Router.map(function() {
  this.route('coffees', {path: 'coffees'});
  this.route('search', {path: 'search'});
  this.resource('coffee', {path: 'coffee/:id'}, function() {
    this.route('overview', {path: '/'}, function() {
      this.route('maps', {path:'/'})
    });
    this.route('gallery');
    this.route('reviews');
  });
  this.route('admin', {path: '/admin'});
  this.route('login', {path: '/admin/login'});
  this.route('edit', {path: '/admin/:id/edit'});
  this.route('add', {path: '/admin/add'});
});

App.CoffeesRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('coffee');
  }
});

App.CoffeeRoute = Ember.Route.extend({
  model: function(params){
    return this.store.find('coffee', params.id);
  }
})

App.SearchRoute = Ember.Route.extend({
  queryParams: {
    searchName: {refreshModel: true},
    searchPrice: {refreshModel: true}
  },
  model: function(params){
    return this.store.findQuery('coffee', params);
  }
})
App.AdminRoute = Ember.Route.extend({
  beforeModel: function(){
      if (!isLoggedinAsAdmin) this.transitionTo('login')
  },
  model: function() {
    return this.store.find('coffee');
  }
});

App.LoginRoute = Ember.Route.extend({
  model: function(){
    console.log(isLoggedinAsAdmin)
    return {user: isLoggedinAsAdmin};
  }
})

App.EditRoute = Ember.Route.extend({
    beforeModel: function(){
        if (!isLoggedinAsAdmin) this.transitionTo('login')
    },
    model: function(params){
      return this.store.find('coffee', params.id);
    }
})

App.AddRoute = Ember.Route.extend({
  beforeModel: function(){
        if (!isLoggedinAsAdmin) this.transitionTo('login')
    },
  model: function() {
    return this.store.find('coffee');
  }
});

App.LoginController = Ember.Controller.extend({
  actions: {
    login: function(){
      input1 = $('#1').val()
      input2 = $('#2').val()

      if (input1==='admin' && input2 ==='pass'){
        isLoggedinAsAdmin = true;
        this.transitionToRoute('admin');
      }

    },
    logout: function(){
      isLoggedinAsAdmin = false;
      console.log(this.get('model.user'))
      this.set('model.user', false);
    }
  }
})

App.SearchController = Ember.Controller.extend({
  queryParams: ['searchName', 'searchPrice'],
  prices: ['none', '1', '2', '3', '4'],
  searchName: '',
  searchPrice: 'none',
});

App.SearchView = Ember.View.extend({
  map: null,
  didInsertElement: function() {
    this.map = new GMaps({
      el: '#mapSearch',
      lat: 30.3894007,
      lng: 69.3532207,
      scaleControl: false,
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl:false,
      zoom: 2,
    });

    var model = this.controller.get('model.content');
    // var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < model.length; i++) {
      var history = model[i].get('history'),
          lat = history[0].location[0],
          lng = history[0].location[1]
        console.log(lat + "   " + lng)
      // debugger;
      this.map.addMarker({
        lat: lat,
        lng: lng
      });
      // bounds.extend(history[0].location)
    };
    // this.map.fitBounds(bounds);
  },
  updateMap : function() {
    if (this.map !== null) {
      var model = this.controller.get('model.content');
      // var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < model.length; i++) {
        var history = model[i].get('history'),
            lat = history[0].location[0],
            lng = history[0].location[1]
          console.log(lat + "   " + lng)
        // debugger;
        this.map.addMarker({
          lat: lat,
          lng: lng
        });
        // bounds.extend(history[0].location)
      };
      // this.map.fitBounds(bounds);
    }
  }.observes('controller.model')
})

App.CoffeeReviewsController = Ember.ObjectController.extend({
  content : '',
  rating: '',
  actions: {
    like: function() {
      if (this.get('rating') === true) {this.set('rating', '')}
      else this.set('rating', true);
    },
    dislike: function() {
      if (this.get('rating') === false) {this.set('rating', '')}
      else this.set('rating', false);
    },
    addReview: function() {
      var d = new Date();
      var timestamp = d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
      var content = this.get('content')
      var rating = this.get('rating')
      var review = {content: content, rating: rating, timestamp: timestamp};
      var id = this.get('model.id')
      var controller = this

      console.log(review)
      this.store.find('coffee', id).then(function(a) {
        a.get('reviews').addObject(review)
        a.save();
        controller.set('content', '');
        controller.set('rating', '');
      })
    }
  }
});

App.EditController = Ember.ObjectController.extend({
  prices : [1, 2, 3, 4],
  actions: {
    editCoffee: function() {
      this.get('model').save()
      this.transitionToRoute('admin');
    }
  }
});

App.AdminController = Ember.ObjectController.extend({
  actions: {
    deleteCoffee: function(a) {
      if(confirm('Are you sure you want to delete?')){
        this.store.find('coffee', a.id).then(function(del){
          del.destroyRecord();
          console.log('Deleting project', a)
        });
      }
    }
  }
});

App.AddController = Ember.ObjectController.extend({
  prices: [1, 2, 3, 4],
  name: '',
  short_description: '',
  long_description: '',
  price: 2,
  who_drinks_it: '',
  how_to_drink: '',
  actions: {
    addCoffee: function() {
      //Build new Coffee object
      var coffee = this.store.createRecord('coffee', {
        name: this.get('name'),
        short_description: this.get('short_description'),
        long_description: this.get('long_description'),
        price: this.get('price'),
        who_drinks_it: this.get('who_drinks_it'),
        how_to_drink: this.get('how_to_drink'),
      });

      //Save the coffee
      coffee.save().then(function() {}, function(){ //HACK necessary because it thinks post isn't successful?
          console.log('got here')
          //clear controller variables
          // this.set('name', '');
          // this.set('short_description', '');
          // this.set('long_description', '');
          // this.set('price', '');
          // this.set('who_drinks_it', '');
          // this.set('how_to_drink', '');
          this.transitionToRoute('admin').then(
           function() {location.reload();}
          );
      });
    }
  }
});

App.CoffeeOverviewController = Ember.ObjectController.extend({
  mapLat: null,
  mapLng: null,
  mapContent: null,
  actions: {
    changeStory: function(data) {
      this.set('mapLat', data.location[0])
      this.set('mapLng', data.location[1])
      this.set('mapContent', data.content)
    }
  }
  // data.location -- set the data here
});

App.CoffeeOverviewView = Ember.View.extend({
  map: null,
  infoWindow: null,
  marker: null,
  actions: {
    routeToStory: function() {
      var lat = this.controller.get('mapLat'),
          lng = this.controller.get('mapLng')
          debugger;

      this.map.geolocate({
        success: function(position) {
          this.map.setCenter(position.coords.latitude, position.coords.longitude);
        },
        error: function(error) {
          alert('Geolocation failed: '+error.message);
        },
        not_supported: function() {
          alert("Your browser does not support geolocation");
        }
      });

      // debugger;
      this.map.addMarker({
        lat: -27.4702796,
        lng: 153.023036
      })

      this.map.drawRoute({
        origin: [-27.4702796,153.023036],
        destination: [lat, lng],
        travelMode: 'walking',
        strokeColor: '#131540',
        strokeOpacity: 0.6,
        strokeWeight: 6
      });
      debugger;
    }
  },
  didInsertElement : function(){
    console.log(1)
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function(){
      //initialise map
      this.map = new GMaps({
        el: '#map',
        lat: this.controller.get('model.history')[0].location[0],
        lng: this.controller.get('model.history')[0].location[1],
        zoom: 3,
        scaleControl: false,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl:false,
        // zoomControlOpt: {
        //   style:'SMALL',
        //   position: 'TOP_LEFT'
        // }
      });
      // debugger;
      this.updateMap(); 
    });
  },
  updateMap: function(){
    console.log(2)
    var lat = this.controller.get('mapLat')
    
    if (this.map !== null) {
      if (lat !== null) {
        var lng = this.controller.get('mapLng'),
            content = this.controller.get('mapContent')

        this.map.removeMarkers();
        this.map.setCenter(lat,lng);
        this.infoWindow = new google.maps.InfoWindow({
          content: '<p>'+content+'</p>',
        });
        this.marker = this.map.addMarker({
          lat: lat,
          lng: lng,
          infoWindow: this.infoWindow
        })
        this.infoWindow.open(this.map, this.marker)        
      } else {
        var lat = this.controller.get('model.history')[0].location[0],
            lng = this.controller.get('model.history')[0].location[1],
            content = this.controller.get('model.history')[0].content

        this.controller.set('mapLat', lat);
        this.controller.set('mapLng', lng);
        this.controller.set('mapContent', content);

        this.infoWindow = new google.maps.InfoWindow({
          content: '<p>'+content+'</p>'
        });
        this.marker = this.map.addMarker({
          lat: lat,
          lng: lng,
          infoWindow: this.infoWindow
        })
        this.infoWindow.open(this.map, this.marker)
      }
    }
  }.observes('controller.mapContent')
});

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api/v1'
});

// use '_id' for mongoDB
App.CoffeeSerializer = DS.RESTSerializer.extend({
    primaryKey: '_id',
});

App.Coffee = DS.Model.extend({
  name: DS.attr(),
  short_description: DS.attr(),
  long_description: DS.attr(),
  price: DS.attr(),
  image: DS.attr(),
  who_drinks_it: DS.attr(),
  how_to_drink: DS.attr(),
  history: DS.attr(),
  gallery: DS.attr(),
  reviews: DS.attr()
})

// //DOC READY
//   $(function(){ $('.swipebox' ).swipebox(); });
// });