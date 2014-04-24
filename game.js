var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    // game.load.image('dragon', 'assets/pics/cougar_dragonsun.png');
}

function create() {
    game.stage.backgroundColor = '#000';

    // Stretch to fill
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

    // Keep original size
    // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;

    // Maintain aspect ratio
    // game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.input.onDown.add(gofull, this);
}

function gofull() {
    game.scale.startFullScreen();
}

function update() {
}

var pulse = 0;
function render () {
    game.debug.text('Click / Tap to go fullscreen', 10, 16);

    // Messages
    for(i = messages.length-20; i<messages.length; i++) {
        if (i < 0) continue;
        offset = messages.length-i;
        offset_y = game.world.height-(20*offset);
        game.debug.text(messages[i].sender, 10, offset_y)
        game.debug.text(messages[i].text, 100, offset_y)
    }

    // Pulsar
    size = 60
    large_circle = new Phaser.Circle(game.world.centerX, game.world.centerY, size*(4+Math.sin(pulse)))
    small_circle = new Phaser.Circle(game.world.centerX, game.world.centerY, 0.9*size*(4+Math.sin(pulse+0.3)))
    game.debug.geom(large_circle, "rgba(0,255,0,0.5)")
    game.debug.geom(small_circle, "rgba(0,0,0,0.7)")
    pulse += 0.05;
}

var messages = [];

message = function(sender, text) {
    return {sender: sender, text: text}
}

var conn = {
    sock: null,

    connect: function() {
        conn.sock = new WebSocket("ws://127.0.0.1:8080/socket");
        conn.sock.onmessage = conn.recv_msg;
        conn.sock.onopen = conn.on_open;
    },

    on_open: function(m) {
        conn.send_msg("Hello, I am a client!");
    },

    draw_msg: function(sender, text) {                                      
        messages.push(message(sender, text));        
    },
                                            
    send_msg: function(msg) {
        console.log(msg);
        conn.sock.send(msg);
        messages.push(message("You", msg));
    },
                                            
    recv_msg: function(msg) {                    
        console.log("Server: ", msg.data);
        conn.draw_msg("Server", msg.data);             
    }
}

conn.connect()
