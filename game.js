import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    scene: { preload, create, update },
    parent: 'game-container',
};

const tileSize = 50;
const gridWidth = 8;
const gridHeight = 8;
const tileTypes = ['texture1', 'texture2', 'texture3', 'texture4', 'texture5'];

let grid = [];
let selectedTile = null;
let score = 0;
let scoreText;
let menu;
let startButton;
let game;

function preload() {
    this.load.image('texture1', 'assets/texture1.png');
    this.load.image('texture2', 'assets/texture2.png');
    this.load.image('texture3', 'assets/texture3.png');
    this.load.image('texture4', 'assets/texture4.png');
    this.load.image('texture5', 'assets/texture5.png');
    this.load.image('startButton', 'assets/start.png'); // Картинка кнопки старта
}

function create() {
    // Показываем меню
    showMenu.call(this);

    // Текст счёта
    scoreText = this.add.text(20, 20, `Очки: ${score}`, { fontSize: '20px', fill: '#fff' });

    // Генерируем игровое поле
    createGrid.call(this);
}

function showMenu() {
    menu = this.add.rectangle(200, 300, 300, 200, 0x000000, 0.8);
    startButton = this.add.image(200, 300, 'startButton').setInteractive();

    startButton.on('pointerdown', () => {
        startButton.destroy();
        menu.destroy();
        startGame.call(this);
    });
}

function startGame() {
    score = 0;
    scoreText.setText(`Очки: ${score}`);
    createGrid.call(this);
}

function createGrid() {
    grid = [];
    for (let row = 0; row < gridHeight; row++) {
        grid[row] = [];
        for (let col = 0; col < gridWidth; col++) {
            let type = Phaser.Math.RND.pick(tileTypes);
            let tile = this.add.image(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2 + 50, type);
            tile.setInteractive();
            tile.type = type;
            tile.row = row;
            tile.col = col;
            tile.on('pointerdown', () => selectTile.call(this, tile));
            grid[row][col] = tile;
        }
    }
}

function selectTile(tile) {
    if (!selectedTile) {
        selectedTile = tile;
        tile.setScale(1.2);
    } else {
        swapTiles.call(this, selectedTile, tile);
        selectedTile.setScale(1);
        selectedTile = null;
    }
}

function swapTiles(tile1, tile2) {
    if ((Math.abs(tile1.row - tile2.row) === 1 && tile1.col === tile2.col) ||
        (Math.abs(tile1.col - tile2.col) === 1 && tile1.row === tile2.row)) {
        
        let tempType = tile1.type;
        tile1.setTexture(tile2.type);
        tile1.type = tile2.type;
        tile2.setTexture(tempType);
        tile2.type = tempType;

        checkMatches.call(this);
    }
}

function checkMatches() {
    let matches = [];
    
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth - 2; col++) {
            if (grid[row][col].type === grid[row][col + 1].type &&
                grid[row][col].type === grid[row][col + 2].type) {
                matches.push(grid[row][col], grid[row][col + 1], grid[row][col + 2]);
            }
        }
    }
    
    for (let col = 0; col < gridWidth; col++) {
        for (let row = 0; row < gridHeight - 2; row++) {
            if (grid[row][col].type === grid[row + 1][col].type &&
                grid[row][col].type === grid[row + 2][col].type) {
                matches.push(grid[row][col], grid[row + 1][col], grid[row + 2][col]);
            }
        }
    }

    if (matches.length > 0) {
        matches.forEach(tile => {
            tile.destroy();
            score += 10; // Увеличиваем очки
        });
        scoreText.setText(`Очки: ${score}`);
    }
}

game = new Phaser.Game(config);
