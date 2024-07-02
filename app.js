phina.globalize();


ASSETS = {
    image: {
        "ok": "img/ok.png",
        "miss": "img/miss.png",
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
        App.clear("ok");
        App.clear("miss");


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

    questions: null,
    questionsDrawer: null,

    init: function(options) {
        this.superInit(options);

        const self = this;

        App.on("timeup", function() {
            console.log("time up");
        });

        // 全ての問題を作る
        self.questions = new Questions();

        // 問題描画クラスを生成
        self.questionsDrawer = new QuestionsDrawer(this);

        // 問題を描画
        self.questionsDrawer.draw(self.questions.nextQuestion());

        App.on("ok", function(param) {
            App.pushScene(ResultScene({isOK: true, isUpper: param.isUpper}));
        });

        App.on("miss", function(param) {
            App.pushScene(ResultScene({isOK: false, isUpper: param.isUpper}));
        });

        this.on("resume", function() {

            // 次の問題があるなら
            if (self.questions.haveNextQuestion()) {
                // 次の問題へ
                self.questionsDrawer.draw(self.questions.nextQuestion());
            } else {
                self.exit();
            }
        });


    },

});

// 問題描画クラス
function QuestionsDrawer(scene) {

    const self = this;

    self.scene = scene;

    self.timer = null;
    self.choiseA = null;
    self.choiseB = null;

    self.draw = function(question) {

        const self = this;

        const questionA = question.A;
        const questionB = question.B;
    
        if (self.timer) {
            self.timer.remove();
        }
        if (self.choiseA) {
            self.choiseA.remove();
        }
        if (self.choiseB) {
            self.choiseB.remove();
        }
    
        self.timer = Timer({seconds: 60});
        self.timer.addChildTo(self.scene).setPosition(self.scene.gridX.center(), 50);
    
        const okCallback = function(isUpper) {
            return () => {
                showPriority();
                App.flare("ok", {isUpper: isUpper});
            };
        };
    
        const badCallback = function(isUpper) {
            return () => {
                showPriority();
                App.flare("miss", {isUpper: isUpper});
            };
        };
    
        let callbackA, callbackB;
    
        if (questionA.priority > questionB.priority) {
            callbackA = okCallback(true);
            callbackB = badCallback(false);
        } else if (questionA.priority < questionB.priority) {
            callbackA = badCallback(true);
            callbackB = okCallback(false);
        } else {
            if (questionA.size > questionB.size) {
                callbackA = okCallback(true);
                callbackB = badCallback(false);
            } else if (questionA.size < questionB.size) {
                callbackA = badCallback(true);
                callbackB = okCallback(false);
            } else {
                callbackA = okCallback(true);
                callbackB = okCallback(false);
            }
        }
    
        self.choiseA = Choise({alphabet: "A", question: questionA, callback: callbackA});
        self.choiseB = Choise({alphabet: "B", question: questionB, callback: callbackB});
    
        // self.choiseA.setPosition(self.scene.gridX.center(), self.scene.gridY.span(5)).addChildTo(self.scene);
        self.choiseA.setPosition(1000, self.scene.gridY.span(5)).addChildTo(self.scene)
            .tweener.to({x: self.scene.gridX.center()}, 200).play();

        // self.choiseB.setPosition(self.scene.gridX.center(), self.scene.gridY.span(12.2)).addChildTo(self.scene);
        self.choiseB.setPosition(1000, self.scene.gridY.span(12.2)).addChildTo(self.scene)
            .tweener.to({x: self.scene.gridX.center()}, 200).play();
    };

    function showPriority() {
        self.choiseA.priorityLabel.show();
        self.choiseB.priorityLabel.show(); 
    }

}

// 全ての問題
function Questions() {

    const self = this;

    const questions = [];

    questions.push({"A": data[0], "B": data[1]});
    questions.push({"A": data[1], "B": data[0]});

    // 次の問題を返す
    self.nextQuestion = function() {
        if (self.haveNextQuestion()) {
            return questions.pop();
        }
        // 全ての問題をやり終えたのなら、イベント発火
        App.flare("complete");
        return null;
    };

    // 次の問題があるかを返す
    self.haveNextQuestion = function () {
        return questions.length > 0;
    };
}

phina.define("Choise", {
    superClass: "RectangleShape",

    init: function(options) {

        const self = this;

        this.superInit({
            width: 600,
            height: 410,
            fill: "#ecf0f1",
            strokeWidth: 10,
            stroke: "#2c3e50",
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
        

        const alphabetLabel = Label({
            text: "",
            fontSize: 80,
            fill: "#2c3e50",
        }).setPosition(-210,-150).addChildTo(this);
        alphabetLabel.text = options.alphabet;

        const questionIdLabel = Label({
            text: "",
            fontSize: 23,
            fill: "#2c3e50",
        }).setPosition(-210,-80).addChildTo(this);
        questionIdLabel.text = "問題番号：" + options.question.id;

        const priorityText = {
            0: "両後手",
            1: "逆ヨセ",
            2: "先手",
            3: "両先手",
        };

        self.priorityLabel = Label({
            text: "",
            fontSize: 40,
            fontWeight: 800,
            fill: "black",
        }).setPosition(-210,20).hide().addChildTo(this);
        self.priorityLabel.text = priorityText[options.question.priority] + "\n" + options.question.sizeText;

        this.setInteractive(true);

        this.on("pointstart", function() {
            options.callback();
        });

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
            fill: "#2980b9",
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

phina.define('LastScene', {
    superClass: 'DisplayScene',
  
    init: function(options) {
        this.superInit(options);

        const self = this;

        this.backgroundColor = "white";

        Label({
            text: '結果',
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

phina.define('ResultScene', {
    superClass: 'DisplayScene',
  
    init: function(options) {
        this.superInit(options);

        const self = this;

        this.backgroundColor = 'rgba(255, 255, 255, 0.1)';

        let img = null;

        if (options.isOK) {
            if (options.isUpper) {
                img = Sprite("ok").addChildTo(this).setPosition(390, 300);
            } else {
                img = Sprite("ok").addChildTo(this).setPosition(390, 720);
            }
        } else {
            if (options.isUpper) {
                img = Sprite("miss").addChildTo(this).setPosition(390, 300);
            } else {
                img = Sprite("miss").addChildTo(this).setPosition(390, 720);
            }
        }

        img.alpha = 0.9;

        img.tweener.to({alpha: 0.3}, 500);

        // setTimeout(function() {
        //     img.remove();
        // }, 300);

        this.on("pointstart",function() {
            self.exit();
        });

    },
});

phina.main(function() {
    App = GameApp({
        assets: ASSETS,
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
                nextLabel: "LastScene",
            }, {
                label: 'LastScene',
                className: 'LastScene',
                nextLabel: "TitleScene",
            }
        ],
    });

    App.fps = 60;
    // App.enableStats();

    App.run();

});


const data = [
    {
        id: "1",
        priority: 1,
        size: 2,
        sizeText: "２目強",
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
