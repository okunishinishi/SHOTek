SH.layer = (function(){
    var Layer = SH.define({
        property:{
            size:{width:0, height:0},
            setSize:function(size){
                var s = this;
                s.size = size;
                if(s.resize)s.resize(size);
            },
            isOut:function(drawable){
                return drawable.x < 0
                    || drawable.x > this.size.width
                    || drawable.y < 0
                    || drawable.y > this.size.height;
            }
        }
    });

    return {
        Sky:SH.define({
            prototype:Layer,
            init:function () {
                var s = this;
                s.star = [];
            },
            property:{
                resize:function (size) {
                    var s = this;
                    var square = size.width * size.height;
                    var count = Math.floor(square / 30000);
                    while (s.star.length != count) {
                        if (s.star.length > count) {
                            s.star.shift();
                        } else {
                            s.star.push(new SH.drawable.sky.Star());
                        }
                    }
                    s.shuffle();
                },
                shuffle:function () {
                    var s = this;
                    for (var i = 0; i < s.star.length; i++) {
                        var star = s.star[i];
                        star.setPosition(
                            Math.random() * s.size.width,
                            Math.random() * s.size.height
                        );
                        star.color = SH.util.hsv2rgbaString(SH.util.randomInt(0, 360), 30, 50);
                        var distance = SH.util.randomInt(1, 3);
                        star.setVelocity(0, 50 / distance);
                        star.radius = Math.ceil(2 / distance);
                    }
                },
                draw:function (ctx) {
                    var s = this;
                    ctx.save();
                    if(s.clear && ctx.drawCount % 30 < 15){
                        ctx.fillStyle = 'rgba(100,100,80,0.5)';
                        ctx.fillRect(0,0, s.size.width, s.size.height);
                    }
                    for (var i = 0; i < s.star.length; i++) {
                        var star = s.star[i];
                        star.move();
                        if (star.y > s.size.height) star.y = 0;
                        star.draw(ctx);
                    }
                    ctx.restore();
                }
            }

        }),
        Player:SH.define({
            prototype:Layer,
            init:function () {
                var s = this;
                var player = SH.drawable.player;
                s.shell = [];
                s.canonCharger = new player.CanonCharger();
                s.bombCounter = new player.BombCounter();
                s.load();
            },
            property:{
                load:function(){
                    var s = this;
                    s.aircraft = new SH.drawable.player.Aircraft();
                    s.aircraft.onDestroy = function(){
                        s.stopMachineGun();
                    }
                },
                draw:function (ctx) {
                    var s = this;
                    if(s.gameOverEffect){
                        ctx.fillStyle = SH.util.rgba2string(50,0,0,0);
                        ctx.fillRect(0,0, s.size.width, s.size.height);
                    }
                    if (!s.canonCharger.isFull) {
                        s.canonCharger.charge();
                    }
                    s.canonCharger.draw(ctx);
                    s.bombCounter.draw(ctx);

                    if (s.shell[0] && s.isOut(s.shell[0])) {
                        s.shell.shift();
                    }
                    for (var i = 0; i < s.shell.length; i++) {
                        var shell = s.shell[i];
                        shell.move();
                        shell.draw(ctx);
                    }

                    s.aircraft.draw(ctx);
                },
                startMachineGun:function () {
                    var s = this;
                    function newShell(angle){
                        var shell = new SH.drawable.player.Shell();
                        shell.setPosition(s.aircraft.x, s.aircraft.y - s.aircraft.height / 2);
                        if(angle){
                            var v = shell.vy;
                            var r = angle + Math.PI / 2;
                            shell.setVelocity(v * Math.cos(r), v * Math.sin(r));
                        }
                        return shell;
                    }
                    s.fireTimer = setInterval(function () {
                        s.shell.push(newShell());
                        if(s.aircraft.grade > 5){
                            var angle = Math.PI /8;
                            s.shell.push(newShell(angle));
                            s.shell.push(newShell(-angle));
                        }
                        if(s.aircraft.grade > 30){
                            var angle = Math.PI /4;
                            s.shell.push(newShell(angle));
                            s.shell.push(newShell(-angle));
                        }
                        if(s.aircraft.grade > 100){
                            var angle = Math.PI /8 * 3;
                            s.shell.push(newShell(angle));
                            s.shell.push(newShell(-angle));
                        }

                    }, SH.settings.player.shell.interval);
                },
                stopMachineGun:function () {
                    clearInterval(this.fireTimer);
                },
                fireCanon:function () {
                    var s = this;
                    var rate = s.canonCharger.rate;
                    if(s.aircraft.grade > 50) rate *= 2;
                    if(s.aircraft.grade > 150) rate *= 2;
                    var canonShell = new SH.drawable.player.CanonShell(rate);
                    canonShell.setPosition(s.aircraft.x, s.aircraft.y - s.aircraft.height / 2);
                    s.shell.push(canonShell);
                    s.canonCharger.reset();
                },
                releaseBomb:function(){
                    var s = this;
                    var bomb = s.bombCounter.release();
                    if(!bomb) return;
                    bomb.setPosition(s.aircraft.x, s.aircraft.y - s.aircraft.height / 2);
                    if(s.aircraft.grade > 50) bomb.expandRage *= 2;
                    s.shell.push(bomb);
                },
                resize:function (size) {
                    var s = this;
                    var bottom = size.height;
                    s.aircraft.setPosition(s.size.width / 2, s.size.height - 100);
                    s.canonCharger.setPosition(30, bottom - (s.canonCharger.height / 2 + 20));
                    s.bombCounter.setPosition(50, bottom - (s.bombCounter.height / 2 + 20));
                },
                gameover:function(callback){
                    var s = this;
                    s.gameOverEffect = true;
                    setTimeout(function(){
                        s.gameOverEffect = false;
                        callback.call(s);
                    }, 1000);
                }
            }
        }),
        Enemy:SH.define({
            prototype:Layer,
            init:function () {
                var s = this;
                s.airframe = {};
            },
            property:{
                load:function (airframe) {
                    var s = this;
                    var type = airframe.type;
                    if(!s.airframe[type]) {
                        s.airframe[type] = [];
                        airframe.preRender(document.createElement('canvas'));
                        airframe.preRender(document.createElement('canvas'), true);
                    }
                    s.airframe[type].push(airframe);
                },
                draw:function (ctx) {
                    var s = this;
                    for(var type in s.airframe){
                        if(!s.airframe.hasOwnProperty(type)) continue;
                        var queue = s.airframe[type];
                        if (queue.length > 0) {
                            var top = queue[0];
                            if(s.isOut(top) || !top.isAlive()){
                                queue.shift();
                            }

                        }
                        for (var i = 0; i < queue.length; i++) {
                            var airframe = queue[i];
                            if(!airframe.isAlive()) continue;
                            airframe.move();
                            airframe.draw(ctx);
                        }
                    }
                },
                findAirFrame:function(x, y, margin){
                    var s = this;
                    for(var type in s.airframe){
                        if(!s.airframe.hasOwnProperty(type)) continue;
                        var queue = s.airframe[type];
                        for (var i = 0; i < queue.length; i++) {
                            var airframe = queue[i];
                            if(!airframe.isAlive()) continue;
                            if(airframe.contains(x, y, margin)) return airframe;
                        }
                    }
                    return null;
                }
            }
        })
    };
})();