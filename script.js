window.onload = function() {
  var plasticPieces = []; //array to store all pieces of plastic
  var corals = [];
  var frame = 0; //variable to count the frames
  var images = [
    "./images/plastic.png",
    "./images/plastic1.png",
    "./images/plastic2.png",
    "./images/plastic3.png",
    "./images/plastic4.png",
    "./images/plastic5.png",
    "./images/plastic6.png",
    "./images/plastic7.png",
    "./images/plastic8.png"
  ];
  var imageDiver = "";
  var level = 1;
  var lives = 3;
  var gameStarted = false;
  var speechBubble = [];
  var score = 0;
  var hearts = [];
  var diverName = "";
  var returning = false;
  var gravity = 0.1;

  var plasticSound = new Audio(
    "./sounds/446111__justinvoke__success-jingle.wav"
  );
  var coralSound = new Audio(
    "./sounds/404747__owlstorm__retro-video-game-sfx-ouch.wav"
  );
  var heartSound = new Audio("./sounds/428156__higgs01__yay.wav");
  var gameOverSound = new Audio(
    "./sounds/76376__deleted-user-877451__game-over.wav"
  );
  var go = new Audio("./sounds/187409__mazk1985__robot-go.wav");
  var countdownSound = new Audio(
    "./sounds/270092__theriavirra__drumsticks-dave-weckl-evolution-open-wide-no3.wav"
  );
  var levelSound = new Audio("./sounds/353546__maxmakessounds__success.wav");

  //choose character on the start screen
  function selectDiver() {
    if (document.getElementById("#diver1").checked) {
      imageDiver = "images/diver1.png";
    } else {
      imageDiver = "images/diver3.png";
    }
  }

  //variable with all info on the canvas
  var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
      this.canvas.width = 1000;
      this.canvas.height = 500;
      this.context = this.canvas.getContext("2d");
      $(".score-box").after(this.canvas);
      //create diver and first piece of plastic
      selectDiver();
      diver = new Component(imageDiver, 0, 200, 200, 100);
      plastic = new Component(randomPicture(), 1000, randomY(), 100, 100);
      plasticPieces.push(plastic);
      coral = new Component("./images/coral.png", 1100, randomY(), 100, 150);
      corals.push(coral);
      heart = new Component("./images/heart.png", 1200, randomY(), 50, 50);
      hearts.push(heart);
    },
    clear: function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  //moving background image
  var backgroundImage = {
    img: "./images/background.png",
    x: 0,
    move: function() {
      this.x += -(1 + level * 0.5);
      this.x %= myGameArea.canvas.width;
    },

    draw: function() {
      var ctx = myGameArea.context;
      var img = new Image();
      img.src = "./images/background.png";
      ctx.drawImage(
        img,
        this.x,
        0,
        myGameArea.canvas.width,
        myGameArea.canvas.height
      );
      if (-(1 + level * 0.5) < 0) {
        ctx.drawImage(
          img,
          this.x + myGameArea.canvas.width,
          0,
          myGameArea.canvas.width,
          myGameArea.canvas.height
        );
      } else {
        ctx.drawImage(
          img,
          this.x - img.width,
          0,
          myGameArea.canvas.width,
          myGameArea.canvas.height
        );
      }
    }
  };

  //class to create new components - diver and pieces of plastic
  class Component {
    constructor(image, x, y, width, height) {
      this.image = image;
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
      this.hit = false;
    }

    //update the canvas and draw image
    update() {
      var ctx = myGameArea.context;
      var img = new Image();
      img.src = this.image;
      ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
  }

  //functions to get random plastic positions, plastic images and gaps between pieces of plastic
  function randomY() {
    return Math.floor(
      Math.floor(Math.random() * (myGameArea.canvas.height + 5 - 125))
    );
  }

  function randomPicture() {
    var randomIndex = Math.floor(Math.floor(Math.random() * images.length));
    return images[randomIndex];
  }

  function randomGap() {
    var max = 200;
    var min = 30;
    return Math.floor(Math.random() * (max - min)) + min;
  }

  //check, if the target is hit
  function intersect(rect1, rect2) {
    rect1left = rect1.x;
    rect1top = rect1.y;
    rect1right = rect1.x + rect1.width;
    rect1bottom = rect1.y + rect1.height;

    rect2left = rect2.x;
    rect2top = rect2.y;
    rect2right = rect2.x + rect2.width;
    rect2bottom = rect2.y + rect2.height;

    return !(
      rect1left > rect2right ||
      rect1right < rect2left ||
      rect1top > rect2bottom ||
      rect1bottom < rect2top
    );
  }

  //draw score in the upper right corner
  function writeScore(score) {
    $(".score-box-left").html(
      "<p>Diver: " +
        diverName +
        "<br>Collected: " +
        score +
        "<br>Lives: " +
        lives +
        "</p>"
    );
    $(".level-box").html("<p>" + level + "</p>");
  }

  function levelDone(score) {
    if (score >= 5) {
      levelSound.play();
      $("canvas").remove();
      $("canvas").hide();
      plasticPieces = [];
      corals = [];
      hearts = [];
      $("#level").html(Number(level) + 1);
      gameStarted = false;
      playerHighscore();
      $(".next-level-box").show();
    }
  }

  function playerHighscore() {
    var currentHighscore = localStorage.getItem(diverName);
    if (currentHighscore !== null && currentHighscore >= level) {
      return;
    } else {
      localStorage.setItem(diverName, level);
    }
  }

  function gameOver(lives) {
    if (lives == 0) {
      gameOverSound.play();
      $("canvas").remove();
      $("canvas").hide();
      plasticPieces = [];
      corals = [];
      hearts = [];
      $(".level-box").html("");
      $(".game-over-box").show();
      $("#final-level").text(level + ".");
      playerHighscore();
      $("#highscore").text(localStorage.getItem(diverName));
      gameStarted = false;
      // console.log(localStorage.getItem(diverName));
    }
  }

  function drawBubble() {
    //make sure bubble isn't displayed outside of canvas
    if (diver.y < 50) {
      speechBubble.push(
        new Component("./images/bubble-png.png", 200, 0, 75, 50)
      );
    } else {
      speechBubble.push(
        new Component("./images/bubble-png.png", 200, diver.y - 75, 75, 50)
      );
    }
    //delete bubble after 0.5 seconds
    setTimeout(function() {
      speechBubble.shift();
    }, 700);
  }

  function sortStorage(storage) {
    var storageArray = [];
    for (var player in storage) {
      if (player !== "length" && player !== "diverName") {
        storageArray.push([player, storage[player]]);
      }
    }
    storageArray.sort(function(a, b) {
      return b[1] - a[1];
    });
    return storageArray;
  }

  function writeHighScore(array) {
    $(".highscore-left").html("<h2>Player</h2>");
    $(".highscore-right").html("<h2>Player</h2>");
    for (var i = 0; i < localStorage.length && i < 5; i++) {
      $(".highscore-left").append(array[i][0] + "<br>");
      $(".highscore-right").append(array[i][1] + "<br>");
    }
  }

  var count = 3;
  function countdown() {
    countdownSound.pause();
    countdownSound.currentTime = 0;
    var ctx = myGameArea.context;
    if (count > 0) {
      ctx.clearRect(0, 0, 1000, 500);
      diver.update();
      ctx.font = "150px Raleway";
      ctx.fillStyle = "#092243 ";
      ctx.fillText(count, 450, 180);
      count--;
      countdownSound.play();
      setTimeout(countdown, 1000);
    } else {
      go.play();
      updateGameArea();
    }
  }

  //updating the canvas (clearing and updating)
  function updateGameArea() {
    //if game is not started, don't do anything
    if (!gameStarted) {
      return;
    }
    levelDone(score);
    //increasing frame by one
    frame++;
    myGameArea.clear();

    //moving the background
    backgroundImage.move();
    backgroundImage.draw();

    //always update diver, plastic pieces, corals, hearts and bubble
    plasticPieces.forEach(function(plastic) {
      // console.log("newplastic");
      // console.log(plasticPieces);
      plastic.x = plastic.x - (1 + level * 0.5);
      plastic.update();
    });

    corals.forEach(function(coral) {
      // console.log("newplastic");
      // console.log(plasticPieces);
      coral.x = coral.x - (1 + level * 0.5);
      coral.update();
    });

    speechBubble.forEach(function(bubble) {
      bubble.update();
    });

    hearts.forEach(function(heart) {
      heart.x = heart.x - (1 + level * 0.5);
      heart.update();
    });
    diver.update();

    //if certain frame is reached, add new piece of plastic
    if (
      frame % randomGap() === 0 &&
      plasticPieces[plasticPieces.length - 1].x < 800 &&
      corals[corals.length - 1].x < 900 &&
      hearts[hearts.length - 1].x < 900
    ) {
      plasticPieces.push(
        new Component(randomPicture(), 1000, randomY(), 100, 100)
      );
    }
    if (
      frame % randomGap() === 0 &&
      corals[corals.length - 1].x < 800 &&
      hearts[hearts.length - 1].x < 900 &&
      plasticPieces[plasticPieces.length - 1].x < 900
    ) {
      corals.push(
        new Component("./images/coral.png", 1000, randomY(), 100, 150)
      );
    }

    if (
      frame % 1100 === 0 &&
      hearts[hearts.length - 1].x < 200 &&
      corals[corals.length - 1].x < 900 &&
      plasticPieces[plasticPieces.length - 1].x < 900
    ) {
      hearts.push(new Component("./images/heart.png", 1000, randomY(), 50, 50));
    }

    //check, if diver and plastic collide
    plasticPieces.forEach(function(plastic) {
      if (
        intersect(
          {
            x: diver.x,
            y: diver.y + 5,
            width: diver.width - 5,
            height: diver.height - 5
          },
          {
            x: plastic.x,
            y: plastic.y,
            width: plastic.width,
            height: plastic.height
          }
        )
      ) {
        // console.log("collide");
        //if they collide, increase score and move plastic out of the screen
        if (score < 4) {
          plasticSound.play();
        }
        score++;
        plastic.x -= 1000;
      }
    });
    //check, if diver and corals collide
    corals.forEach(function(coral) {
      if (
        intersect(
          {
            x: diver.x,
            y: diver.y + 5,
            width: diver.width - 5,
            height: diver.height - 5
          },
          {
            x: coral.x + 5,
            y: coral.y + 5,
            width: coral.width - 5,
            height: coral.height - 5
          }
        ) &&
        coral.hit == false
      ) {
        //if they collide, increase coralsHit, draw speech bubble and check, if game over
        if (lives > 1) {
          coralSound.play();
        }
        lives--;
        coral.hit = true;
        drawBubble();
        gameOver(lives);
      }
    });

    //increase lives when heart is collected (maximum 3 hearts)
    hearts.forEach(function(heart) {
      if (
        intersect(
          {
            x: diver.x,
            y: diver.y + 5,
            width: diver.width - 5,
            height: diver.height - 5
          },
          {
            x: heart.x + 5,
            y: heart.y + 5,
            width: heart.width - 5,
            height: heart.height - 5
          }
        )
      ) {
        //if they collide, increase coralsHit
        heartSound.play();
        heart.y -= 1000;
        if (lives < 3) {
          lives++;
        }
      }
    });
    //updating score
    writeScore(score);
    // console.log(frame);
    window.requestAnimationFrame(updateGameArea);
  }

  //control the diver
  document.onkeydown = function(event) {
    var key = event.keyCode;
    if (key === 38 && diver.y > 5) {
      // console.log("moving up");
      diver.y -= 15;
    } else if (
      key === 40 &&
      diver.y < myGameArea.canvas.height - diver.height
    ) {
      diver.y += 15;
    }
  };

  $("#welcome-button").click(function() {
    $("#welcome-button")
      .parent()
      .hide();
    $("#instructions-button")
      .parent()
      .show();
  });

  $("#returning-button").click(function() {
    returning = true;
    $("#returning-button")
      .parent()
      .hide();
    $("#enter-name-button")
      .parent()
      .show();
  });

  $("#instructions-button").click(function() {
    $("#instructions-button")
      .parent()
      .hide();
    $("#instructions2-button")
      .parent()
      .show();
  });

  $("#instructions2-button").click(function() {
    $("#instructions2-button")
      .parent()
      .hide();
    $("#enter-name-button")
      .parent()
      .show();
  });

  $("#enter-name-button").click(function() {
    //check that name has been entered
    if ($("input").val() == "") {
      alert("Please enter your name.");
      return;
    }

    diverName = $("input").val();
    //check, if player really has played before, if not, alert and show back to start button
    if (returning == true && !(diverName in localStorage)) {
      alert(
        "Are you sure that you've played before? Please enter your name the exact same way as last time."
      );
      $("#to-start-button").show();
      return;
    }
    $("#enter-name-button")
      .parent()
      .hide();
    $("#start-game-button")
      .parent()
      .show();
    playerHighscore();
  });

  $("#to-start-button").click(function() {
    returning = false;
    $("#to-start-button")
      .parent()
      .hide();
    $("#welcome-button")
      .parent()
      .show();
  });

  $("#start-game-button").click(function() {
    if (returning == true) {
      level = localStorage.getItem(diverName);
    }
    gameStarted = true;
    $("#start-game-button")
      .parent()
      .parent()
      .hide();
    $(".score-box").show();
    //drawing the canvas - starting the game
    myGameArea.start();
    diver.update;
    //countdown and start updating canvas
    countdown();
    //clear and redraw (and repeat)
  });

  $("#next-level-button").click(function() {
    gameStarted = true;
    $("#next-level-button")
      .parent()
      .hide();
    score = 0;
    level++;
    //drawing the canvas - starting the game
    myGameArea.start();
    //clear and redraw (and repeat)
    countdown();
  });

  $(".restart-button").click(function(event) {
    gameStarted = true;
    var currentButton = $(this);
    currentButton.parent().hide();
    score = 0;
    lives = 3;
    //drawing the canvas - starting the game
    myGameArea.start();
    //clear and redraw (and repeat)
    countdown();
  });

  $(".highscore-button").click(function() {
    $(".highscore-button")
      .parent()
      .hide();
    $(".highscore-box").show();
    //sort localStorage by value, store in array and write it
    writeHighScore(sortStorage(localStorage));
  });

  $("#clear-button").click(function() {
    localStorage.clear();
    $(".highscore-left").html("<h2>Player</h2>");
    $(".highscore-right").html("<h2>Level</h2>");
  });
};
