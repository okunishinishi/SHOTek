SH = (function(){
    var SH = {};
    SH.define = function(options){
            var func = options.init;
            if(!func) func = function(){};
            if(options.prototype)func.prototype = new options.prototype();
            for(var name in options.property){
                func.prototype[name] = options.property[name];
            }
            return func;
    }
    SH.Rect = SH.define({
        init:function(left, top, width, height){
            var s = this;
            s.setSize(width, height);
            s.setPosition(left, top);
        },
        property:{
            setSize:function(w, h){
                var s = this;
                s.width = w;
                s.height = h;
            },
            setPosition:function(left, top){
                var s = this;
                s.left = left;
                s.top = top;
            },
            contains:function(x, y, margin){
                if(!margin) margin = 0;
                var s = this;
                return x + margin> s.left
                    && x < s.left + s.width + margin
                    && y + margin> s.top
                    && y < s.top + s.height + margin;
            }
        }
    });
    SH.util = {
        hsv2rgb: function(h, s, v){
            //r, g, b means  red, blue, green, 0 ~ 255.
            //a means alpha, 0.0 ~ 1.0
            //h means hue, 0 ~ 360
            //s, v means saturation, value of brgitness, 0 ~ 100
            var rgb = (function(h,s,v){
                if(s == 0) return ({r:v, g:v, b:v});//gray
                h = h % 360;
                var i = Math.floor(h / 60);
                var f = h / 60 - i;
                v = v * 255 / 100;
                var m = v * (1 - s / 100);
                var n = v * (1 - s / 100 * f);
                var k = v * (1 - s / 100 * (1 - f));
                switch(i){
                    case 0:
                        return {r:v, g:k, b:m};
                    case 1:
                        return {r:n, g:v, b:m};
                    case 2:
                        return {r:m, g:v, b:k};
                    case 3:
                        return {r:m, g:n, b:v};
                    case 4:
                        return {r:k, g:m, b:v};
                    case 5:
                        return {r:v, g:m, b:n};
                }
            })(h, s, v);
            rgb.r = parseInt(rgb.r);
            rgb.g = parseInt(rgb.g);
            rgb.b = parseInt(rgb.b);
            return rgb;
        },
        rgba2string:function(r,g,b,a){
            if(!a) a = 1;
            return 'rgba(' + r + ',' + g + ',' + b +',' + a + ')';
        },
        hsv2rgbaString:function(h,s,v){
            var rgba = this.hsv2rgb(h,s,v)
            return this.rgba2string(rgba.r, rgba.g, rgba.b);
        },
        randomInt:function(min, max){
            return min + parseInt(Math.random() * max);
        }
    }
    return SH;
})();