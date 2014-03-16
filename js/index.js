var requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();
(function($){
    SH.stage.clear = function(){
        layer.sky.clear = true;
        setTimeout(function(){
            layer.sky.clear = false;
            $('.clear-message-container').clearMessageContainer('show');
        }, 1500);
        SH.stage.cleared = true;
    };


    var layer = {
        sky:new SH.layer.Sky(),
        player:new SH.layer.Player(),
        enemy:new SH.layer.Enemy()
    };
    var plugin = (function($){
        $.fn.extend({
            rotate:function(deg){
                return $(this).css({
                    '-moz-transform':'rotate(' + deg + 'deg)',
                    '-webkit-transform':'rotate(' + deg + 'deg)'
                })
            },
            cover:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'show';
                }
                var elm = $(this);
                switch(command){
                    case 'show':
                        var cover = $('.elm-cover', elm);
                        if(cover.size() == 0){
                            cover = $('<div/>').addClass('elm-cover')
                                .appendTo(elm);
                        }
                        if(options.blind){
                            cover.addClass('blind');
                        } else {
                            cover.removeClass('blind');
                        }
                        var message = $('<span/>').addClass('message')
                            .appendTo(cover.empty());
                        if(options.message){
                            message.text(options.message);
                        }
                        if(options.messageStyleClass){
                            message.addClass(options.messageStyleClass);
                        }
                        if(options.fadeIn){
                            cover.fadeIn();
                        } else {
                            cover.show();
                        }
                        return elm;
                    case 'hide':
                        $('.elm-cover', elm).hide();
                        return elm;
                }
                return elm;
            }
        });
        return {
            shootDownCounter:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command  = 'init';
                }
                var counter = $(this);
                switch(command){
                    case 'init':
                        counter.addClass('shoot-down-counter');
                        counter.data('count', 0);
                        $('<span/>').addClass('shoot-down-counter-label')
                            .text(Message.Label.shootDown)
                            .appendTo(counter);
                        $('<span/>').addClass('shoot-down-counter-text')
                            .text(0)
                            .appendTo(counter);
                        return counter;
                    case 'addCount':
                        var count = counter.data('count');
                        count++;
                        counter.data('count', count);
                        $('.shoot-down-counter-text', counter).text(count);
                        return counter;
                    case 'count':
                        return counter.data('count');
                }
                return counter;
            },
            resumeButton:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var button = $(this);
                switch(command) {
                    case 'init':
                        button.addClass('resume-button');
                        (function(){ //load message
                            var parent = $('<div/>').addClass('resume-message');
                            $('<span/>').addClass('resume-message-text')
                                .text(Message.resume)
                                .appendTo(parent);
                            return parent;
                        })().appendTo(button);
                        (function(){ //load arrow
                            var container = $('<div/>')
                                .addClass('resume-message-arrow-container');
                            $('<div/>').addClass('resume-message-arrow')
                                .appendTo(container);
                            return container;
                        })().appendTo(button);
                        return button.button('refresh', options);
                    case 'refresh':
                        if(options && options.x && options.y){
                            var left = options.x - button.width() / 2;
                            var top = options.y - button.height() / 2;
                            button.css({
                                left:left,
                                top:top
                            });
                            var message = $('.resume-message', button);
                            var text = $('.resume-message-text', message)
                                .removeAttr('style');
                            var arrowContainer = $('.resume-message-arrow-container', button)
                                .removeAttr('style');
                            var isLeft = left < message.width();
                            var isTop = top < message.height();
                            if(isTop){
                                if(isLeft) {
                                    arrowContainer.rotate(-45);
                                    text.rotate(-45);
                                    text.css({right:0,bottom:0});
                                } else {
                                    arrowContainer.rotate(45);
                                    text.rotate(45);
                                    text.css({left:0,bottom:0});
                                }
                            } else {
                                if(isLeft) {
                                    arrowContainer.rotate(-135);
                                    text.rotate(45);
                                    text.css({right:0,top:0});
                                } else {
                                    arrowContainer.rotate(135);
                                    text.rotate(-45);
                                    text.css({left:0,top:0});
                                }
                            }
                        }
                        return button;
                }
                return button;
            },
            retryButton:function(command, opitons){
                if(typeof command != 'string'){
                    command = 'init';
                }
                var button = $(this);
                switch(command){
                    case 'init':
                        button.addClass('retry-button')
                            .text(Message.Label.retry)
                            .wrap("<div class='retry-button-container'></div>");
                        return button;
                    case 'show':
                        return button.show();
                }
                return button;
            },
            startButton:function(command, options){
                if(typeof command != 'string'){
                    command = 'init';
                }
                var button = $(this);
                switch(command){
                    case 'init':
                        button.addClass('start-button')
                            .text(Message.Label.start)
                            .wrap("<div class='start-button-container'></div>");
                        return button;
                }
                return button;
            },
            clearMessageContainer:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var container = $(this);
                switch(command){
                    case 'init':
                        container.addClass('clear-message-container');
                        $('<div/>').addClass('clear-message-container-cover')
                            .appendTo(container);
                        $('<span/>').addClass('clear-message-text')
                            .appendTo(container)
                            .text(Message.Label.clear);
                        $('<a/>').addClass('logo')
                            .attr('href', '')
                            .appendTo(container)
                            .text(Message.gameTitle);
                        (function(){
                            var me = $('<span/>').addClass('me')
                                .appendTo(container)
                                .text(Message.createdBy);
                            $('<a/>').appendTo(me)
                                .text('Taka Okunishi')
                                .attr('href', 'http://jp.linkedin.com/pub/taka-okunishi/4b/258/691');
                        })()
                        return container;
                    case 'show':
                        var duration = 2000;
                        container.hide().fadeIn(duration, function(){
                            $('.clear-message-container-cover', container)
                                .fadeOut(duration * 3, function(){

                            })
                        });
                        return container;
                }


                return container;
            },
            playBox:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var box = $(this);
                switch(command){
                    case 'init':
                        box.addClass('play-box')
                            .addClass('preparing');
                        var canvas = $('<canvas/>').appendTo(box).get(0);
                        if(!canvas.getContext){
                            alert(Message.noSupport);
                            return box;
                        }

                        $('<a/>').appendTo(box)
                            .resumeButton().hide()
                            .click(function(){
                                box.playBox('resume')
                                    .trigger('resume');
                                $(this).hide();
                            });
                        $('<a/>').appendTo(box)
                            .retryButton().hide()
                            .click(function(e){
                                box.playBox('retry',{
                                    x:e.clientX,
                                    y:e.clientY
                                });
                                $(this).hide();
                            });
                        box.data('canvas', canvas);
                        $('<div/>')
                            .appendTo(box)
                            .shootDownCounter();

                        box.cover({
                            message:Message.gameTitle,
                            messageStyleClass:'start-logo',
                            blind:true
                        });
                        $('<a/>').appendTo(box).startButton()
                            .click(function(){
                                $(this).remove();
                                box.cover('hide')
                                    .removeClass('preparing')
                                    .playBox('start');

                        });
                        return box.playBox('refresh', options);
                    case 'refresh':
                        canvas = box.data('canvas');
                        canvas.width = SH.settings.canvasSize.width;
                        canvas.height = SH.settings.canvasSize.height;
                        return box;
                    case 'start':
                        canvas = box.data('canvas');
                        var ctx = canvas.getContext('2d');
                        ctx.drawCount = 0;

                        var stage = SH.stage[0];
                        function loadWave(wave){
                            if(box.is('.gameover')) return;
                            if(!wave) return;
                            wave.start({
                                loadEnemy:function(enemy){
                                    if(SH.stage.cleared) return;
                                    layer.enemy.load(enemy);
                                },
                                done:function(){
                                    if(box.is('.gameover')){
                                        box.unbind('retry')
                                            .one('retry', function(){
                                            loadWave(stage.nextWave());
                                        });
                                    } if(box.is('.pausing')){
                                        box.unbind('resume')
                                            .one('resume', function(){
                                                loadWave(stage.nextWave());
                                            });
                                    } else{
                                        loadWave(stage.nextWave());
                                    }
                                }
                            })
                        }
                        loadWave(stage.nextWave());

                        layer.player.startMachineGun();

                        function render(){
                            if(box.is('.gameover')){
                                return;
                            }
                            if(box.is('.pausing')) {
                                requestAnimationFrame(render);
                                return;
                            }
                            for(var i=0; i<layer.player.shell.length; i++){
                                var shell = layer.player.shell[i];
                                if(shell.power <= 0) continue;
                                enemy = layer.enemy.findAirFrame(shell.x, shell.y, shell.radius);
                                if(enemy) {
                                    var power = enemy.power;
                                    enemy.hit(shell.power);
                                    shell.hit(power);
                                    if(!enemy.isAlive()){
                                        var count = $('.shoot-down-counter', box)
                                            .shootDownCounter('addCount')
                                            .shootDownCounter('count');
                                        var bombCounter = layer.player.bombCounter;
                                        if(bombCounter.bomb.length < 3 && count % 50 == 0){
                                            bombCounter.load();
                                        }
                                        if(count % 10 == 0){
                                            layer.player.aircraft.upgrade();
                                        }
                                    }
                                }
                            }

                            var aircraft = layer.player.aircraft;
                            var enemy = layer.enemy.findAirFrame(aircraft.x, aircraft.y, 5);
                            if(enemy){
                                aircraft.hit(enemy.power);
                                if(aircraft.power <= 0){
                                    box.playBox('gameover');
                                }
                            }

                            ctx.save();
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            for(var name in layer){
                                if(layer.hasOwnProperty(name))
                                layer[name].draw(ctx);
                                ctx.drawCount ++;
                            }
                            ctx.restore();
                            requestAnimationFrame(render);
                        }
                        render();
                        return box;
                    case 'stop':
                        return box;
                    case 'click':
                        if(box.is('.gameover')) return;
                        switch(options.which){
                            case 1:
                            case 2:
                                layer.player.fireCanon();
                                return box;
                            case 3:
                                layer.player.releaseBomb();
                                return box;
                        }
                        return box;
                    case 'pause':
                        box.addClass('pausing')
                            .cover({message:Message.pause});
                        $('.resume-button', box)
                            .resumeButton('refresh', layer.player.aircraft.getPosition())
                            .show();
                        layer.player.stopMachineGun();
                        return box;
                    case 'gameover':
                        if(box.is('.gameover')) return;
                        layer.player.gameover(function(){
                            canvas = box.data('canvas');
                            layer.player.draw(canvas.getContext('2d'));
                            box
                                .cover({
                                    message:Message.gameover
                                })
                                .addClass('gameover');
                            $('.retry-button', box)
                                .retryButton('show');
                        });
                        return box;
                    case 'resume':
                        layer.player.startMachineGun();
                        box.removeClass('pausing')
                            .cover('hide');
                        return box;
                    case 'move':
                        var x, y;
                        if(options.x || options.y){
                            x = options.x;
                            y = options.y;
                        }
                        if(options.vx || options.vy){
                            x = layer.player.aircraft.x + options.vx;
                            y = layer.player.aircraft.y + options.vy;
                        }
                        layer.player.aircraft.setPosition(x, y);
                        return box;
                    case 'retry':
                        box.removeClass('gameover')
                            .cover('hide');
                        layer.player.load();
                        var count = box.data('retryCount');
                        if(!count) count = 0;
                        count++;
                        if(count >= 5){
                            $('body').empty()
                                .animate({
                                    backgroundColor:"#A22"
                                }, 1000, null, function(){
                                    setTimeout(function(){
                                        location.href="";
                                    }, 1000);
                                });
                            return;
                        }
                        box.data('retryCount', count);

                        var x = options.x;
                        var y = options.y;
                        layer.player.aircraft.setPosition(x, y);
                        var enemy = layer.enemy.airframe;
                        for(var type in enemy){
                            if(!enemy.hasOwnProperty(type)) continue;
                            var queue = enemy[type];
                            for(var i=0; i<queue.length; i++){
                                queue[i].hit(3);
                            }
                        }
                        box.playBox('start');
                        return box.trigger('retry');
                }
                return box;
            },
            stRoot:function(){
                var root = $(this);
                var playBox =$('#play-box', root).playBox();

                $('<div/>').appendTo(root)
                    .clearMessageContainer()
                    .hide();
                root
                    .mousemove(function(e){
                        if(e.clientX == 0 && e.clientY == 0) return;
                            playBox.playBox('move', {
                                x:e.clientX,
                                y:e.clientY
                            })
                        })
                    .mouseleave(function(){
                        if(playBox.is('.pausing')) return;
                        if(playBox.is('.gameover')) return;
                        if(playBox.is('.preparing')) return;
                        var pauseTimer = setTimeout(function(){
                            playBox.playBox('pause');
                        }, 300);
                        root.data('pauseTimer', pauseTimer);
                    })
                    .mouseenter(function(){
                        var pauseTimer = root.data('pauseTimer');
                        if(pauseTimer){
                            clearTimeout(pauseTimer);
                            root.data('pauseTimer', null);
                        }
                    })
                    .mousedown(function(e){
                        if(playBox.is('.pausing')) return;
                        playBox.playBox('click',{which:e.which});
                    });

                $(window)
                    .data('pressCount', 0)
                    .keydown(function(e){
                        var vx = 0, vy = 0;
                        var amount = 20;
                        switch(e.keyCode){
                            case 37:
                                vx = -amount;
                                break;
                            case 38:
                                vy = -amount;
                                break;
                            case 39:
                                vx = amount;
                                break;
                            case 40:
                                vy = amount;
                                break;
                            default:
                                playBox.playBox('click',{which:1});
                                return;
                        }
                        if(vx || vy){
                            var count = $(this).data('pressCount');
                            count++;
//                            playBox.playBox('move',{vx:vx,vy:vy});
                            $(this).data('pressCount', count);
                        }
                    })
                    .keyup(function(e){
                        $(this).data('pressCount', 0);
                    })
                    .resize(function(){
                        SH.settings.canvasSize = {
                            width:window.innerWidth,
                            height:window.innerHeight
                        };
                        playBox.playBox('refresh');

                        var canvas = playBox.data('canvas');
                        var ctx = canvas.getContext('2d');
                        ctx.save();
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        for(var name in layer){
                            if(layer.hasOwnProperty(name))
                            layer[name].setSize(SH.settings.canvasSize);
                            layer[name].draw(ctx);
                        }
                        ctx.restore();
                        $('.resume-button', playBox)
                            .resumeButton('refresh', layer.player.aircraft.getPosition());
                    }).trigger('resize');

                return root;
            }
        }
    })($.sub());
    $.fn.extend(plugin);
})(jQuery);

$(function(){
    var isMobile = (/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
    if(isMobile){
        var forPC = $('<div/>')
            .addClass('need-pc-message')
            .html(Message.needPC)
            .appendTo('#st-root');
        $('<a/>').addClass('techbakery')
            .appendTo(forPC)
            .text('TechBakery')
            .attr('href', 'http://techbakery.net');
        return;
    }

    var root = $('#st-root').stRoot()
        .hide()
        .fadeIn(1400);

    document.oncontextmenu = function(){return false}
    $('<title/>').text(Message.gameTitle)
        .appendTo('head');

});