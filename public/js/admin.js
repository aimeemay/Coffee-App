//to do
  //1. add
    //1.1 return something to signal it worked
    //1.2 id
    //1.3 clear controller variables
  //2. edit
    //2.1 add validation that page has been edited http://emberjs.com/guides/getting-started/accepting-edits/

App = Ember.Application.create();


var isLoggedinAsAdmin = true;

App.Router.map(function() {
  this.route('coffeeMenu', {path: 'coffeeMenu'}, function() {});
  this.resource('coffeeItem', {path: 'coffeeItem/:id'}, function() {
    this.route('coffeeOverview')
    this.route('coffeeGallery');
    this.route('coffeeReviews');
  });
  this.route('admin', {path: '/admin'});
  this.route('login', {path: '/admin/login'})
  this.route('edit', {path: '/admin/:id/edit'});
  this.route('add', {path: '/admin/add'});
});

App.CoffeeMenuRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('coffee');
    // return Ember.$.getJSON('/api/v1/coffees').then(function(data) {
    //   return data.coffees;
    // });
  }
});

App.CoffeeOverviewRoute = Ember.Route.extend({
  model: function(params){
    return this.store.find('coffee', params.id);
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
    gallery: DS.attr(),
    reviews: DS.hasMany('reviews')
})

App.Reviews = DS.Model.extend({
  user: DS.attr(),
  created: DS.attr(),
  content: DS.attr()
})


