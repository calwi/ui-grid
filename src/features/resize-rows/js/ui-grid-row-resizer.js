(function(){
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.resizeRows
   * @description
   *
   * # ui.grid.resizeRows
   *
   * <div class="alert alert-success" role="alert"><strong>Stable</strong> This feature is stable. There should no longer be breaking api changes without a deprecation warning.</div>
   *
   * This module allows rows to be resized.
   */
  var module = angular.module('ui.grid.resizeRows', ['ui.grid']);

  module.service('uiGridResizeRowsService', ['gridUtil', '$q', '$timeout',
    function (gridUtil, $q, $timeout) {

      var service = {
        defaultGridOptions: function(gridOptions){
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.resizeRows.api:GridOptions
           *
           *  @description GridOptions for resizeRows feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableRowResizing
           *  @propertyOf  ui.grid.resizeRows.api:GridOptions
           *  @description Enable row resizing on the entire grid
           *  <br/>Defaults to true
           */
          gridOptions.enableRowResizing = gridOptions.enableRowResizing !== false;

          //legacy support
          //use old name if it is explicitly false
          if (gridOptions.enableRowResize === false){
            gridOptions.enableRowResizing = false;
          }
        },

        rowResizerRowBuilder: function (row, gridOptions) {

          var promises = [];
          /**
           *  @ngdoc object
           *  @name ui.grid.resizeRows.api:RowDef
           *
           *  @description RowDef for resizeRows feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions.rowDef gridOptions.rowDefs}
           */

          /**
           *  @ngdoc object
           *  @name enableRowResizing
           *  @propertyOf  ui.grid.resizeRows.api:RowDef
           *  @description Enable row resizing on an individual row
           *  <br/>Defaults to GridOptions.enableRowResizing
           */
          
          /**
           * NO CONCEPT OF ROW DEFINITION SO THIS FUNCTION IS N/A FROM COLUMNS
           */
          
          //default to true unless gridOptions or rowDef is explicitly false
          //rowDef.enableRowResizing = rowDef.enableRowResizing === undefined ? gridOptions.enableRowResizing : rowDef.enableRowResizing;


          //legacy support of old option name
          //if (rowDef.enableRowResize === false){
          //  rowDef.enableRowResizing = false;
          //}

          return $q.all(promises);
        },

        registerPublicApi: function (grid) {
            /**
             *  @ngdoc object
             *  @name ui.grid.resizeRows.api:PublicApi
             *  @description Public Api for row resize feature.
             */
            var publicApi = {
              events: {
                /**
                 * @ngdoc event
                 * @name rowSizeChanged
                 * @eventOf  ui.grid.resizeRows.api:PublicApi
                 * @description raised when row is resized
                 * <pre>
                 *      gridApi.rowResizable.on.rowSizeChanged(scope,function(rowDef, deltaChange){})
                 * </pre>
                 * @param {object} rowDef the row that was resized
                 * @param {integer} delta of the row size change
                 */
                rowResizable: {
                  rowSizeChanged: function (rowDef, deltaChange) {
                  }
                }
              }
            };
            grid.api.registerEventsFromObject(publicApi.events);
        },

        fireRowSizeChanged: function (grid, rowDef, deltaChange) {
          $timeout(function () {
            if ( grid.api.rowResizable ){
              grid.api.rowResizable.raise.rowSizeChanged(rowDef, deltaChange);
            } else {
              gridUtil.logError("The resizeable api is not registered, this may indicate that you've included the module but not added the 'ui-grid-resize-rows' directive to your grid definition.  Cannot raise any events.");
            }
          });
        },

        // get either this row, or the row next to this row, to resize,
        // returns the row we're going to resize
        findTargetRow: function(row, position, rtlMultiplier){
          //var renderContainer = row.getRenderContainer();
          
          var renderContainer = row.grid.renderContainers['body']; 

          if (position === 'top') {
            // Get the row above this one
            var rowIndex = renderContainer.visibleRowCache.indexOf(row);
            return renderContainer.visibleRowCache[rowIndex - 1 * rtlMultiplier];
          } else {
            return row;
          }
        }

      };

      return service;

    }]);


  /**
   * @ngdoc directive
   * @name ui.grid.resizeRows.directive:uiGridResizeRows
   * @element div
   * @restrict A
   * @description
   * Enables resizing for all rows on the grid. If, for some reason, you want to use the ui-grid-resize-rows directive, but not allow row resizing, you can explicitly set the
   * option to false. This prevents resizing for the entire grid, regardless of individual rowDef options.
   *
   * @example
   <doc:example module="app">
   <doc:source>
   <script>
   var app = angular.module('app', ['ui.grid', 'ui.grid.resizeRows']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.gridOpts = {
            data: [
              { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
              { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
              { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
              { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
            ]
          };
        }]);
   </script>

   <div ng-controller="MainCtrl">
   <div class="testGrid" ui-grid="gridOpts" ui-grid-resize-rows ></div>
   </div>
   </doc:source>
   <doc:scenario>

   </doc:scenario>
   </doc:example>
   */
  module.directive('uiGridResizeRows', ['gridUtil', 'uiGridResizeRowsService', function (gridUtil, uiGridResizeRowsService) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridResizeRowsService.defaultGridOptions(uiGridCtrl.grid.options);
            uiGridCtrl.grid.registerRowBuilder( uiGridResizeRowsService.rowResizerRowBuilder);
            uiGridResizeRowsService.registerPublicApi(uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  // Extend the uiGridHeaderCell directive
  /*module.directive('uiGridHeaderCell', ['gridUtil', '$templateCache', '$compile', '$q', 'uiGridResizeRowsService', 'uiGridConstants', '$timeout', function (gridUtil, $templateCache, $compile, $q, uiGridResizeRowsService, uiGridConstants, $timeout) {
    return {
      // Run after the original uiGridHeaderCell
      priority: -10,
      require: '^uiGrid',
      // scope: false,
      compile: function() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            var grid = uiGridCtrl.grid;

            if (grid.options.enableRowResizing) {
              var rowResizerElm = $templateCache.get('ui-grid/rowResizer');

              var rtlMultiplier = 1;
              //when in RTL mode reverse the direction using the rtlMultiplier and change the position to left
              if (grid.isRTL()) {
                $scope.position = 'left';
                rtlMultiplier = -1;
              }

              var displayResizers = function(){

                // remove any existing resizers.
                var resizers = $elm[0].getElementsByClassName('ui-grid-row-resizer');
                for ( var i = 0; i < resizers.length; i++ ){
                  angular.element(resizers[i]).remove();
                }

                // get the target row for the left resizer
                var otherRow = uiGridResizeRowsService.findTargetRow($scope.row, 'left', rtlMultiplier);
                var renderContainer = $scope.row.getRenderContainer();

                // Don't append the left resizer if this is the first row or the row to the left of this one has resizing disabled
                if (otherRow && renderContainer.visibleRowCache.indexOf($scope.row) !== 0 && otherRow.rowDef.enableRowResizing !== false) {
                  var resizerLeft = angular.element(rowResizerElm).clone();
                  resizerLeft.attr('position', 'left');

                  $elm.prepend(resizerLeft);
                  $compile(resizerLeft)($scope);
                }

                // Don't append the right resizer if this row has resizing disabled
                if ($scope.row.rowDef.enableRowResizing !== false) {
                  var resizerRight = angular.element(rowResizerElm).clone();
                  resizerRight.attr('position', 'right');

                  $elm.append(resizerRight);
                  $compile(resizerRight)($scope);
                }
              };

              displayResizers();

              var waitDisplay = function(){
                $timeout(displayResizers);
              };

              var dataChangeDereg = grid.registerDataChangeCallback( waitDisplay, [uiGridConstants.dataChange.ROW] );

              $scope.$on( '$destroy', dataChangeDereg );
            }
          }
        };
      }
    };
  }]);*/

  // Extend the uiGridRow directive
  module.directive('uiGridRow', ['gridUtil', '$templateCache', '$compile', '$q', 'uiGridResizeRowsService', 'uiGridConstants', '$timeout', function(gridUtil, $templateCache, $compile, $q, uiGridResizeRowsService, uiGridConstants, $timeout) {
    return {
      //replace: true,
      // Run after the original uiGridHeaderCell      
      priority: -10,
      // templateUrl: 'ui-grid/ui-grid-row',
      require: ['^uiGrid', '^uiGridRenderContainer'],
//      scope: {
//         row: '=uiGridRow',
//         //rowRenderIndex is added to scope to give the true visual index of the row to any directives that need it
//         rowRenderIndex: '='
//      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, controllers) {
//            var uiGridCtrl = controllers[0];
//            var containerCtrl = controllers[1];
//
//            var grid = uiGridCtrl.grid;
//
//            $scope.grid = uiGridCtrl.grid;
//            $scope.colContainer = containerCtrl.colContainer;
//
//            // Function for attaching the template to this scope
//            var clonedElement, cloneScope;
//            function compileTemplate() {
//              $scope.row.getRowTemplateFn.then(function (compiledElementFn) {
//                // var compiledElementFn = $scope.row.compiledElementFn;
//
//                // Create a new scope for the contents of this row, so we can destroy it later if need be
//                var newScope = $scope.$new();
//
//                compiledElementFn(newScope, function (newElm, scope) {
//                  // If we already have a cloned element, we need to remove it and destroy its scope
//                  if (clonedElement) {
//                    clonedElement.remove();
//                    cloneScope.$destroy();
//                  }
//
//                  // Empty the row and append the new element
//                  $elm.empty().append(newElm);
//
//                  // Save the new cloned element and scope
//                  clonedElement = newElm;
//                  cloneScope = newScope;
//                });
//              });
//            }
//
//            // Initially attach the compiled template to this scope
//            compileTemplate();
//
//            // If the row's compiled element function changes, we need to replace this element's contents with the new compiled template
//            $scope.$watch('row.getRowTemplateFn', function (newFunc, oldFunc) {
//              if (newFunc !== oldFunc) {
//                compileTemplate();
//              }
//            });
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
           var grid = uiGridCtrl[0].grid;
            // Yah
            if (grid.options.enableRowResizing) {
              var rowResizerElm = $templateCache.get('ui-grid/rowResizer');

              var rtlMultiplier = 1;
              //when in RTL mode reverse the direction using the rtlMultiplier and change the position to left
              //if (grid.isRTL()) {
              //  $scope.position = 'left';
              //  rtlMultiplier = -1;
              //}

              var displayResizers = function(){

                // remove any existing resizers.
                var resizers = $elm[0].getElementsByClassName('ui-grid-row-resizer');
                for ( var i = 0; i < resizers.length; i++ ){
                  angular.element(resizers[i]).remove();
                }

                // get the target row for the left resizer
                var otherRow = uiGridResizeRowsService.findTargetRow($scope.row, 'top', rtlMultiplier);
                //var renderContainer = $scope.row.getRenderContainer();
                var renderContainer = $scope.row.grid.renderContainers['body'];

                // Don't append the left resizer if this is the first row
                if (otherRow && renderContainer.visibleRowCache.indexOf($scope.row) !== 0) {
                  var resizerTop = angular.element(rowResizerElm).clone();
                  resizerTop.attr('position', 'top');

                  $elm.before(resizerTop);
                  $compile(resizerTop)($scope);
                }

                var resizerBottom = angular.element(rowResizerElm).clone();
                resizerBottom.attr('position', 'bottom');

                $elm.after(resizerBottom);
                $compile(resizerBottom)($scope);
              };

              displayResizers();

              var waitDisplay = function(){
                $timeout(displayResizers);
              };

              var dataChangeDereg = grid.registerDataChangeCallback( waitDisplay, [uiGridConstants.dataChange.ROW] );

              $scope.$on( '$destroy', dataChangeDereg );
            }
          }
        };
      }
    };
  }]);
  
  /**
  *  @ngdoc directive
  *  @name ui.grid.treeBase.directive:uiGridViewport
  *  @element div
  *
  *  @description Stacks on top of ui.grid.uiGridViewport to set formatting on a tree header row
  */
  module.directive('uiGridViewport',
  ['$compile', 'uiGridConstants', 'gridUtil', '$parse',
    function ($compile, uiGridConstants, gridUtil, $parse) {
      return {
        priority: -300, // run after default  directive
        scope: false,
        compile: function ($elm, $attrs) {
          var rowRepeatDiv = angular.element($elm.children().children()[0]);

          var existingNgClass = rowRepeatDiv.attr("ng-class");
          //var newNgClass = '';
          //if ( existingNgClass ) {
          //  newNgClass = existingNgClass.slice(0, -1) + ",'ui-grid-tree-header-row': row.treeLevel > -1}";
          //} else {
          //  newNgClass = "{'ui-grid-tree-header-row': row.treeLevel > -1}";
          //}
          //rowRepeatDiv.attr("ng-class", newNgClass);

          return {
            pre: function ($scope, $elm, $attrs, controllers) {

            },
            post: function ($scope, $elm, $attrs, controllers) {
            }
          };
        }
      };
    }]);


  /**
   * @ngdoc directive
   * @name ui.grid.resizeRows.directive:uiGridRowResizer
   * @element div
   * @restrict A
   *
   * @description
   * Draggable handle that controls row resizing.
   *
   * @example
   <doc:example module="app">
     <doc:source>
       <script>
        var app = angular.module('app', ['ui.grid', 'ui.grid.resizeRows']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.gridOpts = {
            enableRowResizing: true,
            data: [
              { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
              { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
              { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
              { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
            ]
          };
        }]);
       </script>

       <div ng-controller="MainCtrl">
        <div class="testGrid" ui-grid="gridOpts"></div>
       </div>
     </doc:source>
     <doc:scenario>
      // TODO: e2e specs?

      // TODO: post-resize a horizontal scroll event should be fired
     </doc:scenario>
   </doc:example>
   */
  module.directive('uiGridRowResizer', ['$document', 'gridUtil', 'uiGridConstants', 'uiGridResizeRowsService', function ($document, gridUtil, uiGridConstants, uiGridResizeRowsService) {
    var resizeOverlay = angular.element('<div class="ui-grid-resize-overlay"></div>');

    var resizer = {
      priority: 0,
      scope: {
        row: '=',
        position: '@',
        renderIndex: '='
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var startY = 0,
            y = 0,
            gridLeft = 0,
            gridTop = 0,
            rtlMultiplier = 1;

        //when in RTL mode reverse the direction using the rtlMultiplier and change the position to left
        //if (uiGridCtrl.grid.isRTL()) {
        $scope.position = 'top';
        //  rtlMultiplier = -1;
        //}

        if ($scope.position === 'top') {
          $elm.addClass('top');
        }
        else if ($scope.position === 'bottom') {
          $elm.addClass('bottom');
        }

        // Refresh the grid canvas
        //   takes an argument representing the diff along the X-axis that the resize had
        function refreshCanvas(yDiff) {
          // Then refresh the grid canvas, rebuilding the styles so that the scrollbar updates its size
          uiGridCtrl.grid.refreshCanvas(true).then( function() {
            uiGridCtrl.grid.queueGridRefresh();
          });
        }

        // Check that the requested width isn't wider than the maxWidth, or narrower than the minWidth
        // Returns the new recommended with, after constraints applied
        function constrainHeight(row, height){
          var newHeight = height;

          // If the new width would be less than the row's allowably minimum width, don't allow it
          if (row.minHeight && newHeight < row.minHeight) {
            newHeight = row.minHeight;
          }
          else if (row.maxHeight && newHeight > row.maxHeight) {
            newHeight = row.maxHeight;
          }

          return newHeight;
        }


        /*
         * Our approach to event handling aims to deal with both touch devices and mouse devices
         * We register down handlers on both touch and mouse.  When a touchstart or mousedown event
         * occurs, we register the corresponding touchmove/touchend, or mousemove/mouseend events.
         *
         * This way we can listen for both without worrying about the fact many touch devices also emulate
         * mouse events - basically whichever one we hear first is what we'll go with.
         */
        function moveFunction(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          y = (event.targetTouches ? event.targetTouches[0] : event).clientY - gridTop;

          if (y < 0) { y = 0; }
          else if (y > uiGridCtrl.grid.gridHeight) { y = uiGridCtrl.grid.gridHeight; }

          var row = uiGridResizeRowsService.findTargetRow($scope.row, $scope.position, rtlMultiplier);

          // Don't resize if it's disabled on this row
          //if (row.rowDef.enableRowResizing === false) {
          //  return;
          //}

          if (!uiGridCtrl.grid.element.hasClass('row-resizing')) {
            uiGridCtrl.grid.element.addClass('row-resizing');
          }

          // Get the diff along the X axis
          var yDiff = y - startY;

          // Get the width that this mouse would give the row
          var newHeight = parseInt(row.drawnHeight + yDiff * rtlMultiplier, 10);

          // check we're not outside the allowable bounds for this row
          y = y + ( constrainHeight(row, newHeight) - newHeight ) * rtlMultiplier;

          resizeOverlay.css({ top: y + 'px' });

          uiGridCtrl.fireEvent(uiGridConstants.events.ITEM_DRAGGING);
        }


        function upFunction(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          uiGridCtrl.grid.element.removeClass('row-resizing');

          resizeOverlay.remove();

          // Resize the row
          y = (event.changedTouches ? event.changedTouches[0] : event).clientY - gridTop;
          var yDiff = y - startY;

          if (yDiff === 0) {
            // no movement, so just reset event handlers, including turning back on both
            // down events - we turned one off when this event started
            offAllEvents();
            onDownEvents();
            return;
          }

          var row = uiGridResizeRowsService.findTargetRow($scope.row, $scope.position, rtlMultiplier);

          // Don't resize if it's disabled on this row
          //if (row.rowDef.enableRowResizing === false) {
          //  return;
          //}

          // Get the new width
          var newHeight = parseInt(row.drawnHeight + yDiff * rtlMultiplier, 10);

          // check we're not outside the allowable bounds for this row
          row.Height = constrainHeight(row, newHeight);
          row.hasCustomHeight = true;

          refreshCanvas(yDiff);

          uiGridResizeRowsService.fireRowSizeChanged(uiGridCtrl.grid, row.rowDef, yDiff);

          // stop listening of up and move events - wait for next down
          // reset the down events - we will have turned one off when this event started
          offAllEvents();
          onDownEvents();
        }


        var downFunction = function(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.stopPropagation();

          // Get the left offset of the grid
          // gridLeft = uiGridCtrl.grid.element[0].offsetLeft;
          gridLeft = uiGridCtrl.grid.element[0].getBoundingClientRect().left;
          gridTop = uiGridCtrl.grid.element[0].getBoundingClientRect().top;

          // Get the starting X position, which is the X coordinate of the click minus the grid's offset
          //startX = (event.targetTouches ? event.targetTouches[0] : event).clientX - gridLeft;
          startY = (event.targetTouches ? event.targetTouches[0] : event).clientY - gridTop;

          // Append the resizer overlay
          uiGridCtrl.grid.element.append(resizeOverlay);

          // Place the resizer overlay at the start position
          //resizeOverlay.css({ left: startX });
          resizeOverlay.css({ top: startY });

          // Add handlers for move and up events - if we were mousedown then we listen for mousemove and mouseup, if
          // we were touchdown then we listen for touchmove and touchup.  Also remove the handler for the equivalent
          // down event - so if we're touchdown, then remove the mousedown handler until this event is over, if we're
          // mousedown then remove the touchdown handler until this event is over, this avoids processing duplicate events
          if ( event.type === 'touchstart' ){
            $document.on('touchend', upFunction);
            $document.on('touchmove', moveFunction);
            $elm.off('mousedown', downFunction);
          } else {
            $document.on('mouseup', upFunction);
            $document.on('mousemove', moveFunction);
            $elm.off('touchstart', downFunction);
          }
        };

        var onDownEvents = function() {
          $elm.on('mousedown', downFunction);
          $elm.on('touchstart', downFunction);
        };

        var offAllEvents = function() {
          $document.off('mouseup', upFunction);
          $document.off('touchend', upFunction);
          $document.off('mousemove', moveFunction);
          $document.off('touchmove', moveFunction);
          $elm.off('mousedown', downFunction);
          $elm.off('touchstart', downFunction);
        };

        onDownEvents();


        // On doubleclick, resize to fit all rendered cells
        var dblClickFn = function(event, args){
          event.stopPropagation();

          var row = uiGridResizeRowsService.findTargetRow($scope.row, $scope.position, rtlMultiplier);

          // Don't resize if it's disabled on this row
          //if (row.rowDef.enableRowResizing === false) {
          //  return;
          //}

          // Go through the rendered rows and find out the max size for the data in this row
          var maxHeight = 0;
          var yDiff = 0;

          // Get the parent render container element
          var renderContainerElm = gridUtil.closestElm($elm, '.ui-grid-render-container');

          // Get the cell contents so we measure correctly. For the header cell we have to account for the sort icon and the menu buttons, if present
          var cells = renderContainerElm.querySelectorAll('.' + uiGridConstants.COL_CLASS_PREFIX + row.uid + ' .ui-grid-cell-contents');
          Array.prototype.forEach.call(cells, function (cell) {
              // Get the cell width
              // gridUtil.logDebug('width', gridUtil.elementWidth(cell));

              // Account for the menu button if it exists
              var menuButton;
              if (angular.element(cell).parent().hasClass('ui-grid-header-cell')) {
                menuButton = angular.element(cell).parent()[0].querySelectorAll('.ui-grid-row-menu-button');
              }

              gridUtil.fakeElement(cell, {}, function(newElm) {
                // Make the element float since it's a div and can expand to fill its container
                var e = angular.element(newElm);
                e.attr('style', 'float: left');

                var height = gridUtil.elementHeight(e);

                if (menuButton) {
                  var menuButtonHeight = gridUtil.elementHeight(menuButton);
                  height = height + menuButtonHeight;
                }

                if (height > maxHeight) {
                  maxHeight = height;
                  yDiff = maxHeight - height;
                }
              });
            });

          // check we're not outside the allowable bounds for this row
          row.height = constrainHeight(row, maxHeight);
          row.hasCustomHeight = true;

          refreshCanvas(yDiff);

          uiGridResizeRowsService.fireRowSizeChanged(uiGridCtrl.grid, row.rowDef, yDiff);        
        };
        
        $elm.on('dblclick', dblClickFn);

        $elm.on('$destroy', function() {
          $elm.off('dblclick', dblClickFn);
          offAllEvents();
        });
      }
    };

    return resizer;
  }]);

})();
