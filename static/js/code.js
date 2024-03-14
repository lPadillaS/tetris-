const board = document.getElementById("gameBoard");
const height = 500;
const width = 250;
board.style.width = width + "px";
board.style.height = height + "px";
const cellSize = 25;
let activeInterval = null;
let timerInterval = null;
let yLevel = 2;
let xLevel = 6;
let currentPiece = null;
let colorIndex = null;
let flatBoard = []
let currentOrientation = 1;
let collided = null;
let rockBottom = null;
let crashed = null;
let lost = null;
let filled = null;
let clearing = null;
let hours = 0;
let minutes = 0;
let seconds = 0;
const timer = document.getElementById("myTimer");
// Define the different classes of pieces and asign them a color
let colorClasses = [
    "rightLCell", 
    "leftLCell", 
    "lineCell", 
    "tCell", 
    "squareCell", 
    "leftStairCell", 
    "rightStairCell"
]
// Draw the board
for (let i = 0; i < height / cellSize; i++)
{
    flatBoard[i] = []
    for(let j = 0; j < width / cellSize; j++)
    {
        let cell = document.createElement("div");
        cell.style.height = cellSize + "px";
        cell.style.width = cellSize + "px";
        cell.style.boxSizing = "border-box";
        cell.className = "background"
        cell.style.border = "1px solid white"
        cell.id = String(i) + "-" + String(j);
        board.append(cell);
        flatBoard[i][j] = cell;
    }
}
// Make the pieces
let pieces = [
[
    {x:0, y:-1},
    {x:1, y:-1},
    {x:0, y:0},
    {x:0, y:1}
],
[
    {x:0, y:-1},
    {x:-1, y:-1},
    {x:0, y:0},
    {x:0, y:1}
],
[
    {x:.5, y:-1.5},
    {x:.5, y:-.5},
    {x:.5, y:.5},
    {x:.5, y:1.5}
],
[
    {x:0, y:-1},
    {x:0, y:0},
    {x:0, y:1},
    {x:1, y:0}
],
[
    {x:-.5, y:-.5},
    {x:.5, y:-.5},
    {x:-.5, y:.5},
    {x:.5, y:.5}
],
[
    {x:-1, y:-1},
    {x:0, y:-1},
    {x:0, y:0},
    {x:1, y:0}
],
[
    {x:1, y:-1},
    {x:0, y:-1},
    {x:0, y:0},
    {x:-1, y:0}
]
]
// randomize a piece
function getNewPiece(){
    if (currentOrientation != 1)
    {
        for (let i = 0; i <= 4 - currentOrientation; i++)
        {
            for (let j = 0; j < 4; j++)
            {
                let temp = currentPiece[j].x;
                currentPiece[j].x = currentPiece[j].y * -1;
                currentPiece[j].y = temp
            }
        }
    }
    yLevel = 2;
    xLevel = 6;
    currentOrientation = 1;
    let pieceIndex = Math.floor(Math.random() * 7);
    currentPiece = pieces[pieceIndex];
    colorIndex = pieceIndex;
    rockBottom = false;
}
// functionality for rotation
function rotatePiece(event){
    if (event.key == "ArrowUp")
    {
        checkCollision("r")
        if(!collided)
        {
            for (let i = 0; i < 4; i++)
            {
                let temp = currentPiece[i].x;
                currentPiece[i].x = currentPiece[i].y * -1;
                currentPiece[i].y = temp
            }
            if(currentOrientation == 4)
            {
                currentOrientation = 1;
            }
            else
            {
                currentOrientation++;
            }
            clear();
            drawPiece(xLevel, yLevel);
        }
    }
}
//functionality for moving
function sideMove(event){
    if(event.key == "ArrowLeft")
    {
        checkCollision("l");
        if (!crashed)
        {
            xLevel--;
            clear();
            drawPiece(xLevel, yLevel);
        }
        crashed = false;
    }
    else if (event.key == "ArrowRight")
    {
        checkCollision("ri")
        if (!crashed)
        {
            xLevel++;
            clear();
            drawPiece(xLevel, yLevel);
        }
        crashed = false;
    }
}
// draw the piece
function drawPiece(x, y){
    let myX = x;
    let myY = y;

    if(currentPiece == pieces[2] || currentPiece == pieces[4])
    {
        myX += .5
        myY += .5
    }
    for(let i = 0; i < 4; i++)
    {
        flatBoard[myY + currentPiece[i].y][myX + currentPiece[i].x].className = colorClasses[colorIndex];
        flatBoard[myY + currentPiece[i].y][myX + currentPiece[i].x].classList.add("movingBlock");
        
    }
    test = checkCollision("sw");
    for (let j = 0; j < 4; j++)
    {
        if (flatBoard[test + currentPiece[j].y][myX + currentPiece[j].x].classList[1] != "movingBlock")
        {
            flatBoard[test + currentPiece[j].y][myX + currentPiece[j].x].className = "shadow";
        }
        
    }
}
// Add an event listener to start the game
document.addEventListener("keydown", handleStart);
function handleStart(event)
{
    if (event.key == "Enter")
    {
        lost = false;
        getNewPiece();
        displayTimer();
        document.addEventListener("keydown", rotatePiece, event);
        document.addEventListener("keydown", sideMove);
        document.addEventListener("keydown", goFast);
        document.removeEventListener("keydown", handleStart);
        resetInterval(600);
    }
}
function goFast(event){
    if (event.key == "ArrowDown")
    {
        resetInterval(50);
        document.removeEventListener("keydown", goFast);
        document.addEventListener("keyup", goSlow);
    }
    function goSlow(event){
        if (event.key == "ArrowDown")
        {
            document.removeEventListener("keyup", goSlow);
            document.addEventListener("keydown", goFast);
            resetInterval(600);
        }
    }
}
function resetInterval(time){
    if(activeInterval)
    {
        clearInterval(activeInterval);
    }
    activeInterval = setInterval(moveDown, time);
}
function moveDown(){
    if (yLevel <= 2)
    {
        checkCollision("s");
    }
    if (lost)
    {
        gameOver();
    }
    else{
        checkCollision("d")
        clear();
        drawPiece(xLevel, yLevel);
        yLevel++;
        if(rockBottom)
        {
            freeze();
            getNewPiece();
        }
    }
    }

function clear(){
    let moving = document.getElementsByClassName('movingBlock');
    let shadows = document.getElementsByClassName("shadow")
    console.log(moving)
    for (let i = 0; i < moving.length; i+=0)
    {
        if (shadows[0])
        {
            shadows[0].className = "background"
        }
        moving[0].className = "background"
    }
}
function freeze(){
    let ready = document.getElementsByClassName("movingBlock");
    for (let i = 0; i < ready.length; i+=0){
        ready[0].classList.add("setBlock");
        ready[0].classList.remove("movingBlock");
    }
    detectLines();
}
// Check for collisions
function checkCollision(situation){
    let myX = 0;
    let myY = 0;
    collided = false;
    if(currentPiece == pieces[2] || currentPiece == pieces[4])
    {
        myX = .5;
        myY = .5;
    }
    if (situation == "r")
    {
  
        let futurePosition = deepCopy(currentPiece);
        for (let i = 0; i < futurePosition.length; i++)
        {
            let temp = futurePosition[i].x;
            futurePosition[i].x = futurePosition[i].y * -1;
            futurePosition[i].y = temp;
        }
        for (let j = 0; j < 4; j++)
        {
            try
            {
                if(flatBoard[yLevel + myY + futurePosition[j].y][xLevel + myX + futurePosition[j].x].classList[1] == "setBlock")
                {
                    collided = true;
                }
            }
            catch(error)
            {
                if (xLevel < (width/cellSize) / 2)
                {
                    xLevel = 1;
                }
                else 
                {
                    if (currentPiece == pieces[2])
                    {
                        xLevel = width/cellSize - 3;
                    }
                    else
                    {
                        xLevel = width/cellSize - 2;
                    }
                }
                console.log(error);
            }
        }
    }
    else if (situation == "d")
    {
        for (let cell = 0; cell < 4; cell++)
        {
            if (yLevel + myY + currentPiece[cell].y >= height/cellSize - 1 || flatBoard[yLevel + myY + currentPiece[cell].y + 1][xLevel + myX + currentPiece[cell].x].classList[1] == "setBlock")
            {
                rockBottom = true;
            }
        }
    }
    else if (situation == "l")
    {
        if(currentPiece == pieces[2] || currentPiece == pieces[4])
        {
            myX = .5;
            myY = .5;
        }
        for (let left = 0; left < 4; left++)
        {
            if (xLevel + myX + currentPiece[left].x > 0)
            {
                if (flatBoard[yLevel + myY + currentPiece[left].y][xLevel + myX + currentPiece[left].x - 1].classList[1] == "setBlock")
                {
                    crashed = true;
                }
            }
            else{
                crashed = true;
            }
   
        }
    }
    else if (situation == "ri")
    {
        if(currentPiece == pieces[2] || currentPiece == pieces[4])
        {
            myX = .5;
            myY = .5;
        }
        for (let right = 0; right < 4; right++)
        {
            if (xLevel + myX + currentPiece[right].x < width/cellSize - 1)
            {
                if (flatBoard[yLevel + myY + currentPiece[right].y][xLevel + myX + currentPiece[right].x + 1].classList[1] == "setBlock")
                {
                    crashed = true;
                }
            }   
            else 
            {
                crashed = true;
            }
      
        }
    }
    else if (situation == "s")
    {   
        goUp();
        function goUp(){
            for(let cell = 0; cell < 4; cell++)
            {
                if (lost)
                {
                    return;
                }
                try{
                    if(flatBoard[yLevel + myY + currentPiece[cell].y][xLevel + myX + currentPiece[cell].x].classList[1] == "setBlock")
                    {
                        yLevel--;
                        goUp();
                    }
                }
                catch(error)
                {
                    lost = true;
                    return;
                }
            }
            
        }
    }
    else if (situation == "sw")
    {
        testY = 0;
        while (testY + currentPiece[3].y + myY < height/cellSize)
        {
            for (let cell = 0; cell < 4; cell++)
            {
                if (myY + currentPiece[cell].y + testY >= height/cellSize - 1 || flatBoard[myY + currentPiece[cell].y + testY + 1][xLevel + myX + currentPiece[cell].x].classList[1] == "setBlock")
                {
                    return testY + myY;
                }
            }
            testY += 1;
        }
        
       
    }
}   
function detectLines(){
    for (let i = height/cellSize - 1; i > 0; i--)
    {
        for (let j = 0; j < width/cellSize; j++)
        {
            if (flatBoard[i][j].classList[1] == "setBlock" )
            {
                if (j == width/cellSize - 1)
                {
                    clearing = true;
                    filled = true;
                }
                continue;
            }
            else
            {
                filled = false;
                clearing = false;
            }
            break;

        }
        if (!filled)
        {
            continue;
        }
        else
        {
            eatLines(i);
            i++;
        }
    }

}
function eatLines(line){
    let setBlocks = document.getElementsByClassName("setBlock");
    let firstBlock = flatBoard[line][0];
    console.log(firstBlock);
    for (let i = 0; i < width/cellSize; i++)
    {
        flatBoard[line][i].className = "background";
    }
    for (let y = line; y >= 0; y--)
    {
        for (let x = 0; x < width/cellSize; x++)
        {
            if (flatBoard[y][x].classList[1] == "setBlock")
            {
                let temp = [...flatBoard[y][x].classList];
                flatBoard[y][x].className = "background"
                for (let className = 0; className < temp.length; className++)
                {
                    flatBoard[y + 1][x].classList.remove("background");
                    flatBoard[y + 1][x].classList.add(temp[className]);
                }
               
            }
        }
    }

}
function deepCopy(obj) {
    if (typeof obj != 'object' || obj == null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepCopy);
    }

    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = deepCopy(obj[key]);
        }
    }

    return result;
}
function displayTimer(){
    hours = 0;
    minutes = 0;
    seconds = 0;
    timerInterval = setInterval(runTimer, 1000)
}
function runTimer(){
    seconds++;
    if (seconds >= 60)
    {
        minutes++;
        seconds = 0;
        if (minutes >= 60)
        {
            hours++;
            minutes = 0;
        }
    }
    hours = formatZeros(hours);
    minutes = formatZeros(minutes);
    seconds = formatZeros(seconds);
    timer.innerText = `Time Survived: 
    ${hours}:${minutes}:${seconds}`;
    
    function formatZeros(time){
        let myTime = time.toString();
        return myTime.length > 1 ? myTime : "0" + myTime
    }
}
function gameOver(){
    let score = {_hours: hours, _minutes: minutes, _seconds: seconds};
    console.log(score)
    clearBoard();
    clearInterval(activeInterval);
    clearInterval(timerInterval);
    document.removeEventListener("keydown", rotatePiece);
    document.removeEventListener("keydown", sideMove);
    document.removeEventListener("keydown", goFast);
    document.addEventListener("keydown", handleStart);
    $.ajax({
        type: 'POST',
        url: '/tetris',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({ score: score }),
        success: function(response) {
            console.log('Score saved successfully:', response);
        },
        error: function(error) {
            console.error('Error saving score:', error);
        }
    });

}
function clearBoard(){
    let sets = document.getElementsByClassName("setBlock");
    for (let i = 0; i < sets.length;)
    {
        sets[i].className = "background";
    }
}