const ws_addr = "127.0.0.1:8080/socket"

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

$( window ).resize(function() { 
    game.width = window.innerWidth; 
    game.height = window.innerHeight; 
});

var chat = $("#chat")

function preload() {
    game.load.image("space1", "images/space1.png");
    game.load.image("space2", "images/space2.png");
    game.load.image("space3", "images/space3.png");
    game.load.image("space4", "images/space4.png");
    game.load.audio('lost-in-thought', 'music/lost-in-thought.ogg');
}

var bgs = [];

function create() {
    game.stage.backgroundColor = '#000';
    game.world.setBounds(0, 0, 5000, 5000);
    game.camera.x = (game.world.width-game.width)/2
    game.camera.y = (game.world.height-game.height)/2

    bgs.push(game.add.tileSprite(game.camera.x, game.camera.y, game.stage.bounds.width, game.stage.bounds.height, 'space1'))
    bgs.push(game.add.tileSprite(game.camera.x, game.camera.y, game.stage.bounds.width, game.stage.bounds.height, 'space2'))
    bgs.push(game.add.tileSprite(game.camera.x, game.camera.y, game.stage.bounds.width, game.stage.bounds.height, 'space3'))
    bgs.push(game.add.tileSprite(game.camera.x, game.camera.y, game.stage.bounds.width, game.stage.bounds.height, 'space4'))

    music = game.add.audio('lost-in-thought');
    music.play();

    console.log(PIXI)

    // Stretch to fill
    //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

    // Keep original size
    // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;

    // Maintain aspect ratio
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize too

    game.time.advancedTiming = true;

    //game.input.onDown.add(gofull, this);
    
    spheroid = new Phaser.RenderTexture(game, "spheroid")
    circle = new Phaser.Circle(0,0,200);
    //spheroid.render(circle, 50, 50)
    sphere = new Phaser.Sprite(game, 0, 0, "sphere")
    pulse = 0;

    // Particle emitter
    //emitter = game.add.emitter(game.world.centerX, game.world.centerY, 200);
    //emitter.gravity = 0;
    //emitter.makeParticles("sphere")
    //emitter.start(false, 5000, 5);

    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addCallbacks(game, function(e) {
        if (e.which == 13) {
            console.log("Focusing");
            console.log(chat)
            setTimeout(function(){
                chat.focus();
                game.input.keyboard.disabled = false;
            });
        } else if (chat.is("focus")) {
            if (e.which == 37) {
                pos = chat.caret()
                chat.caret((pos==0)?0:pos-1)
            } else if (e.which == 39) {
                pos = chat.caret()
                chat.caret(pos+1)
            }
        } else { 
            console.log("Key pressed: ", e.which) 
        }
    });

    chat.keypress(function(e) {
        if(e.keyCode == 13) {
            chatbox = chat
            msg = chatbox.val();
            if(msg != "") {
                conn.send_msg(chatbox.val());
                chatbox.val("")
            }
            setTimeout(function() {
                chatbox.blur();
                game.input.keyboard.disabled = false;
            });
        };
    });
}

/*function scale_bgs(factor) {
    for(i = 0; i<bgs.length; i++) {
        factor = factor/bgs[i].scale.x
        bgs[i].scale.x = factor
        bgs[i].scale.y = factor
        scale_x = bgs[i].x*factor
        scale_y = bgs[i].y*factor
        diff_x = scale_x-bgs[i].x
        diff_y = scale_y-bgs[i].y
        bgs[i].x += diff_x 
        bgs[i].y += diff_y 
        scale_w = bgs[i].width*1/factor
        scale_h = bgs[i].height*1/factor
        diff_h = scale_w-bgs[i].width
        diff_w = scale_h-bgs[i].height
        bgs[i].width += diff_h
        bgs[i].height += diff_w
    }
}*/

function scale_bgs(factor) {
    for(i=0; i<bgs.length; i++) {
        factor = factor/bgs[i].tileScale.x
        console.log(factor)
        bgs[i].tileScale.x = factor;
        bgs[i].tileScale.y = factor;
        x_diff = bgs[i].width * (1-1/factor)
        y_diff = bgs[i].height * (1-1/factor)
        console.log(x_diff, y_diff)
        bgs[i].tilePosition.x += x_diff/2
        bgs[i].tilePosition.y += y_diff/2

        //bgs[i].width -= x_diff
        //bgs[i].height -= y_diff
    }
}

function gofull() {
    game.scale.startFullScreen();
    game.scale.setShowAll();
    game.scale.refresh();
}


function update() {
    game.scale.setScreenSize(true)
    pulse += 0.05;
    
    function move_bg(x, y) {
        for(i = 0; i<bgs.length; i++) {
            bgs[i].x = game.camera.x;
            bgs[i].y = game.camera.y;
            if(x != 0) bgs[i].tilePosition.x += x + 1/4*x/Math.abs(x)*Math.pow(i, 2);
            if(y != 0) bgs[i].tilePosition.y += y + 1/4*y/Math.abs(y)*Math.pow(i, 2);
        }
    }

    if (!chat.is(":focus")) {
        if (cursors.up.isDown){
            game.camera.y -= 4;
            move_bg(0, 1);
        } else if (cursors.down.isDown) {
            game.camera.y += 4;
            move_bg(0, -1);
        }
        if (cursors.left.isDown) {
            game.camera.x -= 4;
            move_bg(1, 0);
        } else if (cursors.right.isDown) {
            game.camera.x += 4;
            move_bg(-1, 0);
        }
    } else {

    }
}

function render () {
    //game.debug.text('Click / Tap to go fullscreen', game.width/2-150, 16);
    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.text("FPS: " + game.time.fps, game.width-100, 16)
    game.debug.text("BGs: {x: " + bgs[0].x + ", y: " + bgs[0].y + ", w: " + bgs[0].width + ", h: " + bgs[0].height + "}", game.width-500, 30)
    
    // Messages
    for(i = messages.length-20; i<messages.length; i++) {
        if (i < 0) continue;
        offset = messages.length-i;
        offset_y = game.height-(20*offset)-15;
        game.debug.text(messages[i].User, 10, offset_y)
        game.debug.text(messages[i].Text, 100, offset_y)
    }
    //game.debug.text("Message: ", 10, game.height-10);

    // Pulsar
    size = 30
    large_circle = new Phaser.Circle(game.world.centerX, game.world.centerY, size*(4+Math.sin(pulse)))
    small_circle = new Phaser.Circle(game.world.centerX, game.world.centerY, 0.9*size*(4+Math.sin(pulse+0.2)))
    game.debug.geom(large_circle, "rgba(0,255,0,0.5)")
    game.debug.geom(small_circle, "rgba(0,0,0,0.7)")
}

var messages = [];
var names = ["Satoshi", "Bill", "Hawking", "Tegmark", "Eliezer", "Stallman", "Sagan", "deGrasse", "Norvig", "Doge", "Walrus", "Hamster", "Neumann", "Bostrom", "Kerbal"]
var name = names[Math.floor((Math.random()*names.length))]

Message = function(user, text) {
    return {User: user, Text: text}
}

var conn = {
    sock: null,

    connect: function() {
        console.log("Trying to open websocket");
        conn.sock = new WebSocket("ws://" + ws_addr);
        conn.sock.onopen = conn.on_open;
        conn.sock.onclose = conn.on_close;
        conn.sock.onmessage = conn.recv_msg;
        conn.sock.onerror = conn.on_error;
    },

    on_open: function(m) {
        messages.push(Message("System", "Connected to server"));
        conn.send_msg("Hello, I am a client!");
    },

    on_close: function(m) {
        messages.push(Message("System", "Connection was closed"));
        setTimeout(conn.connect, 5000);
    },

    on_error: function(m) {
        messages.push(Message("System", "Received an error event from the websocket, something went wrong"));
        console.log(m);
    },

    draw_msg: function(user, text) {                                      
        messages.push(Message(user, text));        
    },
                                            
    send_msg: function(msg) {
        msg = Message(name, msg);
        console.log(msg);
        conn.sock.send(JSON.stringify(msg));
    },
                                            
    recv_msg: function(msg) {
        msg = JSON.parse(msg.data);
        console.log(msg)
        console.log(msg.User + ":", msg.Text);
        conn.draw_msg(msg.User, msg.Text);
    }
}

conn.connect()
