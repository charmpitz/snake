"set strict";

function SnakeGame(query, params) {
	this.container = document.querySelector(query);
	
	this.width = params.width / params.cellSize;
	this.height = params.height / params.cellSize;
	
	this.cellSize = params.cellSize;
	this.maxCookies = params.maxCookies;
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
		this.color = color;
		this.calories = calories;
	}

	var Snake = function(x, y, size, direction, color, speed) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.direction = direction;
		this.color = color;
		this.speed = speed;
		this.minSize = 4;
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
		var x, y, value, cookie, randomNumber, color, calories, colors;

		colors = ['rgb(100, 0, 100)', 'rgb(0, 100, 100)', 'rgb(100, 100, 0)', 'rgb(255, 255, 0)'];
		
		x = Math.floor((Math.random() * this.width));
		y = Math.floor((Math.random() * this.height));
		

		// We create cookie only if the cell is empty
		if (this.board[y][x] == null){
			randomNumber = Math.floor(Math.random() * 101);

			// We find out what type of Cookie we create
			if (randomNumber < 11) {
				// We create the dietetic type
				calories = -6;
				color = colors[3];
			} else {
				// We create the fat one
				calories = Math.floor(Math.random() * 3) + 1;
				color = colors[calories-1];
			}

			cookie = new Cookie(x, y, 10, color, calories);

			this.cookies.push(cookie);
			this.board[y][x] = cookie;
		}
	}

	this.speedUp = function() {
		if (this.speed > 49){
			this.speed -= 20;
			this.snakes.forEach(function(snake, index, snakes){
				snake.speed -= 20;	
			})
		}
	}

	this.speedDown = function() {
		if (this.speed < 201){
			this.speed += 20;
			this.snakes.forEach(function(snake, index, snakes){
				snake.speed += 20;	
			})
		}
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

				item[0] = (snake.x + i * snake.direction[0]);
				item[1] = (snake.y + i * snake.direction[1]);
				this.board[snake.y + i * snake.direction[1]][snake.x + i * snake.direction[0]] = 's';

				snake.trail.enqueue(item);
			}
		}

		// We find out the next position of the head
		head = snake.trail.headCell();
		next[0] = head[0] + (1 * snake.direction[0]);
		next[1] = head[1] + (1 * snake.direction[1]);

		// Walking through borders in mirror mode - vertical
		if (next[0] == this.width) {
			next[0] = 0;
		}
		else if (next[0] < 0) {
			next[0] = this.width - 1;
		}

		// Walking through borders in mirror mode - horizontal
		if (next[1] == this.height) {
			next[1] = 0;
		}
		else if (next[1] < 0) {
			next[1] = this.height - 1;
		}

		// We get the value of the next position
		aux = this.board[next[1]][next[0]];

		// We evaluate the value with some rules
		if (aux === null) {

			this.board[next[1]][next[0]] = 's';
			
			// We increaseSupplies the supplies if while we have
			if (snake.supplies == 0) {
				tail = snake.trail.tailCell();
				this.board[tail[1]][tail[0]] = null;
				snake.trail.dequeue();
			} else if(snake.supplies > 0){
				snake.supplies --;
				snake.size ++;
			} else if(snake.supplies < 0){
				while (snake.supplies < 0) {
					if (snake.size > snake.minSize) {
						tail = snake.trail.tailCell();
						this.board[tail[1]][tail[0]] = null;
						snake.size --;
						snake.trail.dequeue();
					}
					snake.supplies ++;
				}
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
				this.board[next[1]][next[0]] = 's';

				snake.increaseSupplies(aux);
				snake.trail.enqueue(next);
				document.querySelector("#score").innerHTML = snake.score;
				
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

		// Draw Snakes
		this.snakes.forEach(function(snake, index, snakes){
			snake.trail.queue.forEach(function(cell, index, queue){
				context.canvas.fillStyle = snake.color;
				context.canvas.fillRect(
					cell[0] * context.cellSize, 
					cell[1] * context.cellSize, 
					context.cellSize, 
					context.cellSize
				);
			});
		});

		// Draw Cookies
		this.cookies.forEach(function(cookie){
			context.canvas.fillStyle = cookie.color;
			context.canvas.beginPath();
			context.canvas.arc(
				cookie.x * context.cellSize + context.cellSize / 2, 
				cookie.y * context.cellSize + context.cellSize / 2, 
				context.cellSize / 2, 
				0, 
				2 * Math.PI, 
				false
			);
			context.canvas.fill();
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
			if (e.keyCode == '40') {
				// down arrow
				if (context.snakes[0].direction.join('|') != [0, -1].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		        	
					context.snakes[0].direction = [0, 1];
				}
			}
			if (e.keyCode == '37') {
			   // left arrow
				if (context.snakes[0].direction.join('|') != [1, 0].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		       	
					context.snakes[0].direction = [-1, 0];
				}
			}
			if (e.keyCode == '39') {
				// right arrow
				if (context.snakes[0].direction.join('|') != [-1, 0].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		       	
					context.snakes[0].direction = [1, 0];
				}
			}

			if (e.keyCode == '87') {
				// up arrow
				if (context.snakes[1].direction.join('|') != [0, 1].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		        	
					context.snakes[1].direction = [0, -1];
				}
			}
			if (e.keyCode == '83') {
				// down arrow
				if (context.snakes[1].direction.join('|') != [0, -1].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		        	
					context.snakes[1].direction = [0, 1];
				}
			}
			if (e.keyCode == '65') {
			   // left arrow
				if (context.snakes[1].direction.join('|') != [1, 0].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		       	
					context.snakes[1].direction = [-1, 0];
				}
			}
			if (e.keyCode == '68') {
				// right arrow
				if (context.snakes[1].direction.join('|') != [-1, 0].join('|'))
				{
					context.lockKeyboard = 1;
					setTimeout(function(){ context.lockKeyboard = 0;}, context.speed)		       	
					context.snakes[1].direction = [1, 0];
				}
			}

			if (e.keyCode == '32') {
				// space key
				context.toggle();
			} 
			if (e.keyCode == '188') {
				// < key
				context.speedDown();
			}
			if (e.keyCode == '190') {
				// > key
				context.speedUp();
			}

		}
	}

	this.toggle = function() {
		this.isPaused = this.isPaused ? false : true;

		if (!this.isPaused) {
			this.startDrawing();
			this.startMoving(this.snakes[0]);
			this.startMoving(this.snakes[1]);
			this.startBaking();
		}

		if (this.isOver) {
			this.board = new Array();
			this.snakes = new Array();
			this.cookies = new Array();
			document.querySelector("#score").innerHTML = 0;
			this.init();
			this.isOver = false;
		}
	}

	this.init = function () {
		if (this.container.getContext){
			this.container.width = this.width * this.cellSize;
			this.container.height = this.height * this.cellSize;

			// Create the Matrix
			for (i=0; i<this.height; i++){
				this.board[i] = new Array();
				for (j=0; j<this.width; j++)
					{
						this.board[i][j] = null;
					}
			}

			// Create the canvas properties
			this.canvas = this.container.getContext("2d");
			this.canvas.width = this.width * this.cellSize;
			this.canvas.height = this.height * this.cellSize;

			// Generate Snake
			this.snakes[0] = new Snake(3, 5 ,10, [1, 0], "rgb(200, 0, 0)", this.speed);
			this.snakes[1] = new Snake(3, 25 ,10, [1, 0], "rgb(0, 200, 0)", this.speed);
			
			// Keyboard
			this.addEvents();
		}
	}
}

snake = new SnakeGame("#snake", {
	'width': 600,
	'height': 400,
	'cellSize': 10,
	'speed': 50,
	'maxCookies': 5
});

snake.init();