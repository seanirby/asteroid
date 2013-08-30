ctx = document.getElementById("view").getContext("2d");
world = new World(ctx, 1000, 500, "white");
ship = new Ship(100, 100);
asteroid1 = new BigAsteroid(0, 75);
asteroid2 = new BigAsteroid(0, 0);
asteroid3 = new BigAsteroid(0, world.height);
world.addShape(ship);
world.addShape(asteroid1);
world.addShape(asteroid2);
world.addShape(asteroid3);
var keys = {left: false, up: false, right: false, space: false};

document.onkeydown = keyDown;
document.onkeyup = keyUp;


function loop(){
  world.update();
  handleInputs();
  handleBoundaryOverflow();
  handleBullets();
  handleCollisions();
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
}

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
}

function handleBullets(){
  for (var i = 0; i < world.shapes.length; i++) {
    //TODO Find a better of way testing if bullet
    if(world.shapes[i].kill){
      world.removeShape(world.shapes[i]);
    }
  };
}

function handleCollisions(){
  var i;
  var j;
  var bullet;
  var bullets = [];
  var asteroids = [];
  var asteroid;

  for (i = 0; i < world.shapes.length; i++) {
    if(world.shapes[i].name === "bullet"){
      bullets.push(world.shapes[i]);
    }
    else if(world.shapes[i].name === "asteroid"){
      asteroids.push(world.shapes[i]);
    }
  };

  for (i = 0; i < asteroids.length; i++) {
    asteroid = asteroids[i];
    //test if any bullets are in asteroid
    for (j = 0; j < bullets.length; j++) {
      bullet = bullets[j]
      if(world.testForCollision(bullet, asteroid)){
        bullet.handleCollision(world);
        asteroid.handleCollision(world);
        console.log(world.shapes)
      }
    };

    //test if ship is in asteroid
    if(world.testForCollision(ship, asteroid)){
      console.log("ship collided with an asteroid");
    }
  };
};

setInterval(loop, (world.stepAmt)*1000);