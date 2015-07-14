"set strict";


var SnakeGame = function(query, params) {
	this.container = document.querySelector(query);
	
	this.width = params.width;
	this.height = params.height;
	
	this.cellSize = params.cellSize;
	this.speed = params.speed;
	this.isPaused = true;
	this.isOver = false;

	this.board = new Array();
	this.snakes = new Array();
	this.cookies = new Array();

	var Cookie = function(x, y, value, color, calories) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.color = "rgb(0, 0 ,255)";
		this.calories = calories;
	}

	var Snake = function(x, y, size, direction, color, speed) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.direction = direction;
		this.color = color;
		this.speed = speed;
		this.score = 0;
		this.supplies = 0;

		var Trail = function () {
			this.queue = new Array();
			this.current = 0;

			this.enqueue = function (item) {
				this.queue.push(item);
			}

			this.dequeue = function() {
				return this.queue.shift();
			}

			this.headCell = function() {
				return this.queue.slice(-1)[0];
			}

			this.tailCell = function() {
				return this.queue.slice(0, 1)[0];
			}
		}

		this.increaseSupplies = function(cookie) {
			this.score += cookie.value;
			this.supplies += cookie.calories;
		}

		this.trail = new Trail();
	}

	this.generateCookie = function() {
		var x, y, value, cookie;

		x = Math.floor((Math.random() * this.width / this.cellSize)) * this.cellSize;
		y = Math.floor((Math.random() * this.height / this.cellSize)) * this.cellSize;

		cookie = new Cookie(x, y, 10, 'rgba(0, 0, 255)', 3);

		this.cookies.push(cookie);
		this.board[y / this.cellSize][x / this.cellSize] = cookie;
	}

	this.clear = function() {
		this.canvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	this.startMoving = function(snake) {
		var item, head, tail, aux, next=[];

		// We generate the default trail
		if (snake.trail.queue.length == 0) {
			for (i=0; i<snake.size; i++)				
			{
				item = new Array();

				item[0] = (snake.x + i * snake.direction[0]) * this.cellSize;
				item[1] = (snake.y + i * snake.direction[1]) * this.cellSize;
				this.board[snake.y + i * snake.direction[1]][snake.x + i * snake.direction[0]] = 's';

				snake.trail.enqueue(item);
			}
		}

		// We find out the next position of the head
		head = snake.trail.headCell();
		next[0] = head[0] + (1 * snake.direction[0]) * this.cellSize;
		next[1] = head[1] + (1 * snake.direction[1]) * this.cellSize;

		// Walking through borders in mirror mode - vertical
		if (next[0] == this.canvas.width) {
			next[0] = 0;
		}
		else if (next[0] < 0) {
			next[0] = this.canvas.width - 1 * this.cellSize;
		}

		// Walking through borders in mirror mode - horizontal
		if (next[1] == this.canvas.height) {
			next[1] = 0;
		}
		else if (next[1] < 0) {
			next[1] = this.canvas.height - 1 * this.cellSize;
		}

		// We get the value of the next position
		aux = this.board[next[1] / this.cellSize][next[0] / this.cellSize];

		// We evaluate the value with some rules
		if (aux === null) {
			tail = snake.trail.tailCell();

			this.board[tail[1] / this.cellSize][tail[0] / this.cellSize] = null;
			this.board[next[1] / this.cellSize][next[0] / this.cellSize] = 's';

			// We increaseSupplies the supplies if while we have
			if (snake.supplies == 0) {
				snake.trail.dequeue();
			} else {
				snake.supplies --;
				snake.size ++;
			}

			snake.trail.enqueue(next);
		} else {
			// If snake hit itself we end the game
			if (aux == 's') {
				this.isOver = true;
				return false;
			}

			//If snake hit a cookie
			if (aux instanceof Cookie) {
				this.board[next[1] / this.cellSize][next[0] / this.cellSize] = 's';

				snake.increaseSupplies(aux);
				snake.trail.enqueue(next);
				
				delete this.cookies[this.cookies.indexOf(aux)];
			}
		}

		var context = this;
		setTimeout(function() {
			if (context.isPaused == true || context.isOver == true)
				return false;

			context.startMoving(snake);
		}, snake.speed);
	}

	this.startDrawing = function() {
		var item, cell;
		var context = this;
		
		// Clear canvas
		this.clear();

		// Draw Snake
		this.snakes[0].trail.queue.forEach(function(cell){
			context.canvas.fillStyle = context.snakes[0].color;
    		context.canvas.fillRect(
    			cell[0], 
    			cell[1], 
    			context.cellSize, 
    			context.cellSize
    		);
		});

		// Draw Cookies
		this.cookies.forEach(function(cookie){
			context.canvas.fillStyle = cookie.color;
			context.canvas.fillRect(
    			cookie.x, 
    			cookie.y, 
    			context.cellSize, 
    			context.cellSize
    		);	
		});
		
		setTimeout(function() {
			if (context.isPaused == true || context.isOver == true)
				return false;

			context.startDrawing();
		}, this.speed);

	}

	this.startBaking = function() {
		var random = Math.floor((Math.random() * 300)) * 10 + 500;
		
		var context = this;
		setTimeout(function(){
			if (context.isPaused == true || context.isOver == true)
				return false;

			context.generateCookie();
			context.startBaking();
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
		this.isPaused = this.isPaused ? false : true;

		if (!this.isPaused) {
			this.startDrawing();
			this.startMoving(this.snakes[0]);
			this.startBaking();
		}

		if (this.isOver) {
			this.board = new Array();
			this.snakes = new Array();
			this.cookies = new Array();
			this.init();
			this.isOver = false;
		}
	}

	this.init = function () {
		if (this.container.getContext){
			this.container.width = this.width;
			this.container.height = this.height;

			// Create the Matrix
			for (i=0; i<this.height/this.cellSize; i++){
				this.board[i] = new Array();
				for (j=0; j<this.width/this.cellSize; j++)
					{
						this.board[i][j] = null;
					}
			}

			// Create the canvas properties
			this.canvas = this.container.getContext("2d");
			this.canvas.width = this.width;
			this.canvas.height = this.height;

			// Generate Snake
		  	this.snakes[0] = new Snake(3, 5 ,10, [1, 0], "rgb(200,0,0)", this.speed);
		  	
		  	// Keyboard
		  	this.addEvents();
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