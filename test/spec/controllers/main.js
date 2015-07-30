'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('trialsReportApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  //beforeEach(inject(function ($controller, $rootScope) {
  //  scope = $rootScope.$new();
  //  MainCtrl = $controller('MainCtrl', {
  //    $scope: scope
  //  });
  //}));

  it('should attach a list of awesomeThings to the scope', function ($controller) {
    scope = {};
    MainCtrl = $controller('MainCtrl', {
        $scope: scope
      });
    expect(MainCtrl).toBeDefined;
    //expect(scope.helpOverlay).toBe(true);
    //console.log(scope.helpOverlay);
    //console.log(scope);
    //expect(scope.awesomeThings.length).toBe(3);
  });
});
