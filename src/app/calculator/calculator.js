/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'ngBoilerplate.calculator', [
  'ui.router',
  'plusOne'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'calculator', {
    url: '/calculator',
    views: {
      "main": {
        controller: 'CalculatorCtrl',
        templateUrl: 'calculator/calculator.tpl.html'
      }
    },
    data:{ pageTitle: 'Calculator' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'CalculatorCtrl', function CalculatorController( $scope ) {
})
    .directive('pslCalculator', function () {
      return {
        restrict: 'E',
        templateUrl: 'calculator/pslCalculator.tpl.html',
        controller: function () {

          var vm = this;

          vm.calcInput = 0;

          vm.rows = [
            {
              ops: [7, 8, 9, '+', '%']
            },
            {
              ops: [4, 5, 6, '-', 'sqrt']
            },
            {
              ops: [1, 2, 3, '*', '1/x']
            },
            {
              ops: [0, '+/-', '.', '/', '=']
            }
          ];

        },
        controllerAs: 'calcCtrl',
        link: function (scope, element, attrs, calcCtrl) {

          calcCtrl.clearClick = function () {

            calcCtrl.calcInput = 0;
          };

          calcCtrl.opClick = function(op) {
            var result, operators;
            if (op !== 'sqrt' && op !== '1/x' && op !== '=') {
              if (calcCtrl.calcInput !== 0) {
                calcCtrl.calcInput = calcCtrl.calcInput.toString() + op.toString();
              } else {
                calcCtrl.calcInput = op;
              }
            } else {
              switch(op) {
                case 'sqrt':
                  calcCtrl.calcInput = Math.sqrt(calcCtrl.calcInput);
                  break;
                case '1/x':
                  calcCtrl.calcInput = 1/calcCtrl.calcInput;
                  break;
                case '=':
                  if (calcCtrl.calcInput.toString().indexOf('+') > - 1) {

                    operators = calcCtrl.calcInput.toString().split('+').map(function(item) {
                      return parseFloat(item);
                    });

                    result = operators.reduce(function(a, b) { return a + b; }, 0);
                    calcCtrl.calcInput = result;

                  } else if (calcCtrl.calcInput.toString().indexOf('-') > -1) {

                    operators = calcCtrl.calcInput.toString().split('-').map(function(item) {
                      return parseFloat(item);
                    });

                    var newOps = operators.splice(1, operators.length);
                    var sub = newOps.reduce(function(a, b) { return a + b; }, 0);

                    result = operators[0] - sub;
                    calcCtrl.calcInput = result;
                  } else if (calcCtrl.calcInput.toString().indexOf('*') > -1) {

                    operators = calcCtrl.calcInput.toString().split('*').map(function(item) {
                      return parseFloat(item);
                    });

                    result = operators.reduce(function(a, b) { return a * b; });
                    calcCtrl.calcInput = result;
                  } else if (calcCtrl.calcInput.toString().indexOf('/') > -1) {

                    operators = calcCtrl.calcInput.toString().split('/').map(function(item) {
                      return parseFloat(item);
                    });

                    calcCtrl.calcInput = operators[0] / operators[1];
                  }
                  break;
              }
            }

          };


        }
      };
    })
;

