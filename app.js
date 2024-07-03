phina.globalize();

const version = "0.9";

ASSETS = {
    image: {
        "ok": "img/ok.png",
        "miss": "img/miss.png",
        "title": "img/title.png",
        "result1": "img/result1.png",
        "result2": "img/result2.png",
        "result3": "img/result3.png",
        "result4": "img/result4.png",
        "result5": "img/result5.png",
        "result6": "img/result6.png",
    },
};

phina.define('TitleScene', {
    superClass: 'DisplayScene',
  
    init: function(options) {
        this.superInit(options);

        const self = this;

        this.backgroundColor = "#ecf0f1";

        Sprite("title").addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

        Label({
            text: 'ヨセくらべ',
            x: this.gridX.center(),
            y: this.gridY.span(3),
            fontSize: 80,
            fill: "black",
            fontWeight: 800,
        }).addChildTo(this);

        const verLabel = Label({
            x: this.gridX.span(12),
            y: this.gridY.span(4),
            fontSize: 18,
            fill: "black",
            fontFamily: "monospace",
        }).addChildTo(this);
        verLabel.text = "ﾊﾞｰｼﾞｮﾝ " + version;

        Label({
            text: 'タップして開始',
            x: this.gridX.center(),
            y: this.gridY.span(12),
            fontSize: 30,
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


        this.backgroundColor = "#ecf0f1";

        LabelArea({
            text: '＜遊び方＞\n\n黒番のヨセが２つ表示されます。ヨセの価値が高い方を選んでください。出題は全部で５問です。\n\n\n＜ヨセの価値＞\n\nこのゲームでのヨセの価値は、目数に関係なく「両先手 ＞ 先手 ＞ 逆ヨセ ＞ 両後手」としています。\n\nそれが同じ場合、より目数が多いほうを選んでください。',
            x: 50,
            y: 100,
            width: 500,
            height: 600,
            fontSize: 30,
            fill: "black",
        }).setOrigin(0,0).addChildTo(this);

        this.on("pointstart",function() {
            this.exit();
        });

    },
});

phina.define('GameScene', {
    superClass: 'DisplayScene',

    questions: null,
    questionsDrawer: null,

    questionNumber: 0,

    okNumber: 0,

    init: function(options) {
        this.superInit(options);

        const self = this;

        App.on("timeup", function() {
            console.log("time up");
        });

        // 問題番号
        self.questionNumberLabel = Label({
            x: 320,
            y: 45,
            fontSize: 40,
            text: "",
        }).addChildTo(this);

        self.updateQuestionNumberLabel();

        // 全ての問題を作る
        self.questions = new Questions();

        // 問題描画クラスを生成
        self.questionsDrawer = new QuestionsDrawer(this);

        // 問題を描画
        self.questionsDrawer.draw(self.questions.nextQuestion());

        App.on("ok", function(param) {
            self.okNumber += 1;
            App.pushScene(ResultScene({isOK: true, isUpper: param.isUpper}));
        });

        App.on("miss", function(param) {
            App.pushScene(ResultScene({isOK: false, isUpper: param.isUpper}));
        });

        this.on("resume", function() {

            // 次の問題があるなら
            if (self.questions.haveNextQuestion()) {
                // 次の問題へ
                self.updateQuestionNumberLabel();
                self.questionsDrawer.draw(self.questions.nextQuestion());
            } else {
                self.exit({okNumber: self.okNumber});
            }
        });


    },

    updateQuestionNumberLabel: function() {
        this.questionNumber += 1;
        this.questionNumberLabel.text = "第" + this.questionNumber + "問";
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
    
        // self.timer = Timer({seconds: 60});
        // self.timer.addChildTo(self.scene).setPosition(self.scene.gridX.center(), 50);

        setTimeout(createChoise, 10);
    
        function createChoise() {
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
        
            self.choiseA.setPosition(1000, self.scene.gridY.span(5)).addChildTo(self.scene)
                .tweener.to({x: self.scene.gridX.center()}, 300).play();
    
            self.choiseB.setPosition(1000, self.scene.gridY.span(12.2)).addChildTo(self.scene)
                .tweener.to({x: self.scene.gridX.center()}, 300).play();
    
        }
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

    for (let i = 0; i < 5; i++) {

        const index1 = Random.randint(0, data.length - 1);
        const priority = data[index1].priority;
        const size = data[index1].size;

        const nokori = data.filter(function(q) {
            //@@@
            return !(q.priority === priority && q.size === size);
            // return q.id !== data[index1].id;
        });

        const index2 = Random.randint(0, nokori.length - 1);

        questions.push({"A": data[index1], "B": nokori[index2]});

    }

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
            fill: "#ffa801",
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
        
        const step = options.question.stones;

        (11).times(function(y) {
            console.log(step[y]);
            const raws = step[y].split("");
            (11).times(function(x) {
                const color = raws[x];
                if (color !== " ") {
                    putStone(x, y , color);
                }
            });
        });

        function putStone(x, y, color) {

            const px = -1 * goban.width / 2 + goban._grid.span(x + 0.5);
            const py = -1 * goban.height / 2 + goban._grid.span(y + 0.5);

            if (color === "B" || color === "W") {
                CircleShape({
                    strokeWidth: 0,
                    radius: goban._grid.unitWidth / 2 - 0.5,
                    fill: color === "B" ? "black" : "white",
                }).setPosition(px, py).addChildTo(goban);
                return;
            }

            if (color !== "1") return;

            CircleShape({
                strokeWidth: 0,
                radius: goban._grid.unitWidth / 2 - 0.5,
                fill: Number(color) % 2 !== 0 ? "black" : "white",
            }).setPosition(px, py).addChildTo(goban);

            Label({
                text: color,
                fontSize: 25,
                fill: Number(color) % 2 === 0 ? "black" : "white"
            }).setPosition(px, py).addChildTo(goban);

        }

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

        const score = options.okNumber / 5 * 100;

        let img = "result";
        let x, y;
        let scoreText = "";

        if (score === 100) {
            img += "1";
            x = 300;
            y = 600;
            scoreText = "100点！"
        } else if (score >= 80) {
            img += "2";
            x = 320;
            y = 600;
            scoreText = score + "点！";
        } else if (score >= 60) {
            img += "3";
            x = 320;
            y = 600;
            scoreText = score + "点";
        } else if (score >= 40) {
            img += "4";
            x = 320;
            y = 600;
            scoreText = score + "点";
        } else if (score >= 20) {
            img += "5";
            x = 320;
            y = 500;
            scoreText = score + "点";
        } else {
            img += "6";
            x = 320;
            y = 600;
            scoreText = score + "点";
        }

        Label({
            text: scoreText,
            x: 320,
            y: 220,
            fontSize: 80,
            fill: "black",
            fontWeight: 800,
        }).addChildTo(this);

        Sprite(img).addChildTo(this).setPosition(x, y);
        
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
        priority: 0,
        size: 0,
        sizeText: "1/3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     WWBB  ",
            "     W1WB  ",
            "     WWBB  ",
            "           ",
            "           ",
        ]
    },
    {
        id: "2",
        priority: 0,
        size: 0,
        sizeText: "1/3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     WWBB  ",
            "     WB1B  ",
            "     WWBB  ",
            "           ",
            "           ",
        ]
    },
    {
        id: "3",
        priority: 0,
        size: 0,
        sizeText: "1/3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "      B    ",
            "     B     ",
            "    WWBBBB ",
            "   W  WWWB1",
            "        WWB",
            "        WB ",
       ]
    },
    {
        id: "4",
        priority: 0,
        size: 0,
        sizeText: "1/3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "      B    ",
            "     B     ",
            "    WWBBBB ",
            "   W  WWWB3",
            "        WWB",
            "        21 ",
       ]
    },
    {
        id: "5",
        priority: 0,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "      WWWWW",
            "     WW1BWB",
            "     WB BBB",
            "      BBB  ",
            "    B      ",
            "           ",
       ]
    },
    {
        id: "6",
        priority: 0,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     W W   ",
            "    BW   W ",
            "     BWWW  ",
            "   B BBB1W ",
            "        BBW",
            "         B ",
       ]
    },
    {
        id: "7",
        priority: 0,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     BBWWW ",
            "     B21BW ",
            "     BBWWW ",
            "           ",
            "           ",
       ]
    },
    {
        id: "8",
        priority: 0,
        size: 1,
        sizeText: "1目強",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "       WWW ",
            "     BBWBW ",
            "     B21BW ",
            "     BBWWW ",
            "           ",
            "           ",
       ]
    },
    {
        id: "9",
        priority: 0,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "      BB   ",
            "     B  B  ",
            "     BWWBBB",
            "     BW WBW",
            "     B1WWWW",
            "    WWW    ",
            "           ",
       ]
    },
    {
        id: "10",
        priority: 0,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "    WWWWW  ",
            "   BB B3BW ",
            "      B BW ",
            "    B B1BW ",
            "   B BW2W  ",
            "    BWWBBW ",
            "     B WW  ",
       ]
    },
    {
        id: "11",
        priority: 2,
        size: 1,
        sizeText: "1目弱",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        W  ",
            "      W    ",
            "     BBWWW ",
            "       BWB2",
            "    B B BW ",
            "        BW1",
            "         B ",
       ]
    },
    {
        id: "12",
        priority: 2,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "       BBB ",
            "   BBBBWWB ",
            "   BWWWW WB",
            "   B12 W W ",
       ]
    },
    {
        id: "13",
        priority: 2,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "   WBB  WB ",
            " W WWWBBBB ",
            "     2WWB  ",
            "       1   ",
       ]
    },
    {
        id: "14",
        priority: 2,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "       B BB",
            "         BW",
            "       BBWW",
            "     B BW W",
            "       12W ",
       ]
    },
    {
        id: "15",
        priority: 2,
        size: 1,
        sizeText: "1目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        W  ",
            "           ",
            "    BBBBBW ",
            "    BWW1WW ",
            "  B BW W2  ",
            "   BWW     ",
       ]
    },
    {
        id: "16",
        priority: 0,
        size: 1.5,
        sizeText: "1目半",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBBBB ",
            "     WW1WW ",
            "     W  W  ",
            "     WWWW  ",
            "           ",
            "           ",
       ]
    },
    {
        id: "17",
        priority: 0,
        size: 1.5,
        sizeText: "1目半",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBBB  ",
            "   B  B  B ",
            "   BWW1WWB ",
            "   BW   WB ",
            "   B WWWBB ",
            "  WWW  WWB ",
            "         W ",
       ]
    },
    {
        id: "18",
        priority: 0,
        size: 1.5,
        sizeText: "1目半",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     BBBBBB",
            "     BWWWWW",
            "     B1  W ",
            "     BWWWW ",
            "     BW    ",
       ]
    },
    {
        id: "19",
        priority: 2,
        size: 1.5,
        sizeText: "1目半",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "         W ",
            "     W WW  ",
            "     W W W ",
            "   BBWBB 2 ",
            "   BWBB BW1",
            "         B ",
       ]
    },
    {
        id: "20",
        priority: 2,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "         B ",
            "      BBB  ",
            "      BWBB3",
            "     WB BW1",
            "    W WWWW2",
            "           ",
       ]
    },
    {
        id: "21",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     BBBBBB",
            "     BWWWWW",
            "     B1 BW ",
            "     BWWWW ",
            "     BW    ",
       ]
    },
    {
        id: "22",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     BBBBB ",
            "     B1W B ",
            "     WB WBB",
            "   W WWWWWB",
            "          W",
            "         W ",
       ]
    },
    {
        id: "23",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBWW  ",
            "    BW1BW  ",
            "    BBBWW  ",
            "           ",
       ]
    },
    {
        id: "24",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBWWW  ",
            "    B 1 W  ",
            "    BBBWW  ",
            "           ",
       ]
    },
    {
        id: "25",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "     BBBBB ",
            "    BBWWB  ",
            "   WW312WBB",
            "   W WWWWWB",
            "          W",
            "         W ",
       ]
    },
    {
        id: "26",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBWW  ",
            "    BWW1W  ",
            "    BBBWW  ",
            "           ",
       ]
    },
    {
        id: "27",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBWW  ",
            "    B 1BW  ",
            "    BBBWW  ",
            "           ",
       ]
    },
    {
        id: "28",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "       BB  ",
            "      WWB  ",
            "     WWBB  ",
            "     W WWB ",
            "  W  WW1BB ",
            "      WWB  ",
            "           ",
       ]
    },
    {
        id: "29",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "   WWWBBB  ",
            "   W BW1B  ",
            "   WWWBBB  ",
            "     BBW   ",
            "           ",
       ]
    },
    {
        id: "30",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "      WWWW ",
            "    WWBBBW ",
            "    W1 WBB ",
            "  W WBBBB  ",
            "   WBB     ",
            "           ",
       ]
    },
    {
        id: "31",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "      BBBBB",
            "      BW1WB",
            "      BW WW",
            "      BWW  ",
            "     B BWW ",
            "       BBW ",
       ]
    },
    {
        id: "32",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "      BBBBB",
            "      B BWW",
            "      B BW ",
            "   W WW1WW ",
            "     W     ",
            "           ",
       ]
    },
    {
        id: "33",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "      BBBBB",
            "      BWBWW",
            "      B BW ",
            "   W WW1WW ",
            "     W     ",
            "           ",
       ]
    },
    {
        id: "34",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "      BBBBB",
            "      BW1WW",
            "      BW W ",
            "   BBBWWW  ",
            "    WW     ",
            "           ",
       ]
    },
    {
        id: "35",
        priority: 0,
        size: 2,
        sizeText: "約2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "     B     ",
            "    WB B   ",
            "   W WB    ",
            " W   WWBB  ",
            "     W WBB ",
            "     WW1WB ",
       ]
    },
    {
        id: "36",
        priority: 0,
        size: 2,
        sizeText: "約2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "     B     ",
            "    WB B   ",
            "   W WB    ",
            " W   WWBB  ",
            "     W1WBB ",
            "     WWB B ",
       ]
    },
    {
        id: "37",
        priority: 0,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "     B     ",
            "    WB B   ",
            "   W WB    ",
            " W   WWBB  ",
            "     WB1BB ",
            "     WWB B ",
       ]
    },
    {
        id: "38",
        priority: 1,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "         W ",
            "   WWWWWW  ",
            "   W 1BBBWW",
            "    WB  WBW",
            " W  WB BBBB",
            "    WWB    ",
            "           ",
       ]
    },
    {
        id: "39",
        priority: 2,
        size: 2,
        sizeText: "2目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "         BB",
            "    BBBBBWW",
            "    B 1WWW ",
            "    BWW W  ",
       ]
    },
    {
        id: "40",
        priority: 0,
        size: 2.5,
        sizeText: "2目半",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "         B ",
            "    BB  B  ",
            "    B BB BB",
            "    BWW WWB",
            "  B BW W  W",
            "     1  WWW",
       ]
    },
    {
        id: "41",
        priority: 0,
        size: 2,
        sizeText: "2目強",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    WWWB   ",
            "   W WB B  ",
            "  W WBBB   ",
            "    WWWWBB ",
            "       1WB ",
       ]
    },
    {
        id: "42",
        priority: 0,
        size: 3,
        sizeText: "3目強",
        stones: [
            "           ",
            "           ",
            "           ",
            "        W  ",
            "           ",
            "       W W ",
            "  B   BW   ",
            "      BW W ",
            "  B  B BWW ",
            "      BBBW ",
            "         1 ",
       ]
    },
    {
        id: "43",
        priority: 0,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    WWWBB  ",
            "    W 1WB  ",
            "    WWBBB  ",
            "           ",
            "           ",
       ]
    },
    {
        id: "44",
        priority: 0,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBBBBB",
            "    BWW WWB",
            "  B BW W  W",
            "     1  WWW",
       ]
    },
    {
        id: "45",
        priority: 0,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            " WWW       ",
            " WBBWWWW   ",
            " WB BBW WWW",
            " WB   BBWB1",
            " WWB    BB ",
       ]
    },
    {
        id: "46",
        priority: 0,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        BBB",
            "        B W",
            "      B B 1",
            "    B B BBW",
            "      WWWW ",
            "    W      ",
            "           ",
       ]
    },
    {
        id: "47",
        priority: 0,
        size: 3,
        sizeText: "3目強",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "         W ",
            "           ",
            "        W  ",
            "        W  ",
            " B  BBBBWW ",
            "       BBW ",
            "         1 ",
       ]
    },
    {
        id: "48",
        priority: 2,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "        B  ",
            "        BB ",
            "       BWW ",
            "     BBBW W",
            "  B  BW  W ",
            "B    BW  W ",
            "     BW1WW ",
            "           ",
       ]
    },
    {
        id: "49",
        priority: 2,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "       B   ",
            "      WB   ",
            "   W  W    ",
            " W    WBB  ",
            "      WB   ",
            "      1    ",
       ]
    },
    {
        id: "50",
        priority: 1,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        W  ",
            "       W   ",
            "      BW   ",
            "   B  B    ",
            " B    BWW  ",
            "      BW   ",
            "      1    ",
       ]
    },
    {
        id: "51",
        priority: 2,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        BBB",
            "    BBBBWWB",
            "    BWWW WW",
            "    B1BW   ",
       ]
    },
    {
        id: "52",
        priority: 2,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "         B ",
            "   BBBBBBW ",
            "   BW WWW W",
            " B BW    W ",
            "    1      ",
       ]
    },
    {
        id: "53",
        priority: 2,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "      BBB  ",
            "     BBWB  ",
            "     BWWB  ",
            "  W W1  W  ",
            "    W W W  ",
            "  W        ",
            "           ",
       ]
    },
    {
        id: "54",
        priority: 2,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "         B ",
            "    BBBBB B",
            "  B BWWWBBW",
            "   BWW 1WWW",
            "   B       ",
       ]
    },
    {
        id: "55",
        priority: 1,
        size: 3,
        sizeText: "3目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        W  ",
            "           ",
            "      WWW  ",
            "     BWBW  ",
            " B B BB1W  ",
            "       BWW ",
            "       BBW ",
       ]
    },
    {
        id: "56",
        priority: 1,
        size: 3,
        sizeText: "3目強",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "       W   ",
            "    WWW    ",
            "  WWBBBWWW ",
            "W WBB  BBW ",
            "      B 1  ",
       ]
    },
    {
        id: "57",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "     W  B  ",
            "           ",
            "    WWBBB  ",
            "    W1WWB  ",
            "    WBBBB  ",
            "    WWB    ",
            "           ",
       ]
    },
    {
        id: "58",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "   WWWBBB  ",
            "   WBB1 B  ",
            "   WWWBBB  ",
            "           ",
            "           ",
       ]
    },
    {
        id: "59",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        W  ",
            "    B BBW  ",
            "        W  ",
            "      BBW  ",
            "   BBBWWW  ",
            "   BWW1 W  ",
       ]
    },
    {
        id: "60",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "       W   ",
            "         B ",
            "   W   WWB ",
            "     W WB  ",
            "    BW WB  ",
            "    BW WB  ",
            " B B BWWWB ",
            "     BBWBB ",
            "       1   ",
       ]
    },
    {
        id: "61",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "    BBBB   ",
            " W WWBWB B ",
            "     WWWB  ",
            "       1   ",
       ]
    },
    {
        id: "62",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "        W  ",
            "           ",
            "       W   ",
            "    BB     ",
            "   BWB W   ",
            " B   B W   ",
            "     BW12  ",
            "     B534  ",
       ]
    },
    {
        id: "63",
        priority: 0,
        size: 4,
        sizeText: "4目弱",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "   WWBBBB  ",
            "   W1WWWB  ",
            "   WWBBBB  ",
            "           ",
            "           ",
       ]
    },
    {
        id: "64",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "        BBB",
            "      BWBW3",
            "       BW1W",
            " B   B BW W",
            "      BWWWB",
            "          2",
       ]
    },
    {
        id: "65",
        priority: 0,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "           ",
            "           ",
            "    WBB B  ",
            "   W WB    ",
            "  W WWWBBB ",
            "      1WWB ",
       ]
    },
    {
        id: "66",
        priority: 3,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "         W ",
            "      B    ",
            "      BW   ",
            "      BW   ",
            "  B   BW   ",
            "      BW4  ",
            "      312  ",
       ]
    },
    {
        id: "67",
        priority: 3,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "     WWWB  ",
            "   W WBWWB ",
            " W   WBBWB ",
            "   4 WB B B",
            "    213 B  ",
       ]
    },
    {
        id: "68",
        priority: 3,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "        B  ",
            "         B ",
            "       BBW ",
            "  W  B BWW ",
            "    B  BW  ",
            "   WWBBW   ",
            "       W   ",
            " WWWWBBW   ",
            " WB B BW 4 ",
            " WBBB 312  ",
       ]
    },
    {
        id: "69",
        priority: 3,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "        B  ",
            "           ",
            "    W  B   ",
            "      B    ",
            "     WWBB  ",
            " W  W  WB  ",
            "     2 WB  ",
            "       1   ",
       ]
    },
    {
        id: "70",
        priority: 2,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "        B  ",
            "           ",
            "     B     ",
            "    WWBBBB ",
            "   W  WWWB ",
            "         W1",
            "         2 ",
       ]
    },
    {
        id: "71",
        priority: 2,
        size: 4,
        sizeText: "4目弱",
        stones: [
            "           ",
            "           ",
            "           ",
            "        B  ",
            "           ",
            "        B  ",
            "     WBB   ",
            "  W  WBWBB ",
            "W    WWWWB ",
            "    4WBBB  ",
            "     123   ",
       ]
    },
    {
        id: "72",
        priority: 1,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "           ",
            "           ",
            "       W W ",
            "        W 2",
            "   WWWWW W1",
            "   WBBWBBB3",
            "   WB BB   ",
            "     B     ",
       ]
    },
    {
        id: "73",
        priority: 1,
        size: 4,
        sizeText: "4目",
        stones: [
            "           ",
            "           ",
            "           ",
            "        B  ",
            "         B ",
            "      BBBW ",
            "    BB BWW ",
            "    BWWBW  ",
            " B  BWBWBBW",
            "    BW WWW ",
            "    312    ",
       ]
    },
]
