const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let mouseX = 0;
let mouseY = 0;
canvas.width=innerWidth;
canvas.height=innerHeight;

const worldWidth =3000; // Set the world width to 2000 pixels
const worldHeight =3000; // Set the world height to 2000 pixels
const resources = 120;

const elementSize = 40; // Size of trees and rocks
const separation = 250; // Extra separation at the bottom and top

// Load the player character's sprite
const playerSprite = new Image();
playerSprite.src = 'player.png';

// Load the tree sprite
const treeSprite = new Image();
treeSprite.src = 'tree.png';
// Load the enemy sprite
const enemySprite = new Image();
enemySprite.src = 'sprites/enemy0.png';
// Load the rock sprite
const rockSprite = new Image();
rockSprite.src = 'sprites/rock.png';
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;
})
// Player character
const player = {
    x: worldWidth / 2,
    y: worldHeight / 2,
    width:40, //def: 40
    height: 40, 
    speed: 5,
};

// Camera or viewport settings
const camera = {
    x: 0,
    y: 0,
    width: canvas.width -45,
    height: canvas.height - 20,
};

// Tree and rock positions arrays
const trees = [];
const rocks = [];
const enemies = [];
// Generate up to 10 trees and rocks with separation
for (let i = 0; i < resources; i++) {
    let randomX, randomY;
    let validPosition = false;

    // Generate random positions and check for collisions
    while (!validPosition) {
        randomX = Math.random() * (worldWidth - elementSize);
        randomY = separation + Math.random() * (worldHeight - elementSize - separation);
        validPosition = true; // Assume the position is valid until proven otherwise

        // Check for collisions with existing trees
// Draw the trees
for (const tree of trees) {
    if (tree.x >= camera.x && tree.x <= camera.x + camera.width && tree.y >= camera.y && tree.y <= camera.y + camera.height) {
        // Draw the tree 2.5 times bigger
        const treeSize = elementSize * 2.5;
        // Adjust the tree position to make it impossible for the player to touch the entire picture
        const adjustedTreeX = tree.x - camera.x - (treeSize - elementSize) / 2;
        const adjustedTreeY = tree.y - camera.y - (treeSize - elementSize) / 2;
        ctx.drawImage(treeSprite, adjustedTreeX, adjustedTreeY, treeSize, treeSize);
    }
}

// Draw the player
ctx.drawImage(playerSprite, player.x - camera.x, player.y - camera.y, player.width, player.height);

// Draw the rocks
for (const rock of rocks) {
    if (rock.x >= camera.x && rock.x <= camera.x + camera.width && rock.y >= camera.y && rock.y <= camera.y + camera.height) {
        ctx.drawImage(rockSprite, rock.x - camera.x, rock.y - camera.y, elementSize, elementSize);
    }
}
    }

    // If the position is valid, randomly select whether to add a tree or a rock
    if (Math.random() < 0.2) {
        trees.push({ x: randomX, y: randomY });
    } else {
        rocks.push({ x: randomX, y: randomY });
    }
}
function gameLoop() {
    requestAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calc the angle between the player and the mouse cursor
    const angle = Math.atan2(mouseY - (player.y - camera.y), mouseX - (player.x - camera.x));
    
    ctx.save();
    ctx.translate(player.x - camera.x + player.width / 2, player.y - camera.y + player.height / 2);
    ctx.rotate(angle);
    ctx.drawImage(playerSprite, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();

    // Handle player movement using WASD
    let speedX = 0;
    let speedY = 0;

    if (keys['w']) {
        speedY -= player.speed;
    }
    if (keys['a']) {
        speedX -= player.speed;
    }
    if (keys['s']) {
        speedY += player.speed;
    }
    if (keys['d']) {
        speedX += player.speed;
    }

    // Update player position based on speed
    player.x += speedX;
    player.y += speedY;

    // Check for collisions with rocks
    for (const rock of rocks) {
        if (
            player.x + player.width > rock.x &&
            player.x < rock.x + elementSize &&
            player.y + player.height > rock.y &&
            player.y < rock.y + elementSize
        ) {
            // Calculate the overlap on both X and Y axes
            const overlapX = Math.min(player.x + player.width, rock.x + elementSize) - Math.max(player.x, rock.x);
            const overlapY = Math.min(player.y + player.height, rock.y + elementSize) - Math.max(player.y, rock.y);

            if (overlapX < overlapY) {
                // Adjust the player's position along the X axis
                if (player.x < rock.x) {
                    player.x -= overlapX;
                } else {
                    player.x += overlapX;
                }
                speedX = 0; // Stop horizontal movement when colliding with a rock
            } else {
                // Adjust the player's position along the Y axis
                if (player.y < rock.y) {
                    player.y -= overlapY;
                } else {
                    player.y += overlapY;
                }
                speedY = 0; // Stop vertical movement when colliding with a rock
            }
        }
    }

    // Check for collisions with trees
    for (const tree of trees) {
        if (
            player.x + player.width > tree.x &&
            player.x < tree.x + elementSize &&
            player.y + player.height > tree.y &&
            player.y < tree.y + elementSize
        ) {
            // Calculate the overlap on both X and Y axes
            const overlapX = Math.min(player.x + player.width, tree.x + elementSize) - Math.max(player.x, tree.x);
            const overlapY = Math.min(player.y + player.height, tree.y + elementSize) - Math.max(player.y, tree.y);

            if (overlapX < overlapY) {
                // Adjust the player's position along the X axis
                if (player.x < tree.x) {
                    player.x -= overlapX;
                } else {
                    player.x += overlapX;
                }
                speedX = 0; // Stop horizontal movement when colliding with a tree
            } else {
                // Adjust the player's position along the Y axis
                if (player.y < tree.y) {
                    player.y -= overlapY;
                } else {
                    player.y += overlapY;
                }
                speedY = 0; // Stop vertical movement when colliding with a tree
            }
        }
    }

    // Keep the player within the world bounds
    player.x = Math.max(0, Math.min(worldWidth - player.width, player.x));
    player.y = Math.max(0, Math.min(worldHeight - player.height, player.y));

    // Update the camera position to keep the player centered
    camera.x = Math.max(0, Math.min(worldWidth - camera.width, player.x - camera.width / 2));
    camera.y = Math.max(0, Math.min(worldHeight - camera.height, player.y - camera.height / 2));


    // Draw the player and elements within the camera's view
    // ctx.drawImage(playerSprite, player.x - camera.x, player.y - camera.y, player.width, player.height);

    for (const tree of trees) {
        if (tree.x >= camera.x && tree.x <= camera.x + camera.width && tree.y >= camera.y && tree.y <= camera.y + camera.height) {
            // Draw the tree 2.5 times bigger
            const treeSize = elementSize * 3;
            // Adjust the tree position to make it impossible for the player to touch the entire picture
            const adjustedTreeX = tree.x - camera.x - (treeSize - elementSize) / 2;
            const adjustedTreeY = tree.y - camera.y - (treeSize - elementSize) / 2;
            ctx.drawImage(treeSprite, adjustedTreeX, adjustedTreeY, treeSize, treeSize);
        }
    }

    for (const rock of rocks) {
        if (rock.x >= camera.x && rock.x <= camera.x + camera.width && rock.y >= camera.y && rock.y <= camera.y + camera.height) {
            ctx.drawImage(rockSprite, rock.x - camera.x, rock.y - camera.y, elementSize, elementSize);
        }
    }

    // Implement survival mechanics here (hunger, temperature, etc.)
    // Add interactions with trees, rocks, and other elements as needed.
}

// Keyboard input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Load the player, tree, and rock sprites before starting the game loop
playerSprite.onload = function () {
    treeSprite.onload = function () {
        rockSprite.onload = function () {
            gameLoop(); // Start the game loop once all sprites are loaded
        };
    };
};
