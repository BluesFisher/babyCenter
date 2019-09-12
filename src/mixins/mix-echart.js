import wepy from 'wepy';
import * as echarts from 'assets/js/echarts';
import WxCanvas from 'assets/js/wx-canvas';

export default class EchartMixin extends wepy.mixin {
    data = {
        ec: {
            lazyLoad: false
        },
        preParamsIndex: ''
    };

    chartDemo = null;
    ctx = null;
    mixToolTip = {
        trigger: 'axis',
        triggerOn: 'mousemove',
        backgroundColor: '#efefef',
        textStyle: {
            color: '#3F4659',
            fontSize: 6,
            fontFamily: 'PingFangSC-Regular'
        },
        formatter: params => {
            const date = params[0].name.replace('\n', '.');
            let tooltip = `时间：${date}`;
            params.map(item => {
                tooltip += `\n${item.seriesName}：${item.value}`;
            });
            return tooltip;
        },
        position: point => {
            return [Math.min(240, point[0]), Math.min(150, point[1])];
        }
    };

    mixCommonOption() {
        return {
            tooltip: this.mixToolTip,
            grid: {
                left: '2%',
                right: '2%',
                bottom: '12%',
                top: '6%',
                containLabel: true
            }
        };
    }

    mixCommonXAxis(xAxisData) {
        return [
            {
                type: 'category',
                axisTick: { show: false },
                data: xAxisData,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#BCBCBC',
                        fontSize: '8'
                    }
                }
            }
        ];
    }

    mixCommonYAxis(isPercent = false) {
        return [
            {
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#BCBCBC',
                        fontSize: '10'
                    },
                    formatter: isPercent ? '{value}%' : '{value}'
                },
                splitLine: {
                    lineStyle: {
                        color: '#E5E5E5',
                        width: '1'
                    }
                },
                splitNumber: 2
            }
        ];
    }
    mixCommonLegend = {
        bottom: 0,
        left: 'center',
        z: 100,
        textStyle: {
            color: '#3F4659',
            fontSize: 10,
            fontFamily: 'PingFangSC-Regular'
        },
        inactiveColor: '#BCBCBC',
        icon: 'recrt',
        itemWidth: 10, // 设置宽度
        itemHeight: 2, // 设置高度
        itemGap: 20 // 设置间距
    };

    mixEchartOnLoad() {
        this.ec['onInit'] = (canvas, width, height, chartParams) =>
            this.initChart(canvas, width, height, chartParams);
        this.$apply();

        if (!this.ec) {
            console.warn(
                '组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" ' +
                    'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>'
            );
            return;
        }

        if (!this.ec.lazyLoad) {
            this.init();
        }
    }

    refreshChart(chartParams) {
        this.chartDemo && this.setOption(chartParams);
    }

    initChart(canvas, width, height, chartParams) {
        this.chartDemo = echarts.init(canvas, null, {
            width: width,
            height: height
        });

        canvas.setChart(this.chartDemo);
        this.setOption(chartParams);

        this.chartDemo.getOption().series[0].type === 'pie' &&
            this.chartDemo.on('mousemove', params => {
                if (this.preParamsIndex !== params.dataIndex) {
                    this.preParamsIndex = params.dataIndex;
                    this.clickFunc && this.clickFunc(params);
                    !this.isIos && this.mixSetToolTipHideTimer();
                }
            });

        return this.chartDemo;
    }

    init(chartParams, callback) {
        this.ctx = wepy.createCanvasContext(this.data.canvasId, this);
        const canvas = new WxCanvas(this.ctx, this.data.canvasId);
        echarts.setCanvasCreator(() => {
            return canvas;
        });
        wepy.createSelectorQuery()
            .select(`.${this.canvasId}`)
            .boundingClientRect()
            .exec(data => {
                let res = data[0];
                if (!res || !res.width) return;
                if (typeof callback === 'function') {
                    this.chart = callback(canvas, res.width, res.height);
                } else if (
                    this.data.ec &&
                    typeof this.data.ec.onInit === 'function'
                ) {
                    this.chart = this.data.ec.onInit(
                        canvas,
                        res.width,
                        res.height,
                        chartParams
                    );
                }
            });
    }

    canvasToTempFilePath(opt) {
        if (!opt.canvasId) {
            opt.canvasId = this.data.canvasId;
        }
        this.ctx.draw(true, () => {
            wepy.canvasToTempFilePath(opt, this);
        });
    }
    wrapTouch(event) {
        for (let i = 0; i < event.touches.length; ++i) {
            const touch = event.touches[i];
            touch.offsetX = touch.x;
            touch.offsetY = touch.y;
        }
        return event;
    }

    mixSetToolTipHideTimer() {
        this.hideTimer && clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            this.hideTips();
        }, 2000);
    }

    hideTips() {
        if (this.display && this.display !== 'none') {
            this.hideTimer && clearTimeout(this.hideTimer);
            this.display = 'none';
            this.chartDemo &&
                this.chartDemo._dom.canvasId === 'pie-chart' &&
                this.chartDemo.dispatchAction({
                    type: 'pieUnSelect',
                    seriesIndex: 0
                });
            this.preParamsIndex = '';
            this.$apply();
        }
    }

    methods = {
        touchStart(e) {
            if (this.chart && e.touches.length > 0) {
                var touch = e.touches[0];
                var handler = this.chart.getZr().handler;
                handler.dispatch('mousedown', {
                    zrX: touch.x,
                    zrY: touch.y
                });
                handler.dispatch('mousemove', {
                    zrX: touch.x,
                    zrY: touch.y
                });
                handler.processGesture(this.wrapTouch(e), 'start');
            }
        },

        touchMove(e) {
            if (this.chart && e.touches.length > 0) {
                var touch = e.touches[0];
                var handler = this.chart.getZr().handler;
                handler.dispatch('mousemove', {
                    zrX: touch.x,
                    zrY: touch.y
                });
                handler.processGesture(this.wrapTouch(e), 'change');
            }
        },

        touchEnd(e) {
            if (this.chart) {
                const touch = e.changedTouches ? e.changedTouches[0] : {};
                var handler = this.chart.getZr().handler;
                handler.dispatch('mouseup', {
                    zrX: touch.x,
                    zrY: touch.y
                });
                handler.dispatch('click', {
                    zrX: touch.x,
                    zrY: touch.y
                });
                handler.processGesture(this.wrapTouch(e), 'end');
            }

            this.isIos && this.hideTips && this.hideTips();
        }
    };
}
