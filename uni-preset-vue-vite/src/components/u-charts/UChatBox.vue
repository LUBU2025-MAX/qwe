<template>
  <view class="uchat-container" :style="{ height: height + 'px' }">
    <view class="uchat-title" v-if="chartTitle">{{ chartTitle }}</view>
    <view class="uchat-wrapper" :style="{ height: `${canvasHeight}px` }">
      <canvas 
        class="uchat-canvas" 
        :id="canvasId" 
        :canvas-id="canvasId" 
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      ></canvas>
    </view>
  </view>
</template>

<script>
/**
 * uCharts图表渲染组件
 * @description 基于uCharts实现的图表渲染组件
 */
import uCharts from './u-charts.js';
import cfu from './config-ucharts.js';

export default {
  name: 'UChatBox',
  props: {
    // 图表类型
    chartType: {
      type: String,
      default: 'column'
    },
    // 图表数据
    chartData: {
      type: Object,
      required: true
    },
    // 图表标题
    chartTitle: {
      type: String,
      default: ''
    },
    // 图表高度
    height: {
      type: Number,
      default: 300
    },
    // 图表配置
    opts: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      canvasId: `uchart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      chartInstance: null,
      canvasWidth: 375,
      canvasHeight: 250,
      pixelRatio: 1
    };
  },
  mounted() {
    // 首次挂载时初始化
    this.initChart();
  },
  methods: {
    // 初始化图表
    initChart() {
      try {
        // 获取系统信息
        const sysInfo = uni.getSystemInfoSync();
        this.pixelRatio = sysInfo.pixelRatio || 1;
        
        // 延迟执行，确保Canvas已渲染
        setTimeout(() => {
          this.getCanvasContext();
        }, 300);
      } catch (e) {
        console.error('初始化图表失败:', e);
      }
    },
    
    // 获取Canvas上下文并绘制图表
    getCanvasContext() {
      // 获取Canvas元素尺寸
      const query = uni.createSelectorQuery().in(this);
      query.select(`#${this.canvasId}`)
        .boundingClientRect(res => {
          if (!res) {
            // 如果获取失败，延迟重试
            setTimeout(() => this.getCanvasContext(), 100);
            return;
          }
          
          this.canvasWidth = res.width;
          this.canvasHeight = res.height;
          
          // 获取Canvas上下文
          const ctx = uni.createCanvasContext(this.canvasId, this);
          if (!ctx) {
            console.error('获取Canvas上下文失败');
            return;
          }
          
          // 渲染图表
          this.drawChart(ctx);
        })
        .exec();
    },
    
    // 绘制图表
    drawChart(ctx) {
      console.log('开始绘制图表:', this.chartType);
      
      // 准备数据
      const chartData = {
        categories: this.chartData.categories || [],
        series: this.chartData.series || []
      };
      
      // 准备图表选项
      const chartOpts = this.prepareChartOptions(ctx, chartData);
      
      // 创建图表实例
      try {
        this.chartInstance = new uCharts(chartOpts);
        this.chartInstance.draw();
        console.log('图表绘制完成');
      } catch (e) {
        console.error('绘制图表时出错:', e);
      }
    },
    
    // 准备图表选项
    prepareChartOptions(ctx, chartData) {
      // 基础配置
      const baseOpts = {
        $this: this,
        context: ctx, 
        width: this.canvasWidth,
        height: this.canvasHeight,
        pixelRatio: this.pixelRatio,
        categories: chartData.categories,
        series: chartData.series,
        animation: true,
        background: '#FFFFFF',
        padding: cfu.common.padding,
        enableScroll: this.opts.enableScroll || false,
        type: this.chartType,
        title: {
          name: this.chartTitle,
          fontSize: 15,
          color: '#666666'
        }
      };
      
      // 合并自定义配置
      const chartOpts = {
        ...baseOpts,
        legend: this.opts.legend || cfu.common.legend,
        xAxis: this.opts.xAxis || cfu.common.xAxis,
        yAxis: this.opts.yAxis || cfu.common.yAxis,
        extra: this.getExtraOptions()
      };
      
      return chartOpts;
    },
    
    // 获取额外选项配置
    getExtraOptions() {
      // 根据图表类型返回不同的额外配置
      const defaultExtra = cfu.common.extra;
      const customExtra = this.opts.extra || {};
      
      if (this.chartType === 'column') {
        return {
          ...defaultExtra.column,
          ...customExtra.column
        };
      } else if (this.chartType === 'line') {
        return {
          ...defaultExtra.line,
          ...customExtra.line
        };
      } else if (this.chartType === 'pie') {
        return {
          ...defaultExtra.pie,
          ...customExtra.pie
        };
      }
      
      return customExtra;
    },
    
    // 更新图表数据
    updateChart(newData) {
      if (!this.chartInstance) {
        return;
      }
      
      this.chartInstance.updateData({
        categories: newData.categories || [],
        series: newData.series || []
      });
    },
    
    // 处理触摸事件
    touchStart(e) {
      if (this.chartInstance && this.chartInstance.touchStart) {
        this.chartInstance.touchStart(e);
      }
    },
    touchMove(e) {
      if (this.chartInstance && this.chartInstance.touchMove) {
        this.chartInstance.touchMove(e);
      }
    },
    touchEnd(e) {
      if (this.chartInstance && this.chartInstance.touchEnd) {
        this.chartInstance.touchEnd(e);
      }
    }
  },
  watch: {
    // 监视数据变化
    chartData: {
      handler(newVal) {
        if (this.chartInstance) {
          this.updateChart(newVal);
        }
      },
      deep: true
    },
    // 监视图表类型变化
    chartType() {
      // 图表类型变化时重新初始化
      if (this.chartInstance) {
        setTimeout(() => {
          this.getCanvasContext();
        }, 100);
      }
    }
  }
};
</script>

<style>
.uchat-container {
  width: 100%;
  position: relative;
  margin: 20rpx 0;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  padding: 20rpx;
  box-sizing: border-box;
}

.uchat-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #333;
}

.uchat-wrapper {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.uchat-canvas {
  width: 100%;
  height: 100%;
}
</style> 