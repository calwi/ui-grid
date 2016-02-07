describe('ui.grid.resizeRows', function () {
  var grid, gridUtil, gridScope, $scope, $compile, recompile, uiGridConstants;

  var downEvent, upEvent, moveEvent;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];

  beforeEach(module('ui.grid'));
  beforeEach(module('ui.grid.resizeRows'));

  beforeEach(inject(function (_$compile_, $rootScope, _uiGridConstants_, _gridUtil_) {
    $scope = $rootScope;
    $compile = _$compile_;
    uiGridConstants = _uiGridConstants_;
    gridUtil = _gridUtil_;

    if (gridUtil.isTouchEnabled()) {
      downEvent = 'touchstart';
      upEvent = 'touchend';
      moveEvent = 'touchmove';
    }
    else {
      downEvent = 'mousedown';
      upEvent = 'mouseup';
      moveEvent = 'mousemove';
    }

    $scope.gridOpts = {
      enableRowResizing: true,
      data: data
    };

    $scope.gridOpts.onRegisterApi = function (gridApi) {
      $scope.gridApi = gridApi;
    };
    
    recompile = function () {
      gridUtil.resetUids();

      grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts" ui-grid-resize-rows></div>');
      document.body.appendChild(grid[0]);
      $compile(grid)($scope);
      $scope.$digest();
      gridScope = $(grid).isolateScope();
    };

    recompile();
  }));

  afterEach(function () {
    angular.element(grid).remove();
    grid = null;
  });

  describe('checking grid api for rowResizable', function() {
    it('rowSizeChanged should be defined', function () {
      expect($scope.gridApi.rowResizable.on.rowSizeChanged).toBeDefined();
    });
  });
  
  describe('setting enableRowResizing', function () {
    it('should by default cause resizer to be attached to the header elements', function () {
      var resizers = $(grid).find('[ui-grid-row-resizer]');

      expect(resizers.size()).toEqual(5);
    });

    it('should only attach a right resizer to the first row', function () {
      var firstRow = $(grid).find('[ui-grid-header-cell]').first();

      var resizers = $(firstRow).find('[ui-grid-row-resizer]');

      expect(resizers.size()).toEqual(1);

      expect(resizers.first().attr('position')).toEqual('right');
      expect(resizers.first().hasClass('right')).toBe(true);
    });

    it('should attach left and right resizers to the last row', function () {
      var firstRow = $(grid).find('[ui-grid-header-cell]').last();

      var resizers = $(firstRow).find('[ui-grid-row-resizer]');

      expect(resizers.size()).toEqual(2);

      expect(resizers.first().attr('position')).toEqual('left');
      expect(resizers.first().hasClass('left')).toBe(true);
    });
  });

  describe('setting enableRowResizing to false', function () {
    it('should result in no resizer elements being attached to the row', function () {
      $scope.gridOpts.enableRowResizing = false;
      recompile();

      var resizers = $(grid).find('[ui-grid-row-resizer]');

      expect(resizers.size()).toEqual(0);
    });
  });

  describe('setting flag on rowDef to false', function () {
    it('should result in only one resizer elements being attached to the row and the row to it\'s right', function () {
      $scope.gridOpts.rowDefs = [
        { field: 'name' },
        { field: 'gender', enableRowResizing: false },
        { field: 'company' }
      ];

      recompile();

      var middleRow = $(grid).find('[ui-grid-header-cell]:nth-child(2)');
      var resizer = middleRow.find('[ui-grid-row-resizer]');

      expect(resizer.size()).toEqual(1);

      var lastRow = $(grid).find('[ui-grid-header-cell]:nth-child(3)');
      resizer = lastRow.find('[ui-grid-row-resizer]');

      expect(resizer.size()).toEqual(1);
    });
  });

  // NOTE: these pixel sizes might fail in other browsers, due to font differences!
  describe('double-clicking a resizer', function () {
    // TODO(c0bra): We account for menu button and sort icon size now, so this test is failing.
    xit('should resize the row to the maximum width of the rendered rows', function (done) {
      var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();

      var rowWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + '0').first().width();

      expect(rowWidth === 166 || rowWidth === 167).toBe(true); // allow for row widths that don't equally divide 

      firstResizer.trigger('dblclick');

      $scope.$digest();

      var newRowWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + '0').first().width();

      // Can't really tell how big the rows SHOULD be, we'll just expect them to be different in width now
      expect(newRowWidth).not.toEqual(rowWidth);
    });
  });

  describe('clicking on a resizer', function () {
    it('should cause the row separator overlay to be added', function () {
      var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();

      firstResizer.trigger(downEvent);
      $scope.$digest();

      var overlay = $(grid).find('.ui-grid-resize-overlay');

      expect(overlay.size()).toEqual(1);

      // The grid shouldn't have the resizing class
      expect(grid.hasClass('row-resizing')).toEqual(false);
    });

    describe('and moving the mouse', function () {
      var xDiff, initialWidth, initialX, overlay, initialOverlayX;

      beforeEach(function () {
        var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();

        // Get the initial width of the row
        var firstRowUid = gridScope.grid.rows[0].uid;
        initialWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstRowUid).first().width();

        initialX = firstResizer.position().left;
        
        $(firstResizer).simulate(downEvent, { clientX: initialX });
        $scope.$digest();

        // Get the overlay
        overlay = $(grid).find('.ui-grid-resize-overlay');
        initialOverlayX = $(overlay).position().left;

        xDiff = 100;
        $(document).simulate(moveEvent, { clientX: initialX + xDiff });
        $scope.$digest();
      });

      it('should add the row-resizing class to the grid', function () {
        // The grid should have the resizing class
        expect(grid.hasClass('row-resizing')).toEqual(true);
      });

      it('should cause the overlay to appear', function () {
        expect(overlay.is(':visible')).toEqual(true);
      });

      // TODO(c0bra): This test is failing on Travis (PhantomJS on Linux).
      xit('should cause the overlay to move', function () {
        // TODO(c0bra): This tests fails on IE9 and Opera on linx. It gets 253 instead if 262 (9 pixels off)
        //expect($(overlay).position().left).toEqual( (initialX + xDiff + 1) ); // Extra one pixel here for grid border
        expect($(overlay).position().left).not.toEqual(initialX); // Extra one pixel here for grid border
      });

      describe('then releasing the mouse', function () {
        beforeEach(function () {       
          $(document).simulate(upEvent, { clientX: initialX + xDiff });
          $scope.$digest();
        });

        it('should cause the row to resize by the amount change in the X axis', function () {
          var firstRowUid = gridScope.grid.rows[0].uid;
          var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstRowUid).first().width();
          expect(newWidth - initialWidth).toEqual(xDiff);
        });

        it('should remove the overlay', function () {
          var overlay = $(grid).find('.ui-grid-resize-overlay');

          expect(overlay.size()).toEqual(0);
        });
      });
    });
  });

  describe('when a row has a minWidth', function () {
    var minWidth;

    beforeEach(function () {
      minWidth = 200;

      $scope.gridOpts.rowDefs = [
        { field: 'name', minWidth: minWidth },
        { field: 'gender' },
        { field: 'company' }
      ];
      
      recompile();
    });

    describe('and you double-click its resizer, the row width', function () {
      it('should not go below the minWidth less border', function () {
        var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();

        $(firstResizer).simulate('dblclick');
        $scope.$digest();

        var firstRowUid = gridScope.grid.rows[0].uid;

        var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstRowUid).first().width();

        expect(newWidth >= (minWidth - 1)).toEqual(true);
      });
    });

    describe('and you move its resizer left further than the minWidth, the row width', function () {
      var initialX;

      beforeEach(function () {
        var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();
        initialX = firstResizer.position().left;

        $(firstResizer).simulate(downEvent, { clientX: initialX });
        $scope.$digest();

        $(document).simulate(upEvent, { clientX: initialX - minWidth });
        $scope.$digest();
      });

      it('should not go below the minWidth less border', function () {
        var firstRowUid = gridScope.grid.rows[0].uid;

        var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstRowUid).first().width();

        expect(newWidth >= (minWidth - 1)).toEqual(true);
      });
    });
  });
  
  // Don't run this on IE9. The behavior looks correct when testing interactively but these tests fail
  if (!navigator.userAgent.match(/MSIE\s+9\.0/)) {
    describe('when a row has a maxWidth', function () {
      var maxWidth;

      beforeEach(function () {
        maxWidth = 60;

        $scope.gridOpts.rowDefs = [
          { field: 'name', maxWidth: maxWidth },
          { field: 'gender' },
          { field: 'company' }
        ];

        recompile();
      });

      describe('and you double-click its resizer', function () {
        it('the row width should not go above the maxWidth', function () {
          var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();

          $(firstResizer).simulate('dblclick');
          $scope.$digest();

          var firstRowUid = gridScope.grid.rows[0].uid;

          var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstRowUid).first().width();

          expect(newWidth <= maxWidth).toEqual(true);
        });
      });

      describe('and you move its resizer right further than the maxWidth, the row width', function () {
        var initialX;

        beforeEach(function () {
          var firstResizer = $(grid).find('[ui-grid-row-resizer]').first();
          initialX = firstResizer.position().left;

          $(firstResizer).simulate(downEvent, { clientX: initialX });
          $scope.$digest();

          $(document).simulate(upEvent, { clientX: initialX + maxWidth });
          $scope.$digest();
        });

        it('should not go above the maxWidth', function () {
          var firstRowUid = gridScope.grid.rows[0].uid;

          var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstRowUid).first().width();

          expect(newWidth <= maxWidth).toEqual(true);
        });
      });
    });
  }
});