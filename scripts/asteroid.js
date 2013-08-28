//Create a black world
  //Should be size of window
//Create a ship
  //Ship is a triangle
//Ship can move
  //Left and right rotates respectively
  //Up and Down move up and down
//Ship can shoot
  //Pressing spacebar shoots a pellet
//Create an asteroid
  //Asteroid is a randomly generate shape within a surface area range


ctx = document.getElementById("view").getContext("2d");
world = new World(ctx, 500, 500, "white");
ship = new Ship(100, 100);
world.addShape(ship);
var keys = {left: false, up: false, right: false, space: false};

document.onkeydown = keyDown;
document.onkeyup = keyUp;

function loop(){
  world.update();

  handleInputs();
  handleBoundaryOverflow();
  handleBullets();

  world.render();
}

function handleInputs(){
  if(keys.up){
    ship.thrust();
  }
  else{
    ship.force.x = 0;
    ship.force.y = 0;
  }

  if(keys.right){
    ship.rotate("right");
  }

  if(keys.left){
    ship.rotate("left");
  }
};

function keyDown(e) {
    e = e || window.event;

  if (e.keyCode == '37') {
    keys.left = true;
  }
  else if (e.keyCode == '38') {
    keys.up = true;
  }
  else if (e.keyCode == '39') {
    keys.right = true;
  }
  else if (e.keyCode == '32') {
    keys.space = true;
    world.addShape(ship.makeBullet());
    console.log(world.shapes)
  }
}

function keyUp(e) {
  e = e || window.event;

  if (e.keyCode == '37') {
    keys.left = false;
  }
  else if (e.keyCode == '38') {
    keys.up = false;
  }
  else if (e.keyCode == '39') {
    keys.right = false;
  }
  else if (e.keyCode == '32') {
    keys.space = false;
  }
}

function handleBoundaryOverflow(){
  for (var i = 0; i < world.shapes.length; i++) {
    shape = world.shapes[i];
    if(shape.origin.x > world.width){
      shape.origin.x += -world.width;
      for (var j = 0; j < shape.points.length; j++) {
        shape.points[j].x += -world.width;
      }
    }
    if(shape.origin.x < 0){
      shape.origin.x += world.width;
      for (var j = 0; j < shape.points.length; j++) {
        shape.points[j].x += world.width;
      }
    }
    if(shape.origin.y > world.height){
      shape.origin.y += -world.height;
      for (var j = 0; j < shape.points.length; j++) {
        shape.points[j].y += -world.height;
      }
    }
    if(shape.origin.y < 0){
      shape.origin.y += world.height;
      for (var j = 0; j < shape.points.length; j++) {
        shape.points[j].y += world.height;
      }
    }
  }
};

function handleBullets(){
  for (var i = 0; i < world.shapes.length; i++) {
    //TODO Find a better of way testing if bullet
    if(world.shapes[i].kill){
      world.removeShape(i);
    }
  };
}

setInterval(loop, (world.stepAmt)*1000);