SH.settings = {
    canvasSize:{width:0, height:0},
    interval:10,
    player:{
        shell:{
            speed:500,
            interval:400
        },
        canon:{
            chargeRate:0.002,
            speed:500
        },
        bomb:{
            speed:200,
            expandDuration:1000,
            explodeDuration:1200
        }
    },
    isMobile:(/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()))

}