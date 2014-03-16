SH.drawable = (function(){
    var Drawable = SH.define({
        //prototype for all drawable.
        property:{
            setColor:function(r,g,b){
                this.color = SH.util.rgba2string(r,g,b);
            },
            drawLines:function(ctx, base, point, isSymmetric){
                //base  [baseX, baseY]
                //point [x1,y1,x2,y2....]
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.moveTo.apply(ctx, base);
                for(var i=0;i<point.length;i+=2){
                    ctx.lineTo(
                        base[0] + point[i],
                        base[1] + point[i+1]
                    );
                }
                if(isSymmetric){
                    for(var j=point.length-2;j>=0;j-=2){
                        ctx.lineTo(
                            base[0] - point[j],
                            base[1] + point[j+1]
                        )
                    }
                }
                ctx.closePath();
            },
            drawCircle:function(ctx, radius, x, y){
                var s = this;
                if(!x) x = s.x;
                if(!y) y = s.y;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2, true);
                ctx.closePath();

            }
        }
    });
    var Movable = SH.define({
        prototype:Drawable,
        property:{
            x:0,y:0,vx:0,vy:0,
            getPosition:function(){
                var s = this;
                return {x:s.x, y:s.y}
            },
            setPosition:function(x, y){
                this.x = x;
                this.y = y;
            },
            setVelocity:function(vx, vy){
                //pix per second
                var s = this;
                s.vx = vx;
                s.vy = vy;
                var interval = SH.settings.interval;
                s.perMove = {
                    x: vx * interval / 1000,
                    y: vy * interval / 1000
                }
            },
            move:function(){
                var s = this;
                s.x += s.perMove.x;
                s.y += s.perMove.y;
            },
            isOut:function(){
                var s = this;
                return s.x < 0
                    || s.y < 0
                    || s.x > SH.settings.canvasSize.width
                    || s.y > SH.settings.canvasSize.height
            }
        }
    });
    var Hittable = SH.define({
        prototype:Movable,
        property:{
            power:0,
            isAlive:function(){
                return this.power > 0;
            },
            hit:function(power){
                var s = this;
                if(s.onRecover) return;
                s.power -= power;
                s._damage();
                if(!s.isAlive()){
                    setTimeout(function(){
                        s._destroy();
                        if(s.destroy) s.destroy();
                    },100);
                }
            },
            _damage:function(){
                var s = this;
                s.onDamage = true;
                setTimeout(function(){
                    s.onDamage = false;
                }, 100);
                s.onRecover = true;
                if(!s.recoverDuration)s.recoverDuration = 100;
                setTimeout(function(){
                    s.onRecover = false;
                }, s.recoverDuration);
            },
            _destroy:function(){
                var s = this;
                s.power = 0;
                s.setVelocity(0, 0);
                s.setPosition(-100, -100);
                s.draw = s._doNothing;
            },
            _doNothing:function(){
                return false;
            }
        }
    });
    var d = {};
    d.sky = (function(){
        return {
            Star:SH.define({
                init:function(){
                    var s = this;
                    s.radius = 4;
                    s.color = 'rgba(255,255,255,1)';
                },
                property:{
                    draw:function(ctx){
                        var s = this;
                        ctx.fillStyle = s.color;
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                },
                prototype:Movable
            })
        }
    })();
    d.player = (function(){
        return {
            Aircraft:SH.define({
                prototype:Hittable,
                init:function(){
                    var s = this;
                    s.setColor(255,255,255);
                    if(!s.img) {
                        var canvas = document.createElement('canvas');
                        canvas.width = s.width;
                        canvas.height = s.height;
                        var ctx = canvas.getContext('2d');
                            ctx.save();
                            ctx.strokeStyle = s.color;
                            ctx.lineWidth = 3;
                            s.drawLines(ctx, [s.width/2, 0], s.vertex, true);
                            ctx.stroke();
                            ctx.restore();
                        s.img = canvas;
                    }
                    s.radius = 30;
                    s.damageColor = SH.util.rgba2string(230,0,0,0.8);
                },
                property:{
                    grade:1,
                    width:50,
                    height:50,
                    power:5,
                    upgrade:function(){
                        this.grade += 1;
                    },
                    draw:function(ctx){
                        var s = this;
                        if(s.onDamage){
                            s.fillStyle = s.damageColor;
                            s.drawLines(ctx, [s.x, s.y - s.height / 2], s.vertex, true);
                            ctx.fill();
                        }
                        ctx.drawImage(s.img, s.x - s.width / 2, s.y - s.height / 2);

                    },
                    destroy:function(){
                        var s = this;
                        if(s.onDestroy)s.onDestroy.call(s);
                    },
                    vertex:[5, 10,
                        4, 14,
                        17, 13,
                        25, 40,
                        4, 30,
                        3, 46,
                        9, 50,
                        0, 45]
                }
            }),
            Shell:SH.define({
                prototype:Hittable,
                init:function(){
                    var s = this;
                    s.setColor(235,235,100);
                    s.setVelocity(0, -SH.settings.player.shell.speed);
                    s.radius = s.width;
                },
                property:{
                    power:3,
                    width:5,
                    height:15,
                    draw:function(ctx){
                        ctx.save();
                        var s = this;
                        ctx.strokeStyle = s.color;
                        ctx.lineWidth = 5;
                        s.drawLines(ctx, [s.x, s.y],
                            [0, s.height])
                        ;
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }),
            CanonShell:SH.define({
                prototype:Hittable,
                init:function(rate){
                    if(!rate) rate = 0.5;
                    var s = this;
                    s.setColor(245,100,0);
                    s.radius = Math.floor(20 * rate);
                    s.power = Math.floor(10 * rate);
                    s.setVelocity(0, -SH.settings.player.canon.speed);
                },
                property:{
                    radius:3,
                    draw:function(ctx){
                        var s = this;
                        ctx.beginPath();
                        ctx.fillStyle = s.color;
                        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }),
            CanonCharger:SH.define({
                prototype:Movable,
                init:function(){
                    var s = this;
                    s.width = 10;
                    s.height = 60;
                    s.setColor(200,200,100);
                    s.chargeColor = SH.util.rgba2string(200,100,0);
                    s.fullChargeColor = SH.util.rgba2string(225,130,0);
                    s.rate = 0.5;
                },
                property:{
                    draw:function(ctx){
                        var s = this;
                        ctx.fillStyle = s.color;

                        var left = s.x - s.width / 2;
                        var top = s.y - s.height / 2;

                        ctx.fillRect(left, top,
                            s.width, s.height);

                        if(s.isFull && ctx.drawCount % 100 < 50){
                            ctx.fillStyle = s.fullChargeColor;
                        } else {
                            ctx.fillStyle = s.chargeColor;
                        }
                        ctx.fillRect(left, top + s.height * (1 - s.rate),
                            s.width, s.height * s.rate);
                    },
                    charge:function(){
                        var s = this;
                        s.rate += SH.settings.player.canon.chargeRate;
                        if(s.rate > 1){
                            s.rate = 1;
                            s.isFull = true;
                        }
                    },
                    reset:function(){
                        var s = this;
                        s.isFull = false;
                        s.rate = 0;
                    }
                }
            }),
            Bomb:SH.define({
                prototype:Hittable,
                init:function(){
                    var s = this;
                    s.setVelocity(0, -SH.settings.player.bomb.speed);
                    s.hilightColor = SH.util.rgba2string(255,255,200,0.2);
                    s.explodeColor = SH.util.rgba2string(255,255,200,0.5);
                    s.status = null;
                    s.radius = 8;
                    s.power = 0;
                    s.expandRage = 4;
                },
                property:{
                    preRender:function(canvas){
                        var s = this;
                        canvas.width = s.radius * 2;
                        canvas.height = s.radius * 2;

                        var ctx = canvas.getContext('2d');
                        ctx.strokeStyle = SH.util.rgba2string(200,200,200);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        var vertex = 16;
                        for(var i=0; i<vertex;i++){
                            var r = Math.PI * 2 / vertex * i;
                            var rate = i%2==0?1:0.5;
                            var x = s.radius + Math.cos(r) * s.radius * rate,
                                y = s.radius + Math.sin(r) * s.radius * rate;
                            if(i==0){
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                        ctx.closePath();
                        ctx.stroke();
                        s.__proto__.img = canvas;

                    },
                    move:function(){
                       var s = this;
                        if(s.y > SH.settings.canvasSize.height * 0.3){
                            s.y += s.perMove.y;
                        } else {
                            if(!s.expandTimer){
                                s.expandTimer = setTimeout(function(){
                                    s.expand.call(s);
                                    s.expandTimer = null;
                                }, 100);
                            }
                        }
                    },
                    contains:function(){
                        return false;
                    },
                    expand:function(){
                        var s = this;
                        s.power = 100;
                        s.status =  'expand';
                        setTimeout(function(){
                            s.explode.call(s)
                        }, SH.settings.player.bomb.expandDuration);
                    },
                    explode:function(){
                        var s = this;
                        s.status =  'explode';
                        setTimeout(function(){
                            s.hit(100);
                        }, SH.settings.player.bomb.explodeDuration);
                    },
                    destroy:function(){
                        var s = this;
                        s.status =  'destroy';
                    },
                    draw:function(ctx){
                        ctx.save();
                        var s = this;

                        ctx.drawImage(s.img, s.x - s.img.width / 2, s.y - s.img.height / 2);

                        switch(s.status){
                            case 'move':
                                if(ctx.drawCount % 80 < 40){
                                    ctx.fillStyle = s.hilightColor;
                                    s.drawCircle(ctx, s.radius * 0.6);
                                    ctx.fill();
                                }
                                break;
                            case 'expand':
                                s.radius += s.expandRage;
                                ctx.fillStyle = s.hilightColor;
                                s.drawCircle(ctx, s.radius * 0.6);
                                ctx.fill();
                                break;
                            case 'explode':
                                ctx.fillStyle = ctx.drawCount % 20 < 10?s.hilightColor: s.explodeColor;
                                s.drawCircle(ctx, s.radius * 0.6);
                                ctx.fill();
                                break;
                        }

                        ctx.restore();
                    }
                }
            }),
            BombCounter:SH.define({
                prototype:Movable,
                init:function(){
                    var s = this;
                    s.bomb = [];
                    for(var i=0; i<3; i++){
                        s.load();
                    }
                },
                property:{
                    width:20,
                    height:80,
                    draw:function(ctx){
                        var s = this;
                        ctx.fillStyle = SH.util.rgba2string(220,20,20);
                        for(var i=0; i< s.bomb.length; i++){
                            var bomb = s.bomb[i];
                            bomb.setPosition(s.x, s.y + s.height / 2- (bomb.img.height + 5) * (i + 0.5));
                            bomb.draw(ctx);
                        }
                    },
                    load:function(){
                        var s = this;
                        var bomb = new SH.drawable.player.Bomb();
                        if(!bomb.img){
                            var canvas = document.createElement('canvas');
                            bomb.preRender(canvas);
                        }
                        s.bomb.push(bomb);
                    },
                    release:function(){
                        var s = this;
                        return s.bomb.pop();
                    }
                }
            })
        }
    })();
    d.enemy = (function(){

        function color(hue){
            return SH.util.hsv2rgbaString(hue, 100, 95);
        }
        function line(width, color){
            return {width:width, color:color}
        }

        var AirFrame = SH.define({
            prototype:Hittable,
            property:{
                power:0,
                speed:0,
                line:line(0,""),
                vertex:[],
                hitArea:null,
                preRender:function(canvas, hitImg){
                    var s = this;
                    var w = 0, h = 0;
                    for(var i=0;i< s.vertex.length;i+=2){
                        var x = s.vertex[i];
                        if(x * 2 > w) w = x * 2;
                        var y = Math.abs(s.vertex[i+1]);
                        if(y> h) h = y;
                    }
                    canvas.width = w += s.line.width * 2;
                    canvas.height = h += s.line.width * 2;
                    var ctx = canvas.getContext('2d');
                    ctx.strokeStyle = hitImg?SH.util.hsv2rgbaString(0, 100, 70):s.line.color;
                    ctx.lineWidth = s.line.width;
                    s.drawLines(ctx,
                        [w/2, h],
                        s.vertex, true);
                    ctx.stroke();

                    if(hitImg){
                        s.__proto__.hitImg = canvas;
                    } else {
                        s.__proto__.img = canvas;
                    }
                },
                draw:function(ctx){
                    ctx.save();
                    var s = this;
                    var img = s.onDamage? s.hitImg: s.img;
                    ctx.drawImage(img, s.x - img.width / 2, s.y - img.height / 2);
                    ctx.restore();

                },
                contains:function(x, y, margin){
                    var s = this;
                    if(!s.hitArea) return false;
                    var rx = x - s.x, ry = y - s.y;
                    if(s.hitArea instanceof Array){
                        for(var i=0; i< s.hitArea.length;i++){
                            if(s.hitArea[i].contains(rx, ry, margin)){
                                return true;
                            }
                        }
                    } else {
                       return s.hitArea.contains(rx, ry, margin);
                    }
                    return false;
                },
                destroy:function(){
                    var s = this;
                    if(s.onDestroy)s.onDestroy.call(s);
                }
            }
        });
        function Enemy(property){
            return SH.define({
                prototype:AirFrame,
                property:property
            });
        }


        var enemy = {
            Ant:Enemy({
                power:1,
                speed:300,
                line:line(2, color(240)),
                hitArea:new SH.Rect(-5, -5, 10, 10),
                vertex:[
                    2,0,
                    2,-3,
                    1,-3,
                    1,-6,
                    2,-6,
                    2,-9,
                    1,-9,
                    0,-10
                ]
            }),
            Fly:Enemy({
                power:1,
                speed:300,
                line:line(3,color(40)),
                hitArea:new SH.Rect(-8,-8,16,16),
                vertex:[
                    5, -5,
                    8, -10,
                    3, -15,
                    2, -13
                ]
            }),
            Beetle:Enemy({
                power:2,
                speed:100,
                line:line(3,color(70)),
                vertex:[
                    5, 0,
                    5, -5,
                    10, -5,
                    10, -20,
                    5, -20,
                    2, -15,
                    0, -15
                ],
                hitArea:new SH.Rect(-10, -10, 20, 20)
            }),
            ButterFly:Enemy({
                speed:150,
                power:5,
                line:line(4,color(100)),
                hitArea:new SH.Rect(-20, -20, 40, 40),
                vertex:[
                    0, -10,
                    5, -8,
                    10, -0,
                    15, -15,
                    20, -40,
                    5, -30,
                    0, -40
                ]
            }),
            DragonFly:Enemy({
                speed:40,
                power:12,
                line:line(5,color(130)),
                hitArea:[
                    new SH.Rect(-20, -75, 40, 150),
                    new SH.Rect(-75, 10, 150, 30)
                ],
                vertex:[
                    15, 0,
                    15, -10,
                    8, -10,
                    8, -35,
                    60, -35,
                    60, -50,
                    8, -50,
                    8, -60,
                    60, -60,
                    60, -75,
                    8, -75,
                    8, -150
                ],
                move:function(){
                    var s = this;
                    if(!s.ready && s.y > 100){
                        s.ready = true;
                        s.setVelocity(0, s.speed * 10);
                    }
                    s.y += s.perMove.y;
                }
            }),
            SwordFish:Enemy({
                speed:1000,
                power:2,
                hitArea:new SH.Rect(-3, -75, 6, 150),
                line:line(2,color(160)),
                vertex:[
                    1,-2,
                    2,-50,
                    2,-51,
                    3,-51,
                    2,-80,
                    1,-130,
                    0,-150
                ]
            }),
            Sloppy:Enemy({
                speed:50,
                power:20,
                hitArea:new SH.Rect(-75, 10, 150, 6),
                line:line(2,color(190)),
                vertex:[
                    2,0,
                    2,-2,
                    75,-4,
                    80,-5,
                    1,-4,
                    0,-3
                ]
            }),
            V:Enemy({
                speed:300,
                power:3,
                hitArea:new SH.Rect(-40, -50, 80, 100),
                line:line(3,color(220)),
                vertex:[
                    10, -10,
                    48, -80,
                    48, -90,
                    10, -30,
                    0, -20
                ]
            }),
            T:Enemy({
                speed:200,
                power:10,
                hitArea:[
                    new SH.Rect(-50, -50, 100, 20),
                    new SH.Rect(-10, -40, 20, 100)
                ],
                line:line(3,color(270)),
                vertex:[
                    10, 0,
                    10, -70,
                    48, -70,
                    48, -90,
                    0, -90
                ],
                move:function(){
                    var s = this;
                    if(s.y  > 100){
                        if(!s.perMove.x){
                            s.perMove.x = 0.4;
                            if(Math.random() > 0.5) s.perMove.x *= -1;
                        }
                        s.perMove.x *= 1.02;
                        s.x += s.perMove.x;
                    }
                    s.y += s.perMove.y;
                }
            }),
            W:Enemy({
                speed:150,
                power:3,
                hitArea:new SH.Rect(-50, -50, 100, 100),
                line:line(3,color(310)),
                vertex:[
                    25, -40,
                    48, 4,
                    35, -80,
                    0, -55
                ]
            }),
            Y:Enemy({
                speed:500,
                power:2,
                hitArea:[
                    new SH.Rect(-50,-50,100,50),
                    new SH.Rect(-25,-25,50,50)
                ],
                line:line(3,color(340)),
                vertex:[
                    10,0,
                    10,-20,
                    45,-80,
                    45,-98,
                    30,-98,
                    2,-80,
                    0,-80
                ],
                move:function(){
                    var s = this;
                    if(!s.ready && s.y > 200){
                        s.ready = true;
                        s.isReverse = Math.random() > 0.5;
                    }
                    if(s.ready){
                        var vx = s.perMove.y;
                        if(s.isReverse) vx *= -1;
                        s.x += vx;
                    }
                    s.y += s.perMove.y;
                }
            }),
            Yama:Enemy({
                speed:2,
                power:30,
                hitArea:new SH.Rect(-50,-50,100,100),
                line:line(4,color(25,100,100)),
                vertex:[
                    10,0,
                    10,-78,
                    33,-78,
                    33,-20,
                    48,-20,
                    48,-98,
                    0,-98
                ],
                move:function(){
                    var s = this;
                    s.perMove.y *= 1.02;
                    s.y += s.perMove.y;
                }
            }),
            JYU:Enemy({
                speed:300,
                power:10,
                hitArea:[
                    new SH.Rect(-10,-40,20,90),
                    new SH.Rect(-45,-20,90,20)
                ],
                line:line(4,color(55)),
                vertex:[
                    10,0,
                    10,-40,
                    40,-40,
                    40,-60,
                    10,-60,
                    10,-90,
                    0,-90
                ],
                move:function(){
                    var s = this;
                    if(!s.ready && s.y > 200){
                        s.ready = true;
                        s.setVelocity(0, s.speed / 5);
                    }
                    s.y += s.perMove.y;
                }
            }),
            M:Enemy({
                speed:300,
                power:10,
                hitArea:new SH.Rect(-50,-50,100,100),
                line:line(4,color(85)),
                vertex:[
                    30,-10,
                    48,-90,
                    40,-90,
                    20,-20,
                    8,-25,
                    4,-98,
                    0,-98
                ],
                move:function(){
                    var s = this;
                    if(s.ready){
                        s.y -= s.perMove.y;
                    } else {
                        if(s.y > 400){
                            s.ready = true;
                        }
                        s.y += s.perMove.y;
                    }
                }
            }),
            Cutter:Enemy({
                speed:100,
                power:20,
                hitArea:new SH.Rect(-60,-50,120,100),
                line:line(5,color(115)),
                vertex:[
                    10,-10,
                    20,0,
                    30,-10,
                    40,0,
                    50,-10,
                    60,0,
                    70,-10,
                    80,0,
                    90,-10,
                    20,-45,
                    90,-90,
                    80,-80,
                    70,-90,
                    60,-80,
                    50,-90,
                    40,-80,
                    30,-90,
                    20,-80,
                    10,-90,
                    0,-80
                ],
                move:function(){
                    var s = this;
                    if(s.ready){
                        s.x += s.perMove.x;
                    } else {
                        if(s.y > 200){
                            s.ready = true;
                        }
                    }
                    s.y += s.perMove.y;
                }
            }),
            Saw:Enemy({
                speed:200,
                power:20,
                hitArea:new SH.Rect(-50,-100,100,150),
                line:line(5,color(145)),
                vertex:[
                    0,-5,
                    45,0,
                    40,-5,
                    45,-10,
                    40,-15,
                    45,-20,
                    40,-25,
                    45,-30,
                    40,-35,
                    45,-40,
                    40,-45,
                    45,-50,
                    40,-55,
                    45,-60,
                    40,-65,
                    45,-70,
                    40,-75,
                    45,-80,
                    40,-85,
                    45,-90,
                    0,-70,
                    0,-105
                ]
            }),
            BigAnt:Enemy({
                speed:40,
                power:300,
                hitArea:[
                    new SH.Rect(-200, -160, 400, 340)
                ],
                line:line(10,color(175)),
                vertex:[
                    0,-10,
                    190,-10,
                    190,-180,
                    0,-180,
                    0,-210,
                    190,-210,
                    190,-380,
                    0,-380,
                    0,-390
                ],
                move:function(){
                    var s = this;
                    if(s.y < 150){
                        s.y += s.perMove.y;
                    }
                }
            }),
            JumboJet:Enemy({
                speed:30,
                power:500,
                hitArea:[
                    new SH.Rect( -450,-280, 900,480),
                    new SH.Rect( -80, 120, 160,100)
                ],
                hue:215,
                lineWidth:150,
                line:line(150,color(215)),
                vertex:[
                    400,-180,
                    450,-140,
                    450,-400,
                    0,-400
                ],
                move:function(){
                    var s = this;
                    if(s.y < 50){
                        s.y += s.perMove.y;
                    }
                    if(!s.fullPower) s.fullPower = s.power;
                    var rate = Math.floor(s.power / s.fullPower * 7);
                    if(rate < s.rate){
                        s.hue += 30;
                        s.lineWidth -= 20;
                        s.line = line(s.lineWidth, color(s.hue));
                        s.preRender(s.img);
                        s.preRender(s.hitImg, true);
                    }
                    s.rate = rate;
                },
                recoverDuration:500
            })
        };
        for(var type in enemy){
            if(enemy.hasOwnProperty(type))
                enemy[type].prototype.type = type;
        }
        return enemy;
    })();
    return d;
})();