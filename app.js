phina.globalize();


ASSETS = {
    image: {
    },
};

phina.define('TitleScene', {
    superClass: 'DisplayScene',
  
    init: function(options) {
        this.superInit(options);

        const self = this;

        this.backgroundColor = "gray";

        Label({
            text: 'タイトル',
            x: 320,
            y: 320,
            fontSize: 40,
            fill: "black",
            fontWeight: 800,
        }).addChildTo(this);

        this.on("pointstart",function() {
            this.exit();
        });

    },

});

phina.define('ExplanationScene', {
    superClass: 'DisplayScene',
  
    init: function(options) {
        this.superInit(options);

        const self = this;

        this.backgroundColor = "gray";

        Label({
            text: '説明',
            x: 320,
            y: 320,
            fontSize: 40,
            fill: "black",
            fontWeight: 800,
        }).addChildTo(this);

        this.on("pointstart",function() {
            this.exit();
        });

    },
});

phina.define('GameScene', {
    superClass: 'DisplayScene',
  
    init: function(options) {
        this.superInit(options);

        const self = this;

        this.backgroundColor = "#ECF0F1";

        const timer = Timer({seconds: 60});

        timer.addChildTo(this).setPosition(this.gridX.center(), 50);

        const q1 = {id: "10"};

        const questionA = Question({alphabet: "A", question: questions[0]});

        questionA.setPosition(this.gridX.center(), this.gridY.span(5)).addChildTo(this);

        const questionB = Question({alphabet: "B", question: questions[1]});

        questionB.setPosition(this.gridX.center(), this.gridY.span(12.2)).addChildTo(this);

        App.on("timeup", function() {
            console.log("time up");
        });

    },
});

phina.define("Question", {
    superClass: "RectangleShape",

    init: function(options) {

        const self = this;

        this.superInit({
            width: 600,
            height: 410,
            fill: "#BDC3C7",
            strokeWidth: 10,
            stroke: "black",
            cornerRadius: 10,
        });

        const goban = RectangleShape({
            width: 400,
            height: 400,
            fill: "#F1C40F",
            strokeWidth: 0,
        }).addChildTo(self).setX(80);

        goban._grid = Grid({width: 400, columns: 11});

        // 縦線
        (11).times(function(spanX) {
            const startPoint = Vector2(
                (spanX - 5) * goban._grid.unitWidth,
                -1 * (goban._grid.width/2));

            const endPoint = Vector2(
                (spanX - 5) * goban._grid.unitWidth,
                goban._grid.width/2 - goban._grid.unitWidth / 2);
            
            PathShape({paths:[startPoint, endPoint], stroke: "black", strokeWidth: (spanX === 10 ? 4 : 2)}).addChildTo(goban);
        });

        // 横線
        (11).times(function(spanY) {
            const startPoint = Vector2(
                -1 * (goban._grid.width/2), 
                (spanY - 5) * goban._grid.unitWidth);

            const endPoint = Vector2(
                goban._grid.width/2 - goban._grid.unitWidth / 2,
                (spanY - 5) * goban._grid.unitWidth);
            
            PathShape({paths:[startPoint, endPoint], stroke: "black", strokeWidth: (spanY === 10 ? 4 : 2)}).addChildTo(goban);
        });

        CircleShape({x: goban._grid.unitWidth * 2, y: goban._grid.unitWidth * 2, radius: 5, fill: "black", strokeWidth: 0}).addChildTo(goban);
        CircleShape({x: goban._grid.unitWidth * -4, y: goban._grid.unitWidth * 2, radius: 5, fill: "black", strokeWidth: 0}).addChildTo(goban);
        CircleShape({x: goban._grid.unitWidth * 2, y: goban._grid.unitWidth * -4, radius: 5, fill: "black", strokeWidth: 0}).addChildTo(goban);
        CircleShape({x: goban._grid.unitWidth * -4, y: goban._grid.unitWidth * -4, radius: 5, fill: "black", strokeWidth: 0}).addChildTo(goban);
        

        Label({
            text: options.alphabet,
            fontSize: 80,
            fill: "white",
        }).setPosition(-210,-150).addChildTo(this);

        Label({
            text: "問題番号：" + options.question.id,
            fontSize: 20,
            fill: "white",
        }).setPosition(-210,-80).addChildTo(this);

        const priorityText = {
            0: "両後手",
            1: "逆ヨセ",
            2: "先手",
            3: "両先手",
        };

        Label({
            text: priorityText[options.question.priority] + "\n" + options.question.sizeText,
            fontSize: 40,
            fontWeight: 800,
        }).setPosition(-210,20).addChildTo(this);

    }
});

phina.define("Timer", {
    superClass: "RectangleShape",
    percentage: 100,
    init: function(option) {
        this.superInit({
            width: 602,
            height: 52,
            strokeWidth: 1,
            stroke: "#7F8C8D",
            fill: "#ECF0F1",
        });
        this.bar = RectangleShape({
            width: 600,
            height: 50,
            strokeWidth: 0,
            fill: "#D35400",
        }).addChildTo(this).setOrigin(0, 0).setPosition(- this.width / 2 - 7, - this.height / 2 - 7);

        this.seconds = option.seconds;
    },
    update: function() {

        if (this.percentage <= 0) return;

        this.percentage -= (100 / App.fps) / this.seconds;

        if (this.percentage < 0) {
            this.percentage = 0;
            this.bar.setWidth(0);
            App.flare("timeup");
            return;
        }
        this.bar.setWidth(600 * this.percentage / 100);
    }
});

phina.main(function() {
    App = GameApp({
        // assets: ASSETS,
        startLabel: 'TitleScene',
        scenes: [
            {
                label: 'TitleScene',
                className: 'TitleScene',
                nextLabel: "ExplanationScene",
            }, {
                label: 'ExplanationScene',
                className: 'ExplanationScene',
                nextLabel: "GameScene",
            }, {
                label: 'GameScene',
                className: 'GameScene',
            }
        ],
    });

    App.fps = 30;
    // App.enableStats();

    App.run();

});


const questions = [
    {
        id: "1",
        priority: 0,
        size: 1,
        sizeText: "１目強",
        stones: [
        ]
    },
    {
        id: "2",
        priority: 2,
        size: 2,
        sizeText: "２目",
        stones: [
        ]
    },
]
