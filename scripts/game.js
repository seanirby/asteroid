var Game={

  init: function(){
    this.ctx = document.getElementById("view").getContext("2d");
    this.world = new World(this.ctx, 1000, 500, "white");
    this.ship = new Ship(0, 0);
    this.lives = 3;
    this.score = 0;
    this.main_text = "PRESS SPACE TO START";
    this.state = "title"
    this.next_asteroid_amt = 4;
    this.inputs =  {left: false,
                    up: false,
                    right: false,
                    space: false,
                    mapping: {37: "left",
                              38: "up",
                              39: "right",
                              32: "space"}};
    this.spawnAsteroids();

    document.onkeyup = this.makeCallBackWithContext(this.keyUp, this);
    document.onkeydown = this.makeCallBackWithContext(this.keyDown, this);
  },

  loop: function(){
    this.world.update();
    this.handleInputs();
    this.handleBoundaryOverflow();
    if(this.state === "playing"){
      this.handleCollisions();
    }
    this.world.render();

    //If State = Title, draw title
    if(this.state === "title"){
      this.drawTitle();
    }
    if(this.state === "game_over"){
      this.drawGameOver();
    }
    //Draw Score;
    this.drawScore();
  },

  drawTitle: function(){
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.main_text, this.world.width/2, this.world.height/2);
  },

  drawScore: function(){
    this.ctx.font = "15px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.score, 10, 20);
  },

  drawGameOver: function(){
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    this.ctx.fillText("GAME OVER", this.world.width/2, this.world.height/2);
  },

  start: function(){
    this.loopID = this.setIntervalWithContext(this.loop, (this.world.stepAmt)*1000, this);
  },

  reset: function(){
  },

  setIntervalWithContext : function(code,delay,context){
    return setInterval(function(){
      code.call(context)
    }, delay)
  },

  setTimeoutWithContext : function(code,delay,context){
    return setTimeout(function(){
      code.call(context)
    }, delay)
  },

  makeCallBackWithContext: function(code, context){
    return function(event){
      code.call(context, event);
    };
  },

  keyDown: function(e){
    e = e || window.event;
    var key = this.inputs.mapping[e.keyCode];
    if( (!this.inputs[key]) && this.inputs.hasOwnProperty(key) ){
      this.inputs[key] = true;
    }
  },
  keyUp: function(e){
    e = e || window.event;
    var key = this.inputs.mapping[e.keyCode];
    if(this.inputs.hasOwnProperty(key)){
      this.inputs[key] = false;
    }
  },
  handleInputs: function(){
    if(this.state === "playing"){
      if(this.inputs.up){
        this.ship.thrust();
      }
      else{
        this.ship.force.x = 0;
        this.ship.force.y = 0;
      }

      if(this.inputs.right){
        this.ship.rotate("right");
      }

      if(this.inputs.left){
        this.ship.rotate("left");
      }

      if(this.inputs.space && this.ship.cannon_ready){
        this.world.addShape(this.ship.makeBullet());
        this.ship.cannon_ready = false;
        this.setTimeoutWithContext( function(){
                                      this.ship.cannon_ready = true;
                                    },this.ship.cannon_timeout*1000, this);
      }
    }
    else if((this.state === "game_over") && (this.inputs.space)){
      this.state = "title";
      this.reset();
      this.init();
    }
    else if((this.state === "title") && (this.inputs.space)){
      this.state = "playing";
      this.ship = new Ship(this.world.width/2, this.world.height/2);
      this.world.addShape(this.ship);
      this.inputs.space = false;
    }
  },
  handleBoundaryOverflow: function(){
    for (var i = 0; i < this.world.shapes.length; i++) {
      shape = this.world.shapes[i];
      if(shape.origin.x > this.world.width){
        shape.origin.x += -this.world.width;
        for (var j = 0; j < shape.points.length; j++) {
          shape.points[j].x += -this.world.width;
        }
      }
      if(shape.origin.x < 0){
        shape.origin.x += this.world.width;
        for (var j = 0; j < shape.points.length; j++) {
          shape.points[j].x += this.world.width;
        }
      }
      if(shape.origin.y > this.world.height){
        shape.origin.y += -this.world.height;
        for (var j = 0; j < shape.points.length; j++) {
          shape.points[j].y += -this.world.height;
        }
      }
      if(shape.origin.y < 0){
        shape.origin.y += this.world.height;
        for (var j = 0; j < shape.points.length; j++) {
          shape.points[j].y += this.world.height;
        }
      }
    }
  },
  handleCollisions: function(){
    var i;
    var j;
    var bullet;
    var bullets = [];
    var asteroids = [];
    var asteroid;

    for (i = 0; i < this.world.shapes.length; i++) {
      if(this.world.shapes[i].name === "bullet"){
        bullets.push(this.world.shapes[i]);
      }
      else if(this.world.shapes[i].name === "asteroid"){
        asteroids.push(this.world.shapes[i]);
      }
    };

    if(asteroids.length === 0 && this.state === "playing"){
      this.spawnAsteroids();
    }

    for (i = 0; i < asteroids.length; i++) {
      asteroid = asteroids[i];
      for (j = 0; j < bullets.length; j++) {
        bullet = bullets[j]
        if(this.world.testForCollision(bullet, asteroid)){
          this.score += 20;
          bullet.handleCollision(this.world);
          asteroid.handleCollision(this.world);
        }
      };

      if(this.world.testForCollision(this.ship, asteroid)){
        this.ship.handleCollision(this.world);
        this.state = "game_over"
        asteroid.handleCollision(this.world);
      }
    }
  },

  spawnAsteroids: function(){
    for (var i = 0; i < this.next_asteroid_amt; i++) {
      this.world.addShape(new BigAsteroid(0, 0));
    }
    ++this.next_asteroid_amt
  }
};

Game.init();
Game.start();
