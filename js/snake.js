"set strict";


var SnakeGame = function(query, params) {
	this.container = document.querySelector(query);
	this.width = params.width;
	this.height = params.height;
	this.cellSize = params.cellSize;
	this.snakes = new Array();

	var Snake = function(canvas, x, y, size, direction, cellSize, color) {
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.size = size;
		this.direction = direction;
		this.color = color;


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

		this.move = function(interval, cellSize) {
			var item, last, aux=[];

			if (this.trail.queue.length == 0) {
				
				for (i=0; i<this.size; i++)				
				{
					item = new Array();

					item[0] = (this.x + i * this.direction[0]) * cellSize;
					item[1] = (this.y + i * this.direction[1]) * cellSize;

					this.trail.enqueue(item);
				}
			}

			last = this.trail.lastItem();

			aux[0] = last[0] + (1 * this.direction[0]) * cellSize;
			aux[1] = last[1] + (1 * this.direction[1]) * cellSize;

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
			
			var context = this;
			setTimeout(function() {
				context.move(interval, cellSize);
			}, interval);
		}


		// #########################################################
		this.trail = new Trail();
	}

	this.draw = function(interval, snake) {
		var item, cell;

		this.canvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.canvas.fillStyle = snake.color;
		
		while (cell = snake.trail.nextItem()) {
    		this.canvas.fillRect(
    			cell[0], 
    			cell[1], 
    			this.cellSize, 
    			this.cellSize
    		);
		}

		context = this;
		setTimeout(function() {
			context.draw(interval, snake);
		}, interval);

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
					setTimeout(function(){ context.lockKeyboard = 0;}, 200)		        	
			        context.snakes[0].direction = [0, -1];
		        }
		    }
		    else if (e.keyCode == '40') {
		        // down arrow
		        if (context.snakes[0].direction.join('|') != [0, -1].join('|'))
		        {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, 200)		        	
			        context.snakes[0].direction = [0, 1];
		        }
		    }
		    else if (e.keyCode == '37') {
		       // left arrow
		       if (context.snakes[0].direction.join('|') != [1, 0].join('|'))
		       {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, 200)		       	
			        context.snakes[0].direction = [-1, 0];
		       }
		    }
		    else if (e.keyCode == '39') {
		       // right arrow
		       if (context.snakes[0].direction.join('|') != [-1, 0].join('|'))
		       {
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, 200)		       	
			        context.snakes[0].direction = [1, 0];
		       }
		    }
	    }
	}

	this.init = function () {
		if (this.container.getContext){
			this.container.width = this.width;
			this.container.height = this.height;

			this.canvas = this.container.getContext("2d");

			this.canvas.width = this.width;
			this.canvas.height = this.height;

		  	this.snakes[0] = new Snake(this.canvas, 3, 5 ,6, [1, 0], this.cellSize, "rgb(200,0,0)");
		  	
		  	// Drawing
		  	this.draw(2, this.snakes[0]);
		  	
		  	// Moving
		  	this.snakes[0].move(200, this.cellSize); 

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
	'cellSize': 20
});

snake.init();