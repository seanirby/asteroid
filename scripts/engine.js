World = function(ctx, width, height, color){
  this.ctx = ctx;
  this.width = width;
  this.height = height;
  this.background = color;
  this.stepAmt = .01;
  this.shapes = [];
  var nextShapeID = 0;

  this.addShape = function(shape){
    if(!shape.id){
      shape.id = nextShapeID++;
      this.shapes.push(shape);
    }
  };
  this.removeShape = function(index){
    this.shapes.splice(index, 1);
  };
  this.update = function(){
    for (var i = 0; i < this.shapes.length; i++) {
      this.shapes[i].update(world.stepAmt);
    };
  };
  this.setBackground = function(color){
    this.background = color;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0,0,width, height);
  };
  this.resize = function(width, height){
    this.ctx.canvas.setAttribute("width", width);
    this.ctx.canvas.setAttribute("height", height);
    this.setBackground(this.background);
  };
  this.render = function(){
    //TODO: Find better way to clear screen
    this.resize(this.width, this.height);
    if(this.shapes.length){
      for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].draw(this.ctx);
      };
    }
  };

  this.setBackground(this.background)
  this.resize(this.width, this.height)
};

Point = function(x, y){
  if(arguments.length === 1 && arguments[0] instanceof Point){
    this.x = arguments[0].x;
    this.y = arguments[0].y;
  }
  else{
    this.x = x;
    this.y = y;
  }
  this.set = function(point){
    this.x = point.x;
    this.y = point.y;
  }
  this.add = function(point){
    return new Point(this.x + point.x, this.y + point.y)
  }
  this.subtract = function(point){
    return new Point(this.x - point.x, this.y - point.y);
  }
  this.multiply = function(amt){
    return new Point(this.x * amt, this.y * amt);
  }
  this.normalize = function(){
    var mag = Math.sqrt( Math.pow(this.x,2) + Math.pow(this.y ,2) );
    return new Point(this.x/mag, this.y/mag);
  }
  this.rotate = function(angle, origin){
    angle = angle * Math.PI / 180;
    var tempx = Math.cos(angle) * (this.x - origin.x) - Math.sin(angle) * (this.y - origin.y) + origin.x;
    var tempy = Math.sin(angle) * (this.x - origin.x) + Math.cos(angle) * (this.y - origin.y) + origin.y;
    this.x = tempx;
    this.y = tempy;
  }
};

Shape = function(x,y){
  this.origin = new Point(x, y);
  this.points = [];
  this.mass = 1;
  this.acc = new Point(0,0);
  this.vel = new Point(0,0);
  this.force = new Point(0 ,0);
  this.avg_acc = new Point(0,0);

  this.update = function(time_step){
    var oldAcc = this.acc;
    this.updatePos(time_step);
    this.updateAcc();
    var avgAcc = new Point( (oldAcc.x + this.acc.x)/2 , (oldAcc.y + this.acc.y)/2 );
    this.vel = this.vel.add(avgAcc.multiply(time_step));
  };
  this.updatePos = function(time_step){
    var delta = new Point(this.vel.multiply(time_step));
    delta = delta.add(new Point(0.5 * this.acc.x * Math.pow(time_step, 2), 0.5 * this.acc.y * Math.pow(time_step, 2)));
    this.origin= this.origin.add(delta);
    for (var i = 0; i < this.points.length; i++) {
      this.points[i] = this.points[i].add(delta);
    }
  };
  this.move = function(point){
    this.origin.set(point);
    for (var i = 0; i < this.points.length; i++) {
      this.points[i] = this.points[i].add(this.origin);
    }
  }
  this.updateAcc = function(){
    this.acc.set(this.force.multiply( 1 / this.mass ));
  };
  this.draw = function(ctx){
    for(var i = 0; i < this.points.length; i++){
      ctx.moveTo(this.points[i].x, this.points[i].y);
      if(i === this.points.length - 1){
        ctx.lineTo(this.points[0].x, this.points[0].y);
      }
      else{
        ctx.lineTo(this.points[i+1].x, this.points[i+1].y);
      }
      ctx.stroke();
    }
  };
};

Ship = function (x, y){

  this.__proto__ = new Shape(x, y);

  this.rotate = function(direction){
    var amt = 2.5;
    if( direction === "left" ){
      amt = amt * -1;
    }
    for (var i = 0; i < this.points.length; i++) {
      this.points[i].rotate(amt, this.origin);
    };
  };

  this.thrust = function(){
    var force = new Point( this.points[0].subtract(this.origin) );
    var amt = 500;
    force = force.normalize().multiply(amt);
    this.force.set(force);
  };

  this.makeBullet = function(){
    var bullet = new Bullet(this.points[0].x, this.points[0].y);
    var velocity = new Point( this.points[0].subtract(this.origin) );
    var amt = 500;
    velocity = velocity.normalize().multiply(amt);
    bullet.vel.set(velocity);
    return bullet;
  };

  this.points.push(new Point(0, 20));
  this.points.push(new Point(10,-10));
  this.points.push(new Point(-10, -10));
  this.move(this.origin);
};

function Bullet(x, y){
  this.lifetime = 0.5;
  this.kill = false;
  this.timer = 0;
  this.__proto__ = new Shape(x, y);
  this.update = function(time_step){
    if(this.timer > this.lifetime){
      this.kill = true;
    }
    else{
      this.timer += time_step;
    }
    this.__proto__.update(time_step);
  }

  this.points.push(new Point(0,2));
  this.points.push(new Point(2,0));
  this.points.push(new Point(0,-2));
  this.points.push(new Point(-2,0));
  this.move(this.origin);
};


