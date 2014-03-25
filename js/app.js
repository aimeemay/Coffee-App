

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
    return App.COFFEE;
  }
});

App.CoffeeRoute = Ember.Route.extend({
  model: function(params) {
    return App.COFFEE.findBy('name', params.name)
  }
});

App.CoffeeIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('Coffee')
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
  // queryParams: ['sort'],
  // sort: 'name',

  // sortByName: function() {
  //   var sort = this.get('sort');
  //   console.log(sort)
  // }.property('sort', 'model')

    queryParams: ['category'],
  category: null,

  filteredArticles: function() {
    var category = this.get('category');
    var articles = this.get('model');

    console.log(category);
    if (category) {
      return articles.filterProperty('category', category);
    } else {
      return articles;
    }
  }.property('category', 'model')
});
 



$(function(){

//init SwipeBox on gallery
$('.swipebox').swipebox({
  useCSS: true, // false will force the use of jQuery for animations
  hideBarsDelay: 0 // 0 to always show caption and action bar
});


// function sortByProperty(property) {
//     'use strict';
//     return function (a, b) {
//         var sortStatus = 0;
//         if (a[property] < b[property]) {
//             sortStatus = -1;
//         } else if (a[property] > b[property]) {
//             sortStatus = 1;
//         }
 
//         return sortStatus;
//     };
// }
 
// $('#sortByName').on('click', function() {
//    // console.log('got here');  
//   var sortedByName = App.COFFEE.sort(sortByProperty('name'));
//   console.log(sortedByName);
//   // $("#menu").empty();
//   // $("#menu").append(menuItemsTemplate(sortedByName));
// });

// $('#sortByPrice').on('click', function() {
//   var sortedByPrice = coffeeItems.sort(sortByProperty('price'));
// //   console.log(sortedByPrice);
//   $("#menu").empty();
//   $("#menu").append(menuItemsTemplate(sortedByPrice));
// });

}); //doc ready



