SH.stage = (function(enemy){

    var Fleet = SH.define({
        init:function(type, count, interval, delay){
            var s = this;
            if(type) s.type = type;
            if(count) s.count = count;
            if(interval) s.interval = interval;
            if(delay) s.delay = delay;
        },
        property:{
            type:'Fly',
            count:5,
            interval:800,
            delay:0,
            emergePoint:null,
            setEmergePoint:function(x, y){
                this.emergePoint = {x:x, y:y};
            },
            setVelocity:function(x, y){
                var s = this;
                s.vx = x;
                s.vy = y;
            },
            start:function(options){
                var s = this;
                var timer = setInterval(function(){
                    if(s.count <= 0){
                        clearInterval(timer);
                        s.done = true;
                        options.done.call(this);
                        return;
                    }
                    s.count--;
                    var airFrame = new enemy[s.type]();
                    if(s.emergePoint){
                        var x = s.emergePoint.x;
                        var y = s.emergePoint.y;
                        if(x < 0) x += SH.settings.canvasSize.width;
                        airFrame.setPosition(x, y);
                        var vx = s.vx? s.vx : 0,
                            vy = s.vy? s.vy : airFrame.speed;
                            airFrame.setVelocity(vx, vy);
                    }
                    if(s.isLast){
                        airFrame.onDestroy = SH.stage.clear;
                    }
                    options.load.call(this, airFrame);
                }, s.interval);
            }
        }
    });
    var Wave = SH.define({
        init:function(fleet, duration){
            var s = this;
            s.fleet = [];
            if(fleet) s.addFleet(fleet);
            if(duration) s.duration = duration;
        },
        property:{
            addFleet:function(fleet){
                this.fleet.push(fleet);
            },
            start:function(options){
                var s = this;
                s.done = options.done;
                for(var i=0; i< s.fleet.length;i++){
                    var fleet = s.fleet[i];
                    setTimeout(function(){
                        fleet.start({
                            load:options.loadEnemy,
                            done:function(){
                                for(var i=0; i< s.fleet.length;i++){
                                    if(!s.fleet[i].done) return;
                                }
                                s.callDone();
                                if(s.done){
                                    if(s.doneTimer) clearTimeout(s.doneTimer);
                                    s.doneTimer = null;
                                    s.done.call(s);
                                    s.done = null;
                                }
                            }
                        });
                    }, fleet.delay);
                }
                if(s.duration){
                    s.doneTimer = setTimeout(function(){
                        s.doneTimer = null;
                        s.callDone();
                    }, s.duration);
                }
            },
            callDone:function(){
                var s = this;
                if(s.doneTimer) {
                    clearTimeout(s.doneTimer);
                    s.doneTimer = null;
                }
                if(s.done){
                    s.done.call(s);
                    s.done = null;
                }
            }
        }
    });
    var Stage = SH.define({
        init:function(){
            this.wave = [];
        },
        property:{
            addWave:function(wave){
                this.wave.push(wave);
            },
            nextWave:function(){
                return this.wave.shift();
            }
        }
    });
    function repeat(func, count){
        for(var i=0;i<count;i++){
            func.call(this, i, i%2==0);
        }
    }
    var s = [];
    s[0] = (function(){
        var stage = new Stage();

        function swordRain(emergeY, dense){
            if(!emergeY) emergeY = 0;
            var count = 10;
            if(dense) count *= dense;
            repeat(function(i, even){
                var fleet = new Fleet('SwordFish', 1);
                var x = SH.util.randomInt(0, 700),
                    y = emergeY;
                if(even) x *= -1;
                fleet.setEmergePoint(x, y);
                stage.addWave(new Wave(fleet, 300));
            }, count);
        }
        function crossFly(delay, emergeY){
            if(!emergeY) emergeY = 0;
            repeat(function(i, even){
                var fleet = new Fleet(null,null,null,delay);
                var x = 150, y = emergeY,
                    vx = 200, vy = 200;
                if(even){
                    x *= -1;
                    vx *= -1;
                }
                fleet.setEmergePoint(x, y);
                fleet.setVelocity(vx, vy);
                stage.addWave(new Wave(fleet, 100));
            }, 3);
        }
        function beetleLine(emergeY){
            if(!emergeY) emergeY = 0;
            repeat(function(i, even){
                var fleet = new Fleet('Beetle', 20, 300);
                var x = SH.util.randomInt(0, 700);
                if(even) x *= -1;
                fleet.setEmergePoint(x, emergeY);
                stage.addWave(new Wave(fleet, 1500));
            }, 4);
        }

        function antSpray(emergePoint, delay){
            repeat(function(i, even){
                var fleet = new Fleet('Ant', 8, 200, delay);
                var x = 500, y = 0;
                if(emergePoint){
                    x = emergePoint.x;
                    y = emergePoint.y;
                }
                fleet.setEmergePoint(x, y);
                var vx = SH.util.randomInt(0, 500),
                    vy = 300;
                if(even) vx *= -1;
                fleet.setVelocity(vx, vy)
                stage.addWave(new Wave(fleet, 10));
            }, 8);
        }



        repeat(function(i, even){
            var fleet = new Fleet('Fly', 3, 200);
            var x = 100, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 2);

        repeat(function(i, even){
            var fleet = new Fleet('Fly', 3, 200);
            var x = 400, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 2);


        repeat(function(i, even){
            var fleet = new Fleet('ButterFly');
            var x = 200, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 1000));
        }, 2);

        beetleLine();

        repeat(function(i, even){
            var fleet = new Fleet('DragonFly', 3, 5000);
            var x = 250, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 2000));
        }, 3);

        repeat(function(i, even){
            var fleet = new Fleet('Fly', 5, 150);
            var x = 300, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 2);

        repeat(function(i, even){
            var fleet = new Fleet('V', 3, 500);
            var x = 550, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);

        crossFly();
        repeat(function(i, even){
            var fleet = new Fleet('Sloppy', 3);
            var x = 100, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);


        repeat(function(i, even){
            var fleet = new Fleet('Fly', 3, 200);
            var x = 100, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 100));
        }, 3);

        swordRain();



        repeat(function(i, even){
            var fleet = new Fleet('Beetle', 4, 300);
            var x = 400, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);

        beetleLine();


        crossFly();

        swordRain();

        repeat(function(i, even){
            var fleet = new Fleet('ButterFly');
            var x = 200, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);

        repeat(function(i, even){
            var fleet = new Fleet('Yama', 2, 2400);
            var x = 500, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 400));
        }, 3);

        swordRain();

        repeat(function(i, even){
            var fleet = new Fleet('M',2);
            var x = 400, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);

        crossFly();
        crossFly();
        repeat(function(i, even){
            var fleet = new Fleet('JYU', 10, 1000);
            var x = 300, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet), 1000);
        }, 2);
        crossFly();
        crossFly();

        repeat(function(i, even){
            var fleet = new Fleet('Y', 10, 200);
            var x = 200, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);

        beetleLine();
        swordRain();


        crossFly(2000);
        crossFly(4000);
        crossFly(5000);
        crossFly(12000);
        crossFly(20000);
        crossFly(12000);



        antSpray({x:400, y:0}, 5000);
        antSpray({x:400, y:0}, 15000);
        antSpray({x:400, y:0}, 20000);
        repeat(function(i, even){
            var fleet = new Fleet('Cutter', 3, 1000);
            var x = 100, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 5000));
        }, 3);

        crossFly();
        crossFly();
        crossFly();
        crossFly();

        repeat(function(i, even){
            var fleet = new Fleet('T',10, 1000);
            var x = 650, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 500));
        }, 3);

        swordRain();
        swordRain();
        swordRain();
        swordRain();

        repeat(function(i, even){
            var fleet = new Fleet('W', 10, 400);
            var x = 400, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 1000));
        }, 3);

        repeat(function(i, even){
            var fleet = new Fleet('DragonFly', 3, 50000);
            var x = 350, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 300));
        }, 5);



        repeat(function(i, even){
            var fleet = new Fleet('Saw');
            var x = 300, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 3);

        swordRain();
        swordRain();




        antSpray({x:400, y:140}, 3000);
        antSpray({x:400, y:140}, 5000);
        antSpray({x:400, y:140}, 10000);
        var bigAnt = new Fleet('BigAnt', 1, 200);
        bigAnt.setEmergePoint(400, 0);
        stage.addWave(new Wave(bigAnt, 300000));

        repeat(function(i, even){
            var fleet = new Fleet('DragonFly', 2, 100);
            var x = 350, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 150000));
        }, 2);


        crossFly(5000);

        swordRain();
        swordRain();
        swordRain();

        repeat(function(i, even){
            var fleet = new Fleet('W');
            var x = 400, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 5);


        repeat(function(i, even){
            var fleet = new Fleet('Sloppy', 3);
            var x = SH.util.randomInt(0, 400), y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 55000));
        }, 5);


        var jumboJet = new Fleet('JumboJet', 1, 400, 1000);
        jumboJet.setEmergePoint(500, 0);
        jumboJet.isLast = true;
        stage.addWave(new Wave(jumboJet, 300000));



        var emergeY = 200;


        crossFly(200, emergeY);
        crossFly(300, emergeY);
        crossFly(400, emergeY);
        crossFly(1000, emergeY);
        crossFly(2000, emergeY);
        crossFly(3000, emergeY);



        repeat(function(){
            swordRain(emergeY, 2);
        },3);

        antSpray({x:500, y:140}, 3000);
        antSpray({x:500, y:140}, 5000);
        antSpray({x:500, y:140}, 10000);
        antSpray({x:500, y:140}, 15000);
        antSpray({x:500, y:140}, 20000);
        antSpray({x:500, y:140}, 25000);
        antSpray({x:500, y:140}, 30000);



        repeat(function(i, even){
            var fleet = new Fleet('Sloppy', 1);
            var x = SH.util.randomInt(0, 400), y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 5000));
        }, 5);



        repeat(function(){
            swordRain(emergeY, 5);
        },10);

        crossFly(200, emergeY);
        crossFly(300, emergeY);
        crossFly(400, emergeY);
        crossFly(1000, emergeY);

        repeat(function(i, even){
            var fleet = new Fleet('DragonFly', 2, 100);
            var x = 350, y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 150000));
        }, 5);

        repeat(function(){
            beetleLine(emergeY);
        }, 5);

        antSpray({x:400, y:140}, 3000);
        antSpray({x:400, y:140}, 5000);
        antSpray({x:400, y:140}, 10000);

        repeat(function(i, even){
            var fleet = new Fleet('W');
            var x = 400, y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 5);


        repeat(function(i, even){
            var fleet = new Fleet('Sloppy', 3);
            var x = SH.util.randomInt(0, 400), y = 0;
            if(even)x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet, 55000));
        }, 5);

        repeat(function(i, even){
            var fleet = new Fleet('Yama', 2, 2400);
            var x = SH.util.randomInt(0, 800), y = 0;
            if(even) x *= -1;
            fleet.setEmergePoint(x, y);
            stage.addWave(new Wave(fleet));
        }, 5);

        repeat(function(){
            swordRain(emergeY);
        },10);

        return stage;
    })();

    return s;
})(SH.drawable.enemy);