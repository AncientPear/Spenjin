describe("rClass", function() {

  describe("Returns a subclass", function() {
    var subclass=rClass(function(){},{method:function(){return true;}});

    it('Is a function',function(){
      expect(typeof subclass).toBe('function');
    });

    it('subclass returns objects',function(){
      expect(typeof subclass()).toBe('object');
    });

    it('objects have prototypes',function(){
      expect(subclass().method()).toBeTruthy();
    });

  });
});








/*var DrawableMonster = rClass(function (level) {
      this.level=(level || 0);

  }, {
    eatHuman:function () {
      console.log('human consumed');
    },
      draw:function(context,fixture){
          context.fillStyle="black";
          context.fillRect(0,0,32,32);
      },
    recycle:function(){
      this.super.recycle.call(this);//recycle self
    }
  });*/
