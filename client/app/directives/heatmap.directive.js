angular.module('cube')
.directive('heatmap', ['$rootScope', 'data', function($rootScope, data){
  return {
    restrict: 'E',
    templateUrl: 'app/directives/heatmap.html',
    controller: function($scope){
      var heatmapController = this;
      this.dependent = undefined;
      // Attach Pulse
      var pulse = new RCUBE.Pulse('#heatmap-pulse-container');

      heatmapController.visible = false;
      // http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
      // https://variadic.me/posts/2013-10-15-share-state-between-controllers-in-angularjs.html
      // https://stackoverflow.com/questions/15380140/service-variable-not-updating-in-controller

      var createHeatmap = function(dependentVariable){
        // Remove old Heatmap container
        $('svg.heatmap').remove();
        var names = data.dataset.getDimensionNames();
        var rSquared = data.dataset.getRSquared()[dependentVariable];
        var myHeatmap = new RCUBE.Heatmap(".my-heatmap", rSquared, names);
        heatmapController.visible = true;
      };

      // Dependent
      this.dependentOptions = [];
      // Helper object, quickly checks if a dependent variable is added
      this.dependentOptionsAdded = {};
      $scope.dependentSelect = this.dependentOptions[0];

      // Reset the Visualization when new Formulas are applied
      $scope.$on('newFormulaApplied', function(){
        $('svg.heatmap').remove();
        // Empty the dependentOption Array
        heatmapController.dependentOptions.length = 0;
        heatmapController.dependentOptionsAdded = {};
      });

      $scope.$on('updateRSquared', function(){
        var rSquaredValues = data.getRSquaredValues();
        var values = Object.keys(rSquaredValues);
        // Set Heatmap to visible when we actually have rSquared values to display
        if (values.length > 0) {
          heatmapController.visible = true;
          // Only add entries to the select which are not already added
          values.forEach(function(dimension){
            if (heatmapController.dependentOptionsAdded[dimension] !== true) {
              heatmapController.dependentOptionsAdded[dimension] = true;
              heatmapController.dependentOptions.push({label: dimension, value: dimension});
              pulse.pulse();
            }
          });
        }
      });

      this.changeDependent = function(){
        this.currentDimension = $scope.dependentSelect.label;
        createHeatmap($scope.dependentSelect.label);
        $rootScope.$broadcast('visibleSliceChanged', { 'dimension':this.currentDimension });
      };
    },
  controllerAs: 'heatmap'
};
}]);
