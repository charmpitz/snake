"set strict";


var SnakeGame = function(query, params) {
	this.container = document.querySelector(query);
	this.width = params.width;
	this.height = params.height;
	this.cellSize = params.cellSize;
	this.speed = params.speed;
	this.snakes = new Array();
	this.pause = true;
	this.cookies = new Array();

	var Cookie = function(x, y, cellSize, value, color) {
		this.x = x;
		this.y = y;
		this.cellSize = cellSize;
		this.value = value;
		this.color = "rgb(0, 0 ,255)";
	}

	var Snake = function(canvas, x, y, size, direction, cellSize, color, speed) {
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.size = size;
		this.direction = direction;
		this.cellSize = cellSize;
		this.color = color;
		this.speed = speed;
		this.isMoving = true;
		this.score = 0;


		var Trail = function () {
			this.queue = new Array();
			this.current = 0;

			this.enqueue = function (item) {
				this.queue.push(item);
			}

			this.dequeue = function() {
				return this.queue.shift();
			}

			this.lastItem = function() {
				return this.queue.slice(-1)[0];
			}

			this.nextItem = function() {
				var item = this.queue[this.current];

				if (this.current == this.queue.length){
					this.current = 0;
					return false;
				}

				this.current++;
				return item;
			}
		}

		this.toggle = function() {
			this.isMoving = this.isMoving ? false : true;
			if (!this.isMoving)
				this.move();
		}

		this.move = function() {
			var item, last, aux=[];

			if (this.trail.queue.length == 0) {
				
				for (i=0; i<this.size; i++)				
				{
					item = new Array();

					item[0] = (this.x + i * this.direction[0]) * this.cellSize;
					item[1] = (this.y + i * this.direction[1]) * this.cellSize;

					this.trail.enqueue(item);
				}
			}

			last = this.trail.lastItem();

			aux[0] = last[0] + (1 * this.direction[0]) * this.cellSize;
			aux[1] = last[1] + (1 * this.direction[1]) * this.cellSize;

			if (aux[0] == this.canvas.width) {
				aux[0] = 0;
			}
			else if (aux[0] < 0) {
				aux[0] = this.canvas.width;
			}

			if (aux[1] == this.canvas.height) {
				aux[1] = 0;
			}
			else if (aux[1] < 0) {
				aux[1] = this.canvas.height;
			}

			this.trail.dequeue();
			this.trail.enqueue(aux);

			if (this.isMoving == true)
				return false;

			var context = this;
			setTimeout(function() {
				context.move();
			}, this.speed);
		}


		// #########################################################
		this.trail = new Trail();
	}

	this.generateCookie = function() {
		var x, y, value, cookie;
		x = Math.floor((Math.random() * this.width / this.cellSize)) * this.cellSize;
		y = Math.floor((Math.random() * this.height / this.cellSize)) * this.cellSize;
		value = 10;

		cookie = new Cookie(x, y, value);
		console.log(cookie);
		this.cookies.push(cookie);
	}

	this.clear = function() {
		this.canvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	this.draw = function() {
		var item, cell;

		this.clear();
		this.canvas.fillStyle = this.snakes[0].color;
		
		while (cell = this.snakes[0].trail.nextItem()) {
    		this.canvas.fillRect(
    			cell[0], 
    			cell[1], 
    			this.cellSize, 
    			this.cellSize
    		);
		}
		context = this;
		this.cookies.forEach(function(elem){
			context.canvas.fillStyle = elem.color;
			context.canvas.fillRect(
    			elem.x, 
    			elem.y, 
    			elem.cellSize, 
    			elem.cellSize
    		);	
		});

		if (this.pause == true)
			return false;

		
		setTimeout(function() {
			context.draw();
		}, this.speed);

	}

	this.bake = function() {
		var random = Math.floor((Math.random() * 300)) * 10 + 500;
		console.log(random);
		var context = this;

		setTimeout(function(){
			context.generateCookie();
		}, random);
	}

	this.addEvents = function() {
		context = this;
		this.lockKeyboard = 0;

	    window.onkeydown = function(e) {
	    	e = e || window.event;

	    	if (context.lockKeyboard == 1)
	    		return false;

		    if (e.keyCode == '38') {
		        // up arrow
		        if (context.snakes[0].direction.join('|') != [0, 1].join('|'))
		        {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		        	
			        context.snakes[0].direction = [0, -1];
		        }
		    }
		    else if (e.keyCode == '40') {
		        // down arrow
		        if (context.snakes[0].direction.join('|') != [0, -1].join('|'))
		        {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		        	
			        context.snakes[0].direction = [0, 1];
		        }
		    }
		    else if (e.keyCode == '37') {
		       // left arrow
		        if (context.snakes[0].direction.join('|') != [1, 0].join('|'))
		        {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		       	
			        context.snakes[0].direction = [-1, 0];
		        }
		    }
		    else if (e.keyCode == '39') {
		        // right arrow
		        if (context.snakes[0].direction.join('|') != [-1, 0].join('|'))
		        {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		       	
			        context.snakes[0].direction = [1, 0];
		        }
		    }
		    else if (e.keyCode == '32') {
		    	// space key
		    	context.toggle();
		    }

	    }
	}

	this.toggle = function() {
		this.pause = this.pause ? false : true;

		this.snakes[0].toggle();

		if (!this.pause) {
			this.draw();
			this.bake();
		}
	}

	this.init = function () {
		if (this.container.getContext){
			this.container.width = this.width;
			this.container.height = this.height;

			this.canvas = this.container.getContext("2d");

			this.canvas.width = this.width;
			this.canvas.height = this.height;

		  	this.snakes[0] = new Snake(this.canvas, 3, 5 ,10, [1, 0], this.cellSize, "rgb(200,0,0)", this.speed);
		  	
		  	// Keyboard
		  	this.addEvents();

		} else {
		  	// canvas-unsupported code here
		}

	}

}

snake = new SnakeGame("#snake", {
	'width': 600,
	'height': 400,
	'cellSize': 10,
	'speed': 100
});

snake.init();