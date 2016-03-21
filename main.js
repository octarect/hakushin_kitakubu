enchant();
window.onload = function() {
  //Ccreate a core object for enchant.js
	var core = new Core( 640, 480 );

  // Pre-load resources
	core.preload("image/kitakubu.png");
	core.preload("image/ground0.png");
	core.preload("image/ground1.png");
	core.preload("image/car.png");
	core.preload("image/bike2.png");
	core.preload("image/bike.png");
	core.preload("image/road.png");
	core.preload("image/guardRail.png");
	core.preload("image/bkg1.png");
	core.preload("image/school.png");
	core.preload("image/sazahouse.png");
	core.preload("image/clear.png");
	core.preload("image/bkg2_twn.png");
	core.preload("image/b1.png");
	core.preload("image/b2.png");
	core.preload("sound/ingame_bgm.mp3");
	core.preload("sound/clear.mp3");

  // Frame-per-second
  core.fps = 15;

  // Processing at start up
  core.onload = function() {
    // -- Stage setting --
    var g = 1;  // gravity
    var relativity = 1.0;
    var stage_length = 5000;

    // -- Variables -- 
    var time_temp;
    // Length between initial point and player
    var dist_count = 0;
    
    // Flags
    var flg_near_home = false;
    var flg_goal = false;
    var flg_game_over = false;
    var flg_first_loop = false;

		// Load a player image
		var player = new Sprite(128, 128);
	  player.image = core.assets["image/kitakubu.png"];
		player.x =  0;
		player.y = 270;
		player.frame = 0;	
		player.maxFrame = 12;	  // Animation flame
		player.vy = 0;		      // Gravity
		player.jumping = false;	// Flag (detect whether he is In the air)
		player.speed = 10;	    // Moving speed
		player.mode = 0;	      // Moving mode (0:walking 1:riding a motorcycle!!)

		// Background
		var ScrollBG = Class.create(Sprite, {
			initialize: function(width, height, x, y, fileName, speed) {
				Sprite.call(this, width, height);
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
				this.opacity = 1;	                  // Opacity (0.0 ~ 1.0)
				this.image = core.assets[fileName];
				this.speed = speed;
				
				// Process on each frame
				this.on("enterframe", function() {
					this.x -= this.speed * relativity;
					if(this.x < -this.width) {  // When background gets out from screen
						this.x = this.width - this.speed * relativity;
					} 
				});
				
				core.rootScene.addChild(this);
			}
		});

		var Object = Class.create(Sprite, {
			initialize: function(code, width, height, x, y, fileName, speed, maxFrame, frequency) {
				Sprite.call(this, width, height);
				this.x = x;
				this.y = y;
				this.basey = y;
				this.opacity = 1;			              // Opacity (0.0 ~ 1.0)
				this.image = core.assets[fileName];
				this.frame = 0;
				this.maxFrame = maxFrame;		        // frame-per-second
				this.mode = 0;
				this.speed = speed;
				this.firstSpeed = speed;		        // Initial speed
        this.vy = 0;				                // Vertical gravity speed
				
				// Process on each frame
				this.on("enterframe", function() {
					this.x -= this.speed * relativity;	// Move
					
					if (this.x < -width) {	  // When background gets out from screen
						this.x = 700 + rand(10) * 100 + frequency;
						if (code == 2) {
							core.rootScene.removeChild(this);
							this.y = -500
						} 
						this.visible = true;
						this.mode = 0;
						this.y = this.basey;
						this.rotation = 0;
					} 
					
					this.frame = this.age % this.maxFrame;
					
					// Car
					if (code == 0) {
						if (this.within(player, 120)) {
							if (player.mode == 0) {
								flg_game_over = true;
							} else if (player.mode == 1) {
								this.mode = 1;
							}
						}
						if (this.mode == 1) {
							this.rotate(90);
							this.y += -50;
						}
					}
					// Motorcycle
					if (code == 1) {
						
						if (this.within(player, 60)) {
							this.visible = false;
							player.image = core.assets["image/bike.png"];
							player.maxFrame = 3;
							player.mode = 1;
							player.y = 270;
							relativity = 2.0; // 相対速度の変化
							time_temp = Math.floor( (core.frame / core.fps) );
							bikeTime.visible = true;
						}
						if (player.mode == 1) {
							if (Math.floor(core.frame / core.fps) - time_temp > 10) {
								player.mode = 0;
								player.image = core.assets["image/kitakubu.png"];
								player.maxFrame = 12;
								relativity = 1.0;
								bikeTime.visible = false;
							}
						}
					}
					// House
					if (code == 3) {
						if (flg_near_home && this.speed == 0) {
							this.speed = 10;
							this.x = 640;
							this.y = 124;
						}
						if (this.within(player, 150)) {
							relativity = 0;
							flg_goal = true;
						}
					}
					// Message to congratulate
					if (code == 4) {
						if (!flg_goal) {
							this.visible = false;	// Hidden normally
						} else {
							this.visible = true;
							var sound = core.assets['sound/clear.mp3'].play();
							setTimeout(function() {
								document.location = "index.html";
							}, 5000);

							core.stop();
						}
					}
					// Rugger man
					if (code == 5) {
						if (this.y <= 150) {
							this.vy = 15;
						} else if (this.y >= this.basey) {
							this.vy = -15;
						}
						this.y += this.vy;
						
						if (this.within(player, 70)) {
							if (player.mode == 0) {
								flg_game_over = true;
							} else if (player.mode == 1) {
								this.mode = 1;
							}
						}
						if (this.mode == 1) {
							this.rotate(45);
							this.speed = this.speed * (-1);
							this.y += -40;
						}
					}
					// Karate man
					if (code == 6) {
						if (this.age % 10 == 0) {
							this.speed = this.firstSpeed + rand(20) - 10;  
						}
						if (this.within(player, 50)) {
							if (player.mode == 0) {
								flg_game_over = true;
							} else if (player.mode == 1) {
								this.mode = 1;
							}
							
						}
						if (this.mode == 1) {
							this.rotate(90);
							this.speed = this.speed * (-1);
							this.y += -50;
						}
					}
				});
				
				core.rootScene.addChild(this);
			}
		});

		// Create instance 
		var back0 = new ScrollBG(1280, 480, 0, 0, "image/bkg1.png", 4);
		var back1 = new ScrollBG(1280, 480, 1280, 0, "image/bkg1.png", 4);
		var near0 = new ScrollBG(1280, 480, 0, 0, "image/bkg2_twn.png", 8);
		var near1 = new ScrollBG(1280, 480, 1280, 0, "image/bkg2_twn.png", 8);
		
		var guard0 = new ScrollBG(900, 80, 0, 330, "image/guardRail.png", 10);
		var guard1 = new ScrollBG(900, 80, 900, 330, "image/guardRail.png", 10);
		var ground0 = new ScrollBG(1800, 100, 0, 380, "image/road.png" , 10);
		var ground1 = new ScrollBG(1800, 100, 1800, 380, "image/road.png", 10);
	
		var school = new Object(2, 256, 256, 0, 124, "image/school.png", 10, 1, 10);
		var home = new Object(3, 256, 256, 640, 480, "image/sazahouse.png", 0, 1, 10);
		var bicycle = new Object(1, 128, 128, 1000, 300, "image/bike2.png", 5, 1, 2000);
		var car = new Object(0, 238, 103, 500, 310, "image/car.png", 20, 3, 600);
		var rugby = new Object(5, 131, 129, 1000, 310, "image/b1.png", 15, 1, 300);
		var karate = new Object(6, 99, 130, 1500, 310, "image/b2.png", 10, 1, 500);
		
		var clearFont = new Object(4, 640, 480, 0, 0, "image/clear.png", 0, 1, 10);
		
		
		// process for game on each frame
		core.rootScene.addEventListener("enterframe", function() {
			if (!flg_goal && !flg_game_over) {
				if (!flg_first_loop) {
					var sound = core.assets['sound/ingame_bgm.mp3'].play();
					flg_first_loop = true;
				}
			} else {
				var sound = core.assets['sound/ingame_bgm.mp3'].stop();
			}
			
			if (flg_game_over) {
				core.pushScene(gameOverScene);
				core.stop();
				document.location = "index.html";
			}
		});
		
		// Process for player on each frame
		player.addEventListener("enterframe", function() {
			
			dist_count += ground0.speed * relativity;
			if (dist_count > stage_length) {
				flg_near_home = true;
			}
			console.log(dist_count);
			console.log(flg_near_home);
			
			// Process for moving
			if (core.input.left) this.x -= this.speed;
			if (core.input.right) this.x += this.speed;
			if (core.input.up && !player.jumping) {
				this.vy = -30;
				this.jumping = true;
				console.log(this.jumping);
				this.y += this.vy;
			}
			
			// Process for gravity
			this.vy += 2;
			if (this.vy > 0) {
				this.vy += 1.0;
			}
			
			// Colilision (ceil)
			if (this.y < 80 && this.vy < -5) {
				this.vy = -5;
			}
			
			// Collision (floor)
			if (this.intersect(ground0) || this.intersect(ground1)){
				label.text = "hit";
				this.vy = 0;
				this.jumping = false;
				console.log(this.jumping);
				this.frame = this.age % this.maxFrame;;
			} else {
				this.y += this.vy;
				this.frame = 12;
			}
		});
		
		var gameOverScene = new Scene();
		gameOverScene.backgroundColor = "black";
		
		// Label
		// Time elapsed from starting
		var label  = new Label();
		label.x = 300;
		label.y = 5;
		label.color = "red";
		label.font = "14px 'Arai'";
		label.text = "0";
		label.on("enterframe", function() {
			label.text = (core.frame / core.fps).toFixed(2);
		} );

		// Motorcycle time left
		var bikeTime  = new Label();
		bikeTime.x = 500;
		bikeTime.y = 5;
		bikeTime.color = "blue";
		bikeTime.font = "56px 'Arai'";
		bikeTime.text = "0";
		bikeTime.visible = false;
		bikeTime.on("enterframe", function() {
			bikeTime.text = 10 - (Math.floor(core.frame / core.fps) - time_temp);
		} );
		
		core.rootScene.addChild(label);
		core.rootScene.addChild(bikeTime);
		core.rootScene.addChild(player);
	}
	core.start();

};

function rand(n) {
	return Math.floor(Math.random() * ( n + 1 ));
}
