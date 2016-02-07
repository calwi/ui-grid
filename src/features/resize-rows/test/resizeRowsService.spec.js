describe('uiGridResizeRowsService', function () {
  var uiGridResizeRowsService;

  beforeEach(module('ui.grid.resizeRows'));

  beforeEach(inject(function (_uiGridResizeRowsService_) {
    uiGridResizeRowsService = _uiGridResizeRowsService_;
  }));

  describe('defaultGridOptions', function () {
    it('should default enableRowResizing to true', function () {
      var gridOptions = {};
      uiGridResizeRowsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableRowResizing).toBe(true);
    });

    it('should not override false gridOptions.enableRowResizing', function () {
      var gridOptions = {enableRowResizing:false};
      uiGridResizeRowsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableRowResizing).toBe(false);
    });

    it('should not override false gridOptions.enableRowResize (legacy support)', function () {
      var gridOptions = {enableRowResize:false};
      uiGridResizeRowsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableRowResizing).toBe(false);
    });
  });

  describe('rowResizerRowBuilder', function () {
    it('should default enableRowResizing to true', inject(function ($timeout) {
      var rowDef = {name:'row1'};
      var gridOptions = {enableRowResizing:true, rowDefs:[rowDef]};
      $timeout(function(){
        uiGridResizeRowsService.rowResizerRowBuilder(rowDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.rowDefs[0].enableRowResizing).toBe(true);
    }));

    it('should not override a rowDef setting enableRowResizing', inject(function ($timeout) {
      var rowDef = {name:'row1', enableRowResizing:false};
      var gridOptions = {enableRowResizing:true, rowDefs:[rowDef]};
      $timeout(function(){
        uiGridResizeRowsService.rowResizerRowBuilder(rowDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.rowDefs[0].enableRowResizing).toBe(false);
    }));

    it('should override gridOptions enableRowResizing', inject(function ($timeout) {
      var rowDef = {name:'row1', enableRowResizing:true};
      var gridOptions = {enableRowResizing:false, rowDefs:[rowDef]};
      $timeout(function(){
        uiGridResizeRowsService.rowResizerRowBuilder(rowDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.rowDefs[0].enableRowResizing).toBe(true);
    }));

    it('should default enableRowResizing to false if gridOptions is false', inject(function ($timeout) {
      var rowDef = {name:'row1'};
      var gridOptions = {enableRowResizing:false, rowDefs:[rowDef]};
      $timeout(function(){
        uiGridResizeRowsService.rowResizerRowBuilder(rowDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.rowDefs[0].enableRowResizing).toBe(false);
    }));

  });
});