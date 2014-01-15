/**
author: Sy Le

config param contains the height of the image.
config = {
canvasWidth : canvas width
canvasHeight : canvas height
tileSize : tile size
imgSrc : image src file
showHint : whether to denotes the stuffs
 */
function Board(config) {
	//board class definition
	var t = this;
	t.tiles = [];

	//default config to null
	config = config || {};

	//tile size is 4x4, so left to right, then top to bottom 1->16
	t.canvasWidth = config.canvasWidth || 640;
	t.canvasHeight = config.canvasHeight || 640;
	t.tileSize = config.tileSize || 4; //4 by 4
	t.imgSrc = config.imgSrc || 'lion.png';
	t.showHint = config.showHint || false;

	var totalMove = 0;
	var isSolved = false;

	//w and h, specified via prototype
	var w = t.canvasWidth / t.tileSize;
	var h = t.canvasHeight / t.tileSize;

	function scramble() {
		if (config.scramble)
			while (t.tiles.length < t.tileSize * t.tileSize) {
				var num = Math.floor(Math.random() * t.tileSize * t.tileSize);

				if (t.tiles.indexOf(num) === -1) {
					t.tiles.push(num);
				}

				if (t.tiles.length == t.tileSize * t.tileSize) {
					if (canBoardBeSolved(t.tiles))
						break;
					else
						t.tiles = [];
				}
			}
		else
			t.tiles = [4, 8, 1, 14, 7, 2, 3, 0, 12, 5, 6, 11, 13, 9, 15, 10];
	}

	/*
	idx: board offset
	imgOffset: offset with the image
	 */
	function render(idx, imgOffset) {
		//row and col
		var row = Math.floor(idx / t.tileSize);
		var col = Math.floor(idx % t.tileSize);

		//x and y , with respect to the board
		var x = col * t.canvasHeight / t.tileSize;
		var y = row * t.canvasHeight / t.tileSize;

		//with respect to the image
		var imgRow = Math.floor(imgOffset / t.tileSize);
		var imgCol = Math.floor(imgOffset % t.tileSize);
		var imgX = imgCol * t.canvasHeight / t.tileSize;
		var imgY = imgRow * t.canvasHeight / t.tileSize;

		//image object
		if (!isSolved) {
			if (imgOffset < t.tileSize * t.tileSize - 1) {
				var img = new Image();
				img.src = t.imgSrc;
				img.onload = function () {
					context.drawImage(img, imgX, imgY, w, h, //offset on the picture itself
						x, y, w, h); //this is the offset on the board

					//draw borders
					context.rect(x, y, w, h);
					context.stroke();
					context.strokeStyle = 'green';

					//write text, with shadow
					if (t.showHint) {
						context.font = "bold 16px Arial";
						context.fillStyle = "black";
						context.fillText(imgOffset + 1, x + 12, y + 25);
						context.fillStyle = "white";
						context.fillText(imgOffset + 1, x + 10, y + 24);
					}
				}
			} else {
				//draw borders
				context.fillStyle = 'grey';
				context.fillRect(x, y, w, h);
			}
		} else {
			var img = new Image();
			img.src = t.imgSrc;
			img.onload = function () {
				context.drawImage(img, imgX, imgY, w, h, //offset on the picture itself
					x, y, w, h); //this is the offset on the board
			}
		}
	}

	function swapElem(arr, i, j) {
		var tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;

		return arr;
	}

	function canMove(idx) {
		if (isSolved)
			return;

		var idxFromTile = t.tiles[idx];

		//calculate all the piece
		var leftPiece = idx - 1;
		var rightPiece = idx + 1;
		var topPiece = idx - t.tileSize;
		var botPiece = idx + t.tileSize;

		var moveMade = -1;

		function makeMove(targetMove) {
			//swapElem
			if (t.tiles[targetMove] === t.tileSize * t.tileSize - 1) {
				t.tiles = swapElem(t.tiles, idx, targetMove);
				moveMade = targetMove;
			}
		}

		//can move left
		if (idx % t.tileSize) {
			makeMove(leftPiece);
		}

		//can move right
		if (rightPiece % t.tileSize) {
			makeMove(rightPiece);
		}

		//can move up
		if (topPiece >= 0) {
			makeMove(topPiece);
		}

		//can move down
		if (botPiece < t.tileSize * t.tileSize) {
			makeMove(botPiece);
		}

		//only rerender if it is legal move.
		if (moveMade !== -1) {
			document.getElementById('totalMove').innerHTML = ++totalMove;

			//check to see if board is solved
			var tmpIsSolved = true;
			for (var i = 0; i < t.tiles.length; i++) {
				if (t.tiles[i] != i) {
					tmpIsSolved = false;
					break;
				}
			}

			if (tmpIsSolved) {
				isSolved = tmpIsSolved;
				document.getElementById('progress').innerHTML = 'Congrat! Puzzle is Solved';
			}

			t.render([idx, moveMade]);
		}

	}

	function getIdxFromMousePos(ev) {
		var x = ev.offsetX;
		var y = ev.offsetY;

		var row = Math.floor(y / h);
		var col = Math.floor(x / w);

		var idx = row * t.tileSize + col;

		return idx;
	}

	//hook up canvas on click and figure the coordinate
	canvas.onclick = function (ev) {
		var idxFromTile = getIdxFromMousePos(ev);
		canMove(idxFromTile);
	}

	//clear canvas
	function clearCanvas(gridsToClear) {
		if (gridsToClear) {
			for (var i = 0; i < gridsToClear.length; i++) {
				var idx = gridsToClear[i];

				//row and col
				var row = Math.floor(idx / t.tileSize);
				var col = Math.floor(idx % t.tileSize);

				//x and y , with respect to the board
				var x = col * t.canvasHeight / t.tileSize;
				var y = row * t.canvasHeight / t.tileSize;
				
				context.clearRect(x, y, w, h);
			}
		} else {
			//clear canvas and redraw
			context.clearRect(0, 0, canvas.width, canvas.height);
		}
	}

	//board public method
	t.render = function (gridsToClear) {
		clearCanvas(gridsToClear);

		//draw the board
		for (var i = 0; i < 16; i++) {
			render(i, t.tiles[i]);
		}
	}

	//constructor
	scramble(); //scramble the board
}
