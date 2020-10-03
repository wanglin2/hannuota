<template>
<div class="container">
    <div class="column" v-for="(item, cIndex) in columnList" :key="item.name" :ref="'column' + cIndex" :class="{dragIn: dragingColumnIndex === cIndex}">
        <div class="col"></div>
        <div class="land"></div>
        <div class="name">{{item.name}}</div>
        <div class="ringsBox">
            <div class="ring" v-for="(ringItem, index) in ringList[item.prop]" :key="ringItem.order" :ref="'ring' + ringItem.order" :style="{
                    width: (wsize - (ringItem.order - 1) * 10) + '%',
                    height: hsize / ringNum + '%',
                    backgroundColor: ringItem.color,
                    left: (100 - (wsize - (ringItem.order - 1) * 10)) / 2 + '%',
                    bottom: (hsize / ringNum) * index + '%',
                    cursor: index >= ringList[item.prop].length - 1 ? 'move' : 'not-allowed',
                    transform: dragOrder === ringItem.order ? `translate(${dragPos.x}px, ${dragPos.y}px)` : 'translate(0px, 0px)',
                    transition: transition
                }" @mousedown="mousedown($event, ringItem, index, item.prop, cIndex)"></div>
        </div>
    </div>
    <div class="footer">
        <div class="numSelectBox">
            <div class="numSelectItem">
                <span class="name">选择层数：</span>
                <div class="selectBox">
                    <el-select v-model="ringNum" size="small" :disabled="autoRuning" @change="changeRingNum">
                        <el-option v-for="item in [1,2,3,4,5,6,7,8]" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="numSelectItem">
                <span class="name">最少移动次数：</span>
                <div class="value">{{minStepNum}}</div>
            </div>
            <div class="numSelectItem">
                <span class="name">你移动的次数：</span>
                <div class="value">{{stepNum}}</div>
            </div>
            <div class="numSelectItem">
                <span class="name">消耗的时间：</span>
                <div class="value">{{durationTime}}</div>
                秒
            </div>
        </div>
        <div class="btnGroup">
            <el-button type="danger" size="small" @click="startGame" :disabled="autoRuning">{{inGame ? '重新开始' : '开始'}}</el-button>
            <el-button type="warning" size="small" :disabled="historyList.length <= 0" @click="goback">返回上一步</el-button>
            <el-button type="success" size="small" :disabled="autoRuning" @click="auto">自动操作</el-button>
            <el-button type="info" size="small" @click="ruleDialogVisible = true">游戏规则</el-button>
        </div>
    </div>
    <el-dialog title="恭喜你，完成啦" :visible.sync="passDialogVisible" width="30%" :center="true">
        <div class="passContent">
            <img class="passIcon" src="../assets/success.png" alt />
            <div class="passInfoBox">
                <p>
                    最少步数为：
                    <span class="count">{{minStepNum}}</span>步
                </p>
                <p>
                    你的步数：
                    <span class="count">{{stepNum}}</span>步
                </p>
                <p>
                    你的时间：
                    <span class="count">90</span>秒
                </p>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="passDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
    <el-dialog title="游戏规则" :visible.sync="ruleDialogVisible" width="30%" :center="true">
        <div class="ruleContent">
            <img class="ruleIcon" src="../assets/rule.png" alt />
            <p>你要将所有的圆环从【起始柱】移动到【终点柱】</p>
            <p>你每次只能移动一个圆环。</p>
            <p>游戏最重要的规则是大的圆环不能放在小的圆环上面！</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="ruleDialogVisible = false">关 闭</el-button>
        </span>
    </el-dialog>
    <ul class="nav">
        <li class="navItem">
            <a href="../">首页</a>
        </li>
        <li class="navItem">
            <a href="../content/shudu/">欢乐数独</a>
        </li>
        <li class="navItem">
            <a href="../content/2048/">2048</a>
        </li>
        <li class="navItem">
            <a href="../content/tetris/">俄罗斯方块</a>
        </li>
        <li class="navItem">
            <a href="../content/wzq/">五子棋</a>
        </li>
        <li class="navItem">
            <a href="../content/seecolor/">给你点颜色看看</a>
        </li>
        <li class="navItem">
            <a href="../content/plane/">我爱打飞机</a>
        </li>
    </ul>
</div>
</template>

<script>
const colorList = ['#ffa36c', '#00bcd4', '#848ccf', '#e97171', '#709fb0', '#a0c1b8', '#145374', '#cdb30c']
const propIndex = {
    startColRingList: 0,
    transferColRingList: 1,
    endColRingList: 2,
}

export default {
    name: "Game",
    data() {
        return {
            // 柱子
            columnList: [{
                    name: "起始柱",
                    prop: "startColRingList",
                },
                {
                    name: "中转柱",
                    prop: "transferColRingList",
                },
                {
                    name: "终点柱",
                    prop: "endColRingList",
                },
            ],
            //圆环
            ringNum: 3,
            ringList: {
                startColRingList: [],
                transferColRingList: [],
                endColRingList: [],
            },
            // 拖动变量
            dragProp: "",
            dragOrder: 0,
            dragIndex: null,
            draging: false,
            dragColumnIndex: -1,
            startPos: {
                x: 0,
                y: 0,
            },
            dragPos: {
                x: 0,
                y: 0,
            },
            transition: "none",
            dragingColumnIndex: -1,
            // 其他
            mousemove: null,
            mouseup: null,
            passDialogVisible: false,
            ruleDialogVisible: false,
            // 总共消耗的步数
            stepNum: 0,
            // 总共消耗的时间
            durationTime: 0,
            countTimer: null,
            // 当前层数最少步数
            minStepNum: 0,
            // 是否在游戏中
            inGame: false,
            // 自动操作步骤
            autoStepList: [],
            // 是否在自动操作中
            autoRuning: false,
            // 操作历史数组
            historyList: [],
            // 当前在回退中
            gobacking: false
        };
    },
    computed: {
        wsize() {
            return this.ringNum <= 5 ? 50 : this.ringNum * 10;
        },
        hsize() {
            return this.ringNum <= 3 ? 30 : this.ringNum * 10;
        },
    },
    mounted() {
        this.mousemove = this._mousemove.bind(this);
        this.mouseup = this._mouseup.bind(this);
        this.bindEvent();
        this.initRing();
    },
    beforeDestroy() {
        this.unbindEvent();
    },
    methods: {
        /**
         * @Author: 王林
         * @Date: 2020-08-09 16:12:00
         * @Desc: 鼠标移动事件和松开事件绑定到body上
         */
        bindEvent() {
            document.body.addEventListener("mousemove", this.mousemove);
            document.body.addEventListener("mouseup", this.mouseup);
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 16:15:31
         * @Desc: 解绑事件
         */
        unbindEvent() {
            document.body.removeEventListener("mousemove", this.mousemove);
            document.body.removeEventListener("mouseup", this.mouseup);
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-09-29 22:55:02 
         * @Desc: 切换层数 
         */
        changeRingNum(value) {
            this.inGame = false
            this.ringNum = value
            this.initRing()
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-09-21 22:45:17 
         * @Desc: 初始化数据 
         */
        initRing() {
            let list = []
            for (let i = 1; i <= this.ringNum; i++) {
                list.push({
                    order: i,
                    color: colorList[i - 1]
                })
            }
            this.ringList.startColRingList = list
            this.ringList.transferColRingList = []
            this.ringList.endColRingList = []
            this.autoStepList = []
            this.historyList = []
            this.gobacking = false
            this.minStepNum = 0
            this.durationTime = 0
            this.stepNum = 0
            clearInterval(this.countTimer)
            this.resolveHannuota(this.ringNum, 'startColRingList', 'transferColRingList', 'endColRingList')
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-09-22 22:25:11 
         * @Desc: 开始游戏 
         */
        startGame() {
            if (this.autoRuning) {
                this.$message.warning('当前正在自动操作中');
                return;
            }
            this.initRing()
            this.inGame = true
            this.countTime()
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-09-22 22:31:31 
         * @Desc: 计时 
         */
        countTime() {
            this.countTimer = setInterval(() => {
                this.durationTime++
            }, 1000);
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 16:11:53
         * @Desc: 鼠标按下事件
         */
        mousedown(e, ringItem, index, prop, columnIndex) {
            if (!this.inGame) {
                return this.$message.info('请点击开始按钮开始游戏');
            }
            // 当按下的不是最上面的圆环时不做任何处理
            if (index < this.ringList[prop].length - 1 || !this.inGame || this.autoRuning) {
                return;
            }
            this.transition = "none";
            this.dragProp = prop;
            this.dragOrder = ringItem.order;
            this.dragIndex = index;
            this.dragColumnIndex = columnIndex;
            this.startPos.x = e.clientX;
            this.startPos.y = e.clientY;
            this.draging = true;
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 16:15:38
         * @Desc: 鼠标移动事件
         */
        _mousemove(e) {
            if (!this.draging || !this.inGame || this.autoRuning) {
                return;
            }
            this.dragPos.x = e.clientX - this.startPos.x;
            this.dragPos.y = e.clientY - this.startPos.y;
            this.dragingColumnIndex = this.checkInColumnIndex(this.dragOrder);
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 16:15:44
         * @Desc: 鼠标松开事件
         */
        async _mouseup() {
            if (!this.draging || !this.inGame || this.autoRuning) {
                return;
            }
            this.draging = false;
            let columnIndex = this.checkInColumnIndex(this.dragOrder);
            let canDraged = this.canDraged(columnIndex, this.dragOrder);
            this.transition = "all 0.5s";
            if (canDraged) {
                this.stepNum++;
                await this.moveToNewPos(columnIndex, this.dragProp, this.dragIndex);
                this.dragToColumn(columnIndex, this.dragProp, this.dragIndex);
                this.historyList.push({
                    to: this.dragProp,
                    from: this.columnList[columnIndex].prop
                })
                this.transition = "none";
                this.dragReset();
                this.checkPass();
            } else {
                this.dragReset();
            }
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 21:43:10
         * @Desc: 拖动完成后复位
         */
        dragReset() {
            this.dragProp = "";
            this.dragOrder = 0;
            this.dragIndex = null;
            this.draging = false;
            this.dragColumnIndex = -1;
            this.startPos.x = 0;
            this.startPos.x = 0;
            this.dragPos.x = 0;
            this.dragPos.y = 0;
            this.dragingColumnIndex = -1;
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 16:46:31
         * @Desc: 检查某个位置是否在某个柱子区域内
         */
        checkInColumnIndex(order) {
            let result = -1;
            let ringRect = this.$refs["ring" + order][0].getBoundingClientRect();
            [0, 1, 2].forEach((index) => {
                let {
                    left,
                    right,
                    top,
                    bottom
                } = this.$refs[
                    "column" + index
                ][0].getBoundingClientRect();
                if (
                    ringRect.right >= left &&
                    ringRect.left <= right &&
                    ringRect.top <= bottom &&
                    ringRect.bottom >= top
                ) {
                    result = index;
                }
            });
            return result;
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 17:21:05
         * @Desc: 判断某个圆环是否可以落到指定索引的柱子上
         */
        canDraged(columnIndex, order) {
            if (columnIndex === -1) {
                return;
            }
            let prop = this.columnList[columnIndex].prop;
            let list = this.ringList[prop];
            // 柱子为空则可以落下
            if (list.length <= 0) {
                return true;
            }
            let minOrder = list[list.length - 1].order;
            if (order > minOrder) {
                return true;
            }
            return false;
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 21:18:58
         * @Desc: 某个圆环落到指定索引的柱子上
         */
        dragToColumn(columnIndex, prop, index) {
            let ring = this.ringList[prop].splice(index, 1)[0];
            let toProp = this.columnList[columnIndex].prop;
            this.ringList[toProp].push(ring);
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 22:45:35
         * @Desc: 圆环过度到新位置
         */
        moveToNewPos(columnIndex, prop, index) {
            return new Promise((resolve, rejct) => {
                let ring = this.ringList[prop][index];
                let startPos = this.getRingPosOffsetWindow(
                    this.dragColumnIndex,
                    ring.order,
                    true
                );
                let endPos = this.getRingPosOffsetWindow(columnIndex, ring.order);
                this.dragPos.x = endPos.left - startPos.left;
                this.dragPos.y = endPos.top - startPos.top;
                setTimeout(() => {
                    resolve();
                }, 500);
            });
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-09 22:00:00
         * @Desc: 计算即将落下的位置，距离窗口，用于以动画方式平移过去
         */
        getRingPosOffsetWindow(columnIndex, order, exist) {
            let prop = this.columnList[columnIndex].prop;
            let rect = this.$refs["column" + columnIndex][0].getBoundingClientRect();
            let index = this.ringList[prop].length - (exist ? 1 : 0);
            let left = (100 - (this.wsize - (order - 1) * 10)) / 2 + "%";
            let bottom = (this.hsize / this.ringNum) * index + "%";
            let height = this.hsize / this.ringNum + "%";
            // 转换为像素
            let leftPx = (rect.width * parseFloat(left)) / 100;
            // 底部线段占了5像素
            let _height = rect.height - 5;
            let topPx =
                _height -
                (_height * parseFloat(bottom)) / 100 -
                (parseFloat(height) * _height) / 100;
            // 转换为屏幕上的坐标
            let windowLeftPx = rect.left + leftPx;
            let windowTopPx = rect.top + topPx;
            return {
                left: windowLeftPx,
                top: windowTopPx,
            };
        },

        /**
         * @Author: 王林
         * @Date: 2020-08-11 22:21:51
         * @Desc: 检测游戏是否完成
         */
        checkPass() {
            if (this.ringList.endColRingList.length === this.ringNum) {
                this.passDialogVisible = true;
                clearTimeout(this.countTimer)
            }
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-09-22 21:34:47 
         * @Desc: 递归求解指定层数的汉诺塔解法与最少步骤 
         */
        resolveHannuota(num, start, transfer, end) {
            if (num <= 0) {
                return;
            }
            this.resolveHannuota(num - 1, start, end, transfer)
            this.autoStepList.push({
                from: start,
                to: end
            })
            this.minStepNum++
            this.resolveHannuota(num - 1, transfer, start, end)
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-09-22 22:37:04 
         * @Desc: 开始自动操作 
         */
        auto() {
            if (this.inGame) {
                this.$confirm('当前正在游戏中，是否重新开始自动操作', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        this.inGame = false
                        this.autoRun()
                    }).catch(() => {});
                return
            }
            this.autoRun()
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-10-03 09:50:09 
         * @Desc: 自动操作 
         */
        autoRun() {
            if (this.autoRuning) {
                this.$message.info('当前正在自动操作中')
                return;
            }
            this.initRing()
            this.autoRuning = true
            let index = 0
            let loop = async () => {
                if (index > this.autoStepList.length - 1) {
                    this.autoRuning = false
                    return;
                }
                let cur = this.autoStepList[index]
                await this.moveRing(cur)
                index++
                setTimeout(() => {
                    loop()
                }, 500);
            }
            setTimeout(() => {
                loop()
            }, 1000);
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-10-03 10:02:51 
         * @Desc: 返回上一步 
         */
        async goback() {
            if (this.historyList.length <= 0) {
                return
            }
            if (this.gobacking) {
                return
            }
            this.gobacking = true
            let cur = this.historyList.pop()
            await this.moveRing(cur)
            this.gobacking = false
        },

        /** 
         * @Author: 王林 
         * @Date: 2020-10-03 10:37:33 
         * @Desc: 移动圆环 
         */
        async moveRing(cur) {
            let columnIndex = propIndex[cur.to]
            this.dragColumnIndex = propIndex[cur.from]
            let dragIndex = this.ringList[cur.from].length - 1
            this.transition = "all 0.5s";
            this.dragOrder = this.ringList[cur.from][dragIndex].order
            await this.moveToNewPos(columnIndex, cur.from, dragIndex);
            this.dragToColumn(columnIndex, cur.from, dragIndex);
            this.transition = "none";
            this.dragPos.x = 0
            this.dragPos.y = 0
        }
    },
};
</script>

<style lang="less" scoped>
.container {
    position: absolute;
    left: 0px;
    top: 0;
    right: 0;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;

    .column {
        width: 20%;
        height: 40%;
        position: relative;
        margin: 0 10px;

        &.dragIn {
            transition: all 0.5s linear;
            background-color: #f5f5f5;
        }

        .col {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 10px;
            height: 100%;
            background-color: #1b262c;
        }

        .land {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 5px;
            background-color: #1b262c;
        }

        .name {
            position: absolute;
            left: 50%;
            bottom: -30px;
            transform: translateX(-50%);
            color: #1b262c;
            font-weight: bold;
            font-size: 20px;
        }

        .ringsBox {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 5px;

            .ring {
                position: absolute;
                z-index: 1999;
            }
        }
    }

    .footer {
        position: absolute;
        left: 20%;
        top: 75%;
        margin-left: -20px;
        width: 60%;
        z-index: 2000;

        .numSelectBox {
            display: flex;

            .numSelectItem {
                display: flex;
                align-items: center;
                margin-right: 50px;

                .selectBox {
                    width: 100px;
                }

                .value {
                    font-weight: bold;
                    color: #e97171;
                    margin-right: 5px;
                }
            }
        }

        .btnGroup {
            margin-top: 20px;
        }
    }
}

.passContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .passIcon {
        width: 100px;
    }

    .passInfoBox {
        margin-top: 20px;

        .count {
            font-size: 18px;
            color: #24a19c;
            font-weight: bold;
        }

        .percentage {
            font-size: 18px;
            color: #ff847c;
            font-weight: bold;
        }
    }
}

.ruleContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .ruleIcon {
        width: 100px;
        margin-bottom: 20px;
    }

    p {
        margin: 0;
        padding: 0;
        line-height: 2;
    }
}

.nav {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    justify-content: center;

    .navItem {
        font-size: 12px;
        margin: 0 5px;

        a {
            text-decoration: none;
            color: #333;
            line-height: 3;

            &:hover {
                color: lightcoral;
            }
        }
    }
}
</style>
