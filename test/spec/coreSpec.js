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


    /*//test Artist
    console.info('Commencing tests...');
    var worldView=View('c');
    console.info('View created...');
    worldView.Slide();
    console.info('Slide created...');
    var M=worldView.slides[0].Fixture(DrawableMonster(999),Vec3(0,0,0),BoundB4(32,32));
    var M2=worldView.slides[0].Fixture(UnDrawableMonster(1),Vec3(0,0,0),BoundB4(32,32));
    console.info('Fixtures/Monsters created');
    var worldClock=Clock(true);
    console.info('Clock created');
    worldView.Artist(worldClock);
    console.info('Artist attached, atempting to create another with same View...');
    worldClock.looping=true;
    console.info('Clock running');


    var clock=Clock(3000);
    clock.pinMission(function(dtime){console.log(dtime);});
    clock.looping=true;*/
