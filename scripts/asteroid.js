ctx = document.getElementById("view").getContext("2d");
world = new World(ctx, 1000, 500, "white");
ship = new Ship(100, 100);
asteroid = new Asteroid(0, 75);
world.addShape(ship);
world.addShape(asteroid);
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
    console.log(world.shapes);
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
      world.removeShape(i);
    }
  };
}

function handleCollisions(){
  //get the lines for each asteroid.
  var lines = [];
  var nodes = [];
  var collision = false;
  var test_point;
  var test_line;
  var left_side_count = 0;
  var right_side_count = 0;

  for (var i = 0; i < asteroid.points.length; i++) {
    if (i === asteroid.points.length-1) {
      lines.push(new Line(asteroid.points[i], asteroid.points[0]));
    }
    else{
      lines.push(new Line(asteroid.points[i],asteroid.points[i+1]));
    }
  };

  for (var i = 0; i < ship.points.length; i++) {
    test_point = ship.points[i];
    for (var j = 0; j < lines.length; j++) {
      test_line = lines[j];
      if( ( (test_point.y < test_line.point1.y) && (test_point.y > test_line.point2.y ) ) || ( (test_point.y < test_line.point2.y) && (test_point.y > test_line.point1.y) ) ){
        nodes.push( test_line.xValueAt(test_point.y) );
      }
    };
    if(nodes.length > 0){
      for (var j = 0; j < nodes.length; j++) {
        if( nodes[j] > test_point.x ){
          ++right_side_count;
        }
        else{
          ++left_side_count;
        }
      };
      if( (right_side_count % 2 != 0) && (left_side_count % 2 != 0) && (left_side_count === right_side_count) ){
        //console.log("collision found at: " + test_point.x + ", " + test_point.y);
      }
    }
  };
}


setInterval(loop, (world.stepAmt)*1000);