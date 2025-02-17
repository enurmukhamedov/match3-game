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
let levelGoal = { targetTile: 'texture1', amount: 10 }; // Цель уровня
let goalText;
let level = 1;
let game;

function preload() {
    this.load.image('texture1', 'assets/texture1.png');
    this.load.image('texture2', 'assets/texture2.png');
    this.load.image('texture3', 'assets/texture3.png');
    this.load.image('texture4', 'assets/texture4.png');
    this.load.image('texture5', 'assets/texture5.png');
    this.load.image('bomb', 'assets/bomb.png'); // Бомба
    this.load.image('rocket', 'assets/rocket.png'); // Ракета
    this.load.image('lightning', 'assets/lightning.png'); // Молния
}

function create() {
    scoreText = this.add.text(20, 20, `Очки: ${score}`, { fontSize: '20px', fill: '#fff' });
    goalText = this.add.text(20, 50, `Собери: ${levelGoal.amount} x ${levelGoal.targetTile}`, { fontSize: '16px', fill: '#fff' });

    createGrid.call(this);
}

function createGrid() {
    grid = [];
    for (let row = 0; row < gridHeight; row++) {
        grid[row] = [];
        for (let col = 0; col < gridWidth; col++) {
            spawnTile.call(this, col, row);
        }
    }
}

function spawnTile(col, row) {
    let type = Phaser.Math.RND.pick(tileTypes);
    let tile = this.add.image(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2 + 50, type);
    tile.setInteractive();
    tile.type = type;
    tile.row = row;
    tile.col = col;
    tile.on('pointerdown', () => selectTile.call(this, tile));
    grid[row][col] = tile;
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
            if (tile.type === levelGoal.targetTile) {
                levelGoal.amount -= 1;
                goalText.setText(`Собери: ${levelGoal.amount} x ${levelGoal.targetTile}`);
            }
            tile.destroy();
            score += 10;
        });

        scoreText.setText(`Очки: ${score}`);
        applyGravity.call(this);
    }
}

function applyGravity() {
    for (let col = 0; col < gridWidth; col++) {
        let emptySpaces = 0;
        for (let row = gridHeight - 1; row >= 0; row--) {
            if (!grid[row][col]) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                let tile = grid[row][col];
                grid[row + emptySpaces][col] = tile;
                grid[row][col] = null;
                tile.row += emptySpaces;
                this.tweens.add({
                    targets: tile,
                    y: tile.row * tileSize + tileSize / 2 + 50,
                    duration: 200
                });
            }
        }

        for (let i = 0; i < emptySpaces; i++) {
            spawnTile.call(this, col, i);
        }
    }
}

function update() {
    if (levelGoal.amount <= 0) {
        nextLevel.call(this);
    }
}

function nextLevel() {
    level++;
    levelGoal = {
        targetTile: Phaser.Math.RND.pick(tileTypes),
        amount: 10 + level * 5
    };
    goalText.setText(`Собери: ${levelGoal.amount} x ${levelGoal.targetTile}`);
    score = 0;
    scoreText.setText(`Очки: ${score}`);
    createGrid.call(this);
}

game = new Phaser.Game(config);
