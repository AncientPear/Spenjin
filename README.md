Spenjin
=======

HTML5 game engine, designed for having multiple locations and velocities on the same objects.


rClass:
  location:GLOBAL
      takes:
              function/constructor,
              Object/prototype
                    --if prototype declares recycle method method must call "this.super.recycle.call(this);" at end
                    --WARNING since prototypes are copied to new objects they cannot have prototypes themselves
      returns:
              Function to be used for creating objects of that class, do not call with "new" operator
                      properties:

                      returns:
                                 a Sealed Object using the constructor/prototype from before but:
                                       prototype has constructor reference attached
                                       prototype has prototype with recycle method
                                       prototype also gets reference to its prototype via "super"
      more info:
                when objects are recycle they're pushed to an array where they're later taken out for reuse (constructor is recalled over them)


Vec2/Vec3:
  location:GLOBAL
           takes:
                   2/3 numbers
           returns:
                   Object, a 2/3 dimensional vector with:
                           x,y(,z) number properties
                           translate method for making translations
           more info:
                     class is made with rClass so all from that applies

BoundB4:
  location:GLOBAL
           takes:
                   2 numbers (width, height)
           returns:
                   Object, a four point bounding box
           more info:
                     class is made with rClass so all from that applies
                     for use in fixtures when Physicist operates

Clock:
  location:GLOBAL
           takes:
                  loopType (framerate or "true" for requestAnimationFrame)
           returns:
                   Object, from clock class has ability to start loops with props:
                           looping (Boolean):
                                   getter/setter that switches loops on and off
                           deltaMiliseconds:
                                   miliseconds since last loop call
                           loopType: *for internal use only
                                 copy of the contructor parameter
                           loopId: *for internal use only
                                 id of loop (number)
                           pinMission:
                                 method takes function and adds it to __missions where it gets called every loop returns
                           unpinMission:
                                 method, takes function then removes it from __missions
                           __missions: *for internal use only
                                 stack of functions that get called each loop returns
                           __executeMissionsBound: *for internal use only
                                 method to run __missions


           more info:
                     class is made with rClass so all from that applies
                     starts a loop up and runs functions in its mission stack (__missions)

//TODO: add Mission spec

View:
  location:GLOBAL
           takes:
                   canvas element or id of a canvas
           returns:
                   Object, Something to hold slides and a reference to the canvas, with properties:
                         canvasElement:
                               DOM element reference to canvas
                         context:
                               reference to the canvas's 2d context
                         slides:
                               array of all slides in this view
                         Slide:
                               class made with "rClass", more documentation below
                         width:
                               width of canvas DOM as of last update
                         height:
                               height of canvas Dom as of last update
                         resize:
                               method, call to update this.width/this.height
                         Artist:
                               make an Artist for View (only 1 allowed), more documentation below
                         artist:
                               reference to View's Artist, false if none
                         physicist:
                               reference to View's physicist, false if none
           more info:
                     class is made with rClass so all from that applies
                     1 needed per canvas, destructor handles everything inside (slides fixtures etc)

Slide:
  location:in View's prototype scope
           takes:
                   nothing
           returns:
                   Object, with properties:
                       view:
                           reference to the view it resides in
                       cameraPos:
                           a Vec2, position relative to top-left of camera
                       fixtures:
                           an array of Fixture objects
                       paint:
                           whether an Artist should paint this slides
                       physics:
                           whether a Physicist should operate on this slides
                       Fixture:
                           class made with "rClass", more documentation below
           more info:
                     class is made with rClass so all from that applies
                     destructor recycles all fixtures within


Fixture:
  location:in Slide's prototype scope
           takes:
                   instance, preferably made with "rClass"
                   vec3, Vec3
                   boundb4, BoundB4
                   OPTphysics, Boolean, whether Physicist operates on fixture *optional defaults to true
                   OPTpaint, Boolean, whether Artist paints fixture *optional defaults to true
           returns:
                   Object, with properties:
                      slide:
                            reference to slide fixture resides in
                      instance:
                            reference to instance fixture holds
                      pos:
                            Vec3, where fixture is located in slide relative to top left of canvas, then apply slide's camera position
                      vel:
                            Vec2, velocity of fixture
                      acc:
                            Vec2, acceleration of fixture
                      boundB:
                            BoundB4, fixture bounding box

                      physics:
                            Boolean, whether Physicist operates on fixture
                      paint:
                            Boolean, whether Artist paints fixture
           more info:
                     class is made with rClass so all from that applies
                     for use in fixtures when Physicist operates
                     all fixtures are stored in the slide's fixture array

Artist:
  location:in View's prototype scope
       takes:
             Clock, preferably RAF: "Clock(true)"
       returns:
             Object, with properties:
                   clock:
                         reference to Artist's Clock
                   view:
                         reference to Artist's View
                   paintView:
                         function, paints the view
       more info:
             a "draw" method included in view.slide.fixture.instance can be used to draw fixtures (1st parameter is canvas context 2nd param is reference to fixture)


Physicist:

