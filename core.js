'use strict';

    var rClass = (function () {

	/*var recent = function () {//every actual object constructor will share this method
		return (this.instanceArray.length> 0) ? this.instanceArray[this.instanceArray.length - 1] :null;
	};//add more functions like this to create methods for the "final constructor"*/

	return function (constructor, prototypeProps) {//rClass

		//convert prototypeProps into properties object
		for (var i in prototypeProps){
			var quicksave=prototypeProps[i];
			prototypeProps[i]={
				value:quicksave,
				writable: false,
     		enumerable: true,
     	  configurable: false
			};
		}

		var instanceRecycleStack = [];

		var outerProto={
			recycle:function() {
				if (instanceRecycleStack.length<100) {
                     for (var i in instanceRecycleStack){//check if object has been recycled
                         if (instanceRecycleStack[i]===this) {
                             throw {error:'Object has already been recycled!', object:this};
                         }
                     }

                    instanceRecycleStack.push(this);//add to recycle pile
                }
			}
		};
		var innerProto=Object.create(outerProto,prototypeProps)
		innerProto.constructor = constructor;//all objects can refer back to their constructor
		innerProto.super=outerProto;

		constructor.prototype = innerProto;//never actually used here...Yet

		function ret() {//function that is returned

			if (instanceRecycleStack.length>0) {
				var instance=instanceRecycleStack.pop();
				constructor.apply(instance, arguments);//reuse old instance
			}
			else {
				var instance = Object.create(innerProto);//make new instance if there is none to recycle
				constructor.apply(instance, arguments);//call constructor on new object
				Object.seal(instance);//sealed for recyclibility
			}
			return instance;
		};

		return ret;
	}

}());

//TODO: find a home for the next three
var Vec3 = rClass(function(x,y,z){
		this.x=x;
		this.y=y;
		this.z=z;
	},{
		add:function(vec3){
			this.x+=vec3.x;
			this.y+=vec3.y;
			this.z+=vec3.z;
		}
	}
);

var Vec2 = rClass(function(x,y){
		this.x=x;
		this.y=y;
	},{
		add:function(vec2){
			this.x+=vec2.x;
			this.y+=vec2.y;
		}
	}
);

var BoundB4 = rClass(function(width,height){
        this.width=width;
        this.height=height;
    },{
        //prototype
    }
);

var Clock = (function() {


    var Mission=rClass(function(action){
        this.timeStamp=(new Date().getTime());
        this.__action=action;
    },{
        run:function(){
            var currentTime=(new Date().getTime());
            this.__action(currentTime-this.timeStamp);//send elapsed miliseconds to every action
            this.timeStamp=currentTime;
        }
    });

	var loopingDescriptor={
		get:function(){
			if (this.loopId!==false) {return true;}
			else {return false;}
		},
		set:function(bool){
			if (bool && this.loopId===false){
				if (typeof (this.loopType)==='number'){
					this.loopId=window.setInterval(this.__executeMissionsBound, this.loopType);
				}
				else {
					this.loopId=window.requestAnimationFrame(this.__executeMissionsBound);
				}

                //reset all time stamps
                for (var i in this.__missions){
                    this.__missions[i].timeStamp=(new Date().getTime());
                }

			}
			else if (!bool && this.loopId!==false){
				if (typeof (this.loopType)==='number'){
					window.clearInterval(this.loopId);
					this.loopId=false;
				}
				else {
					window.cancelAnimationFrame(this.loopId);
					this.loopId=false;
				}
			}
		}
	};

    var __executeMissions=function(){

		if (this.looping && typeof (this.loopId)!=='number') {this.loopId=window.requestAnimationFrame(this.__executeMissionsBound);}

        for (var i in this.__missions){//Not Ordered
			this.__missions[i].run();
		}
	};

	return rClass(function(loopType){//loopType: framerate number or it'll use RAF

			this.loopType=loopType;
			this.loopId=false;
			this.__executeMissionsBound=__executeMissions.bind(this);//bound to this so it can be called from interval
			Object.defineProperty(this,'looping', loopingDescriptor);
			this.__missions = [];//stack of functions for clock to call on interval
		},{
			    pinMission:function(action){//add mission (function) to clock
                    this.__missions.push(Mission(action));
				},
                unpinMission:function(action){//remove mission from clock
                    for (var i in this.__missions){
                        if (this.__missions[i].__action===action){
                            this.__missions[i].recycle();
                            this.__missions.splice(i,1);
                            return;
                        }
                    }
                    throw {error:'action not found in __missions', action:action};
				},
				recycle:function(){
					this.looping=false;
                    for (var i in this.__missions){
                        this.missions[i].recycle();
                    }
					this.super.recycle.call(this);
				}
		});
}());

var View = rClass(function(canvasElement){
        if (typeof (canvasElement)==='string') {this.canvasElement=document.getElementById(canvasElement);}//treat canvasElement as an Id
        else {this.canvasElement=canvasElement;}
        this.width=this.canvasElement.width;
        this.height=this.canvasElement.height;
        this.context=this.canvasElement.getContext('2d');
        this.slides=[];
        this.artist=false;
        this.physicist=false;
    },(function(){

        var Artist=(function(){

            var paintView=function(){
                //TODO: incorporate 3rd dimension (depth)
                    var context=this.view.context;

                    context.clearRect(0,0,this.view.width,this.view.height)//clear canvas
                    var slides=this.view.slides;

                    for (var i in slides) {
                        if (slides[i].paint){//check if slide gets painted

                            for (var ii in slides[i].fixtures){

                                var fixture=slides[i].fixtures[ii];

                                if (fixture.paint){//check if fixture is painted

                                    if (typeof (fixture.instance.draw)==='function') {
                                        var xdiff=(fixture.pos.x - slides[i].cameraPos.x),//draw fixture in the right spot
                                            ydiff=(fixture.pos.y - slides[i].cameraPos.y);
                                        if ((xdiff>=0 && xdiff<this.view.width) && (ydiff>=0 && ydiff<this.view.height)){//check if fixture's inside canvas
                                            context.save();
                                            context.translate(xdiff, ydiff);
                                            fixture.instance.draw(context,fixture);//draw
                                            context.restore();
                                        }
                                        else {continue;}//fixture not in canvas
                                    }

                                   else{fixture.paint=false;}//auto switch (remove for perf)
                               }
                           }
                      }
                 }

         };

            return rClass(function(view,clock){//Paints views
                if (view.artist!=false) {throw "View already has an Artist";}
                else {view.artist=this;}
                this.clock=clock;
                this.view=view;
                this.paintView=paintView.bind(this);
                clock.pinMission(this.paintView);
            },{
                recycle:function(){
                    this.view.artist=false;//View is free to create an Artist again
                    this.clock.unpinMission(this.paintView);
                    this.super.recycle.call(this);
                }
            });
      }());


         var Slide=rClass(function(view){//where fixtures are stored
                this.view=view;
                this.cameraPos=Vec2(0,0);//relative to top-left of canvas
                this.fixtures=[];//instances with coordinates attached
                this.paint=true;//visible
                this.physics=true;//if slide has physics
                view.slides.push(this);
            },(function(){

             var Fixture=rClass(function(slide,instance,vec3,boundb4,OPTphysics,OPTpaint){//fixtures go in slides
                    this.slide=slide;
                    this.instance=instance;
                    this.pos=vec3;
                    this.vel=Vec2(0,0);//starts at rest
                    this.acc=Vec2(0,0);//acceleration
                    this.boundB=boundb4;

                    this.physics=OPTphysics;
                    this.paint=OPTpaint;
                    slide.fixtures.push(this);
                },{

                    recycle:function(fromSlide){//if being recycleed from a Slide splicing will mess it up
                        if (typeof(fromSlide)==='undefined') {this.slide.fixtures.splice(this.slide.fixtures.indexOf(this),1);}//remove from slide's fixtures array
                        this.fixture.recycle();
                        this.pos.recycle();
                        this.vel.recycle();
                        this.boundB.recycle();
                        this.super.recycle.call(this);
                    }
                }
            );

             return {
                    Fixture:function(instance,vec3,boundb4,OPTphysics,OPTpaint){//instance, position, bounding box
                        if (typeof (OPTphysics)==='undefined') {OPTphysics=true;}
                        if (typeof (OPTpaint)==='undefined') {OPTpaint=true;}
                        return Fixture(this,instance,vec3,boundb4,OPTphysics,OPTpaint);
                    },

                    recycle:function(fromView){//if being recycleed from a View splicing will mess it up
                        if (typeof(fromView)==='undefined') {
                            this.view.slides.splice(this.view.slides.indexOf(this),1);
                        }
                        for (var i in this.fixtures){
                            this.fixtures[i].recycle(true);//true because its from a View
                        }
                        this.super.recycle.call(this);
                    }
                }
            }())
        );

            return {//prototype

                Slide:function(){
                    return Slide(this);
                },

                Artist:function(clock){
                    return Artist(this,clock);
                },
                resize:function(){
                    this.width=canvasElement.width;
                    this.height=canvasElement.height;
                },
                recycle:function(){
                    for (var i in this.slides){//recycle all slides
                        this.slides[i].recycle(true);//true because its from a View
                    }
                    if (this.artist) {this.artist.recycle();}//recycle artist
                    if (this.physicist) {this.physicist.recycle();}//recycle physicist
                    this.super.recycle.call(this);
                }
            }
        }())
);


var Physicist=(function(){ //make sure to use timestamp with acceleration

      var physicsView=function(){

                var slides=this.view.slides;

                for (var i in slides) {
                    if (slides[i].physics){//check if slide gets painted

                        for (var ii in slides[i].fixtures){

                           var fixture=slides[i].fixtures[ii];

                           if (fixture.physics){//check if fixture is painted
                               if (typeof (fixture.instance.operate)==='function') {
                                  //TODO: stuff here
                                 //TODO: move fixtures with velocities
                               }

                               else{fixture.physics=false;}//auto switch (remove for perf)
                           }
                       }
                  }
             }
     };

        return rClass(function(view,clock){//Paints views
            if (view.physicist!=false) {throw "View already has a Physicist";}
            else {view.physicist=this;}
            this.clock=clock;
            this.view=view;
            this.physicsView=physicsView.bind(this);
            clock.pinMission(this.physicsView);
        },{
            recycle:function(){
                this.view.physicist=false;//View is free to create an Artist again
                this.clock.unpinMission(this.physicsView);
                this.super.recycle.call(this);
            }
        });
}());
