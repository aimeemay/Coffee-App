

var App = Ember.Application.create({
  LOG_TRANSITIONS:true
});


App.Router.map(function() {
  this.resource('Coffees');
  this.resource('Coffee', {path: '/Coffees/:name'}, function() {
    this.resource('Gallery');
    this.resource('Reviews');
  });
});


App.CoffeesRoute = Ember.Route.extend({
  model: function(params) {
    console.log('Params: ', params)

    return App.COFFEE.sort(function(a,b){
      return a[params.sort] > b[params.sort];
    });
    // return App.COFFEE;
  }
});

// App.CoffeesView = Ember.ArrayController.extend({
//   sortfunction: function() {
//     alert('was clicked')
//     // console.log(event)
//     // return false;
//   }
// })

App.CoffeeRoute = Ember.Route.extend({
  model: function(params) {
    return App.COFFEE.findBy('name', params.name)
  }
});

App.CoffeeIndexRoute = Ember.Route.extend({
  model: function(params) {
    return $.get('/isloggedin', function(data){
      console.log(data);
      return data;
    });
  }
});

App.GalleryRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('Coffee')
  }
});

//scroll to top on route change
App.ApplicationController = Ember.Controller.extend({
  currentPathChanged: function () {
    window.scrollTo(0, 0);
  }.observes('currentPath')

});

App.CoffeesController = Ember.ArrayController.extend({
  queryParams: ['sort'],
  sort: null,
  

  sortedCoffees: function() {
    var sort = this.get('sort');
    var coffees = this.get('model')

    if (coffees) {
      return temp = coffees.sort(function(a,b){
        return a[sort] > b[sort];
    });
      console.log(temp)
    } else {
      return App.COFFEE
    }
  }.property('sort', 'model')

  //   console.log(category);
  //   if (category) {
  //     return articles.filterProperty('category', category);
  //   } else {
  //     return articles;
  //   }
  // }.property('category', 'model')
});
 



$(function(){

//init SwipeBox on gallery
$('.swipebox').swipebox({
  useCSS: true, // false will force the use of jQuery for animations
  hideBarsDelay: 0 // 0 to always show caption and action bar
});

}); //doc ready



