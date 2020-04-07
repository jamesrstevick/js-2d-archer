
/**********************************************
ARCHER GLOBAL VARIABLES
***********************************************/
// Sounds
var shootSnd = new Audio("sounds/arrow-shoot.wav");
var hitSnd = new Audio("sounds/arrow-hit.wav");
var warcrySnd = new Audio("sounds/war-cry.wav");
var volumeOn = true;
warcrySnd.volume = 0.1;
shootSnd.volume = 0.5;
hitSnd.volume = 0.35;
// Objects
var arrows = [];
var enemies = [];
var fallenEnemies = [];
var bowman;
var fence1;
var fence2;

/**********************************************
ARCHER SETTINGS
***********************************************/
// General
var point = 0;
var prevPoint = 0;
var lives = 10;
var frameRate = 20;
var level=0;
var pointIncrement = 0;
// Enemies
var enemySpeed = 0.5; // Enemy speed changes during game + .2
var startHeight = 50;
var fallenEnemyWait = 30;
var enemyCreationRate = 3500; // Enemy created every X milliseconds - 200
// Bowman
var speedl = 0;
var speedr = 0;
var acc = 0.35;
var maxSpeed = 8;
var arrowSpeed = 3.5;  // Arrow speed changes during game +0.5
var bowmanWait = 7;
var arrowFrameWait = 5;
// Timing
var time=0;
var t1=0;
var t2=0;
monspeed=-1;
// Canvas
var archerCanvas = {
    canvas : document.createElement("canvas"),
    start : function() {
    	this.canvas.width = 500;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, frameRate);
        window.addEventListener('keydown', function (e) { archerCanvas.key = e.keyCode;})
        window.addEventListener('keyup', function (e) { archerCanvas.key = false;})
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    },
    unstop : function() {
        this.interval = setInterval(updateGameArea, frameRate);
    }
}

/**********************************************
HELPER FUNCTIONS
***********************************************/
// Toggle volume on and off
function volumeToggle(){
    if (volumeOn){
        document.getElementById("volumeToggle").innerHTML = "SOUND ON";
        volumeOn = false;
    } else {
        document.getElementById("volumeToggle").innerHTML = "SOUND OFF";
        volumeOn = true;
    }
}
// Boolean returns true every n frames
function everyinterval(n) {
    if (archerCanvas.frameNo % parseInt(n) == 0) {
        return true;}
    return false;
}


/**********************************************
ARCHER OBJECT SETUP
***********************************************/
function startGame(){
    bowman = new gameObject(80,49,210,410,"image","images/bow-arrow-full.png","images/bow-release-full.png","");
    fence1 = new gameObject(255,70,0,445,"image","images/picket-fence-full.png","","");
    fence2 = new gameObject(255,70,245,445,"image","images/picket-fence-full.png","","");
    infoRect = new gameObject(500,50,0,0,"fig","rgb(27, 91, 255)",0.3,"");
    pointText = new gameObject(0,0,20,37,"text","30px","Arial","rgb(27, 91, 255)");
    livesText = new gameObject(0,0,360,37,"text","30px","Arial","rgb(27, 91, 255)");
    gameOverRect = new gameObject(500,100,0,200,"fig","#F64949",0.2,"");
    gameOverText = new gameObject(0,0,95,270,"text","60px","Arial","#F64949");
    newLevelText = new gameObject(0,0,155,270,"text","60px","Arial","#F64949");
    archerCanvas.start();
}

/**********************************************
ARCHER OBJECT MANAGER
***********************************************/
function gameObject(width, height, x_loc, y_loc, type, format1, format2, format3){
    // Initialize object with instance variables
    this.type = type;
    this.w = width;
    this.h = height;
    this.x = x_loc;
    this.y = y_loc;
    this.f1 = format1;
    this.f2 = format2;
    this.f3 = format3;
    if (this.type == "image"){
        this.image = new Image;
        this.image.src = this.f1;
        this.f3 = this.f2;
        this.f2 = this.f1;
    } 
    else if (this.type == "text"){
        this.text = "";
    }
    // Render game object method
    this.render = function(){
        ctx = archerCanvas.context;
        if (this.type == "text") {
            ctx.font = this.f1 + " " + this.f2;
            ctx.fillStyle = this.f3;
            ctx.fillText(this.text, this.x, this.y);
        }
        else if(this.type=="fig"){
            ctx.fillStyle = this.f1;
            ctx.globalAlpha = this.f2;
            ctx.fillRect(this.x, this.y, this.w, this.h);  
            ctx.globalAlpha = 1.0;
        }
        else{
            this.image.src = this.f1;
            ctx.drawImage(
            this.image, 
            this.x, this.y,
            this.w, this.h);
        }
    } 
    // Method to determine object interaction boolean
    this.interact = function(obj,interaction) 
    {
        var leftSide = this.x + 0.35 * this.w;
        var rightSide = this.x + 0.75 * this.w;
        var topSide = this.y;
        var bottomSide = this.y + this.h;
        var objLeftSide = obj.x;
        var objRightSide = obj.x + obj.w;
        var objTopSide = obj.y;
        var objBottomSide = obj.y + obj.h;
        var interact = true;

        if (interaction == 0){
            if ((bottomSide < objTopSide) ||
                (topSide > objBottomSide) ||
                (rightSide < objLeftSide) ||
                (leftSide > objRightSide)) {
                    interact = false;
                }
        } else if (interaction == 50){
            var objBottomSide = obj.y + obj.h/2;
            var bottomSide = this.y + this.h/2;
            if ((bottomSide < objTopSide) ||
                (topSide > objBottomSide) ||
                (rightSide < objLeftSide) ||
                (leftSide > objRightSide)) {
                    interact = false;
                }
        }
        return interact;
    }
}

/**********************************************
ARCHER FRAME UPDATE MANAGER
***********************************************/
function updateGameArea() 
{
    // Initialize the screen
	var x, y;
    archerCanvas.clear();

    // Set maximum speed of bowman
    if (speedl > maxSpeed){speedl = maxSpeed;}
    if (speedr > maxSpeed){speedr = maxSpeed;}

    // Handle Left Key 
    if (archerCanvas.key == 37) {
        speedl += acc;
        if (bowman.x >= 5 - bowman.w / 2){
            bowman.x += -1-speedl;
        }
    } else {
        speedl = 0;
    }

    // Handle Right Key 
    if (archerCanvas.key == 39) {
        speedr += acc;
        if (bowman.x <= (archerCanvas.canvas.width - 5 - bowman.w / 2)){
            bowman.x += 1+speedr; 
        }
    } else {
        speedr = 0;
    }
    
    // Handle Spacebar 
    if (archerCanvas.key == 32) {
        
    	if(time>=(t1+arrowFrameWait))
    	{
            if(volumeOn){shootSnd.play();}
            arrowx=bowman.x+bowman.w/2 - 10;
            arrowy=bowman.y;
            arrows.push(new gameObject(20,49,arrowx, arrowy,"image","images/arrow-full.png","images/arrow-full.png",""));
            bowman.f1 = bowman.f3;
            t2 = time;
        }
        t1=time;
    }

    // Reset bow after release
    if(time==t2+bowmanWait){
        bowman.f1 = bowman.f2;
    }

    // Create and move enemies
    if (archerCanvas.frameNo == 0 || everyinterval(enemyCreationRate/frameRate)) {
        x = Math.floor(Math.random()*420 + 20);
        y = startHeight;
        enemies.push(new gameObject(40,59,x,y,'image',"images/enemy.png","",""));
    }
    for (i = 0; i < enemies.length; i += 1) {
        enemies[i].y += enemySpeed;
        enemies[i].render();
    }
    for (i = 0; i < arrows.length; i += 1) {
        arrows[i].y -= arrowSpeed;
        arrows[i].render();
    }
    for (i = 0; i < fallenEnemies.length; i += 1) {
        if (fallenEnemies[i][1] >= fallenEnemyWait){
            fallenEnemies.splice(i,1);
        } else {
            fallenEnemies[i][0].render();
            fallenEnemies[i][1] += 1;
        }
    }

    // Check for arrows hitting enemies
    for (e = 0; e < enemies.length; e += 1) {
        for(a = 0; a < arrows.length; a +=1) {
            if (enemies[e].interact(arrows[a],50)){
                if(volumeOn){hitSnd.play();}
                point += pointIncrement;
                fallenEnemies.push([new gameObject(59,40,enemies[e].x-9, enemies[e].y+23,"image","images/enemy-fallen.png","",""), 0])
                enemies.splice(e,1);
                arrows.splice(a,1);
                break;
            }
        }
    }

    // Check for enemies hitting fences
    for (e = 0; e < enemies.length; e += 1) {
        if (enemies[e].interact(fence1,50) || enemies[e].interact(fence2,50)) {
            if(volumeOn){warcrySnd.play();}
            enemies.splice(e,1);
            lives -= 1;
        }
    }

    // Update text game objects
    pointText.text = "Points: " + point; 
    if(lives<10){
        livesText.text = "Lives:   " + lives;
    } else {
        livesText.text = "Lives: " + lives;
    }
    
    // Render all game objects
    infoRect.render();
    pointText.render();
    livesText.render();
    bowman.render();
    fence1.render();
    fence2.render();

    // Handle Game Over
    if(lives <= 0)
    {
        gameOverText.text = "Game Over";
        gameOverRect.render();
        gameOverText.render();
    	archerCanvas.stop();
    } 

    // Increase Level
    if((point==prevPoint + (level*5)*pointIncrement)){
        // Adjust Archer settings
        prevPoint = point;
        enemySpeed += 0.25;
        if (enemyCreationRate >= 2000){
            enemyCreationRate -= (500-level*35);
        } else {
            enemyCreationRate -= (300-level*20);
        }
        level++;
        arrowSpeed += 0.75;
        pointIncrement = level*5;
        // Display level up
        archerCanvas.stop();
        gameOverRect.render();
        newLevelText.text = "Level " + level;
        newLevelText.render();
        setTimeout(() => { archerCanvas.unstop(); }, 2000);
    }

    // Increment frame number and time
    archerCanvas.frameNo += 1;
    time++;
}
