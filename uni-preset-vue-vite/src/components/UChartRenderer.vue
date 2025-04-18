<template>
  <view :style="{ height: height + 'px' }" class="chart-container">
    <view v-if="options && options.title" class="chart-title">
      {{ options.title.text || '' }}
    </view>
    
    <!-- 图表画布 -->
    <canvas
      :id="canvasId"
      :canvas-id="canvasId"
      class="chart-canvas"
      :style="{ height: (height - (options && options.title ? 40 : 0)) + 'px' }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    />
    
    <!-- 错误提示 -->
    <view v-if="errorMessage" class="chart-error">
      <text>{{ errorMessage }}</text>
    </view>
    
    <!-- 渲染状态显示 - 调试用 -->
    <view v-if="debug" class="render-debug">
      <text>状态: {{renderState}}</text>
    </view>
  </view>
</template>

<script>
/**
 * 专业图表渲染组件
 * @description 使用uCharts库渲染专业风格图表，支持横向滚动
 */
import uCharts from '../u-charts/u-charts.min.js';
// 或尝试
// import uCharts from '@/components/u-charts/u-charts.min.js';

export default {
  name: 'UChartRenderer',
  
  props: {
    options: {
      type: Object,
      required: true
    },
    canvasId: {
      type: String,
      default: 'uchart'
    },
    height: {
      type: [Number, String],
      default: 250
    },
    // 添加调试标志
    debug: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      chartInstance: null,
      errorMessage: '',
      inited: false,
      renderState: '准备中',  // 新增渲染状态跟踪
      canvasNode: null,      // 保存画布节点引用
      canvasContext: null    // 保存画布上下文
    };
  },
  
  watch: {
    options: {
      handler(newVal) {
        console.log('图表选项变更:', newVal ? newVal.type : 'undefined');
        if (this.inited) {
          this.updateChart();
        } else {
          this.initChart();
        }
      },
      deep: true
    }
  },
  
  mounted() {
    if (this.debug) {
      console.log('🖼️ 图表组件初始化:', {
        canvasId: this.canvasId,
        options: this.options
      });
    }
    
    // 确保DOM已经渲染完成
    setTimeout(() => {
      this.initChart();
    }, 300);  // 延长延迟时间以确保canvas已准备好
  },
  
  methods: {
    /**
     * 初始化图表
     */
    initChart() {
      this.errorMessage = '';
      this.renderState = '开始初始化';
      
      // 验证选项
      if (!this.options) {
        this.setError('图表选项为空');
        return;
      }
      
      try {
        console.log('开始初始化图表:', this.canvasId);
        
        // 获取画布上下文 - 改用新的uni方法
        const query = uni.createSelectorQuery().in(this);
        query.select('#' + this.canvasId)
          .fields({ node: true, size: true, context: true })
          .exec(res => {
            if (!res || !res[0]) {
              this.setError('无法找到Canvas节点');
              return;
            }
            
            const canvasInfo = res[0];
            console.log('Canvas信息:', canvasInfo);
            
            this.renderState = '获取到Canvas节点';
            this.canvasNode = canvasInfo;
            
            try {
              // 使用新的方式获取上下文
              const ctx = uni.createCanvasContext(this.canvasId, this);
              
              if (!ctx) {
                this.setError('无法创建Canvas上下文');
                return;
              }
              
              this.canvasContext = ctx;
              this.renderState = '创建上下文成功';
              
              // 准备图表配置
              const chartOpts = this.prepareChartOptions(this.options);
              
              if (!chartOpts) {
                this.setError('无法处理图表配置');
                return;
              }
              
              this.renderState = '配置准备完成';
              
              // 确保先清空画布
              this.canvasContext.clearRect(0, 0, canvasInfo.width, canvasInfo.height);
              
              // 创建图表实例
              try {
                this.chartInstance = new uCharts({
                  $this: this,
                  canvasId: this.canvasId,
                  context: this.canvasContext,
                  width: canvasInfo.width || 375,
                  height: canvasInfo.height || 250,
                  ...chartOpts
                });
                
                // 强制绘制并执行draw操作
                this.chartInstance.draw(true);
                this.canvasContext.draw(true); // 确保在小程序环境下绘制
                
                this.renderState = '图表绘制完成';
                this.inited = true;
                
                // 通知渲染成功
                this.$emit('rendered', { success: true });
                
                console.log('图表渲染完成:', this.canvasId);
                
                // 在初始化成功后添加延迟重绘
                setTimeout(() => {
                  if (this.chartInstance) {
                    console.log('执行延迟重绘');
                    this.chartInstance.draw(true);
                    
                    // 如果还是没显示，尝试重新初始化canvas
                    setTimeout(() => {
                      if (this.canvasContext) {
                        this.canvasContext.draw(true);
                      }
                    }, 50);
                  }
                }, 500);
              } catch (chartError) {
                console.error('创建图表实例失败:', chartError);
                this.setError('创建图表实例失败: ' + chartError.message);
              }
            } catch (ctxError) {
              console.error('创建上下文失败:', ctxError);
              this.setError('创建上下文失败: ' + ctxError.message);
            }
          });
        
      } catch (e) {
        console.error('图表初始化过程中发生错误:', e);
        this.setError('图表初始化错误: ' + e.message);
      }
    },
    
    /**
     * 设置错误并发出事件
     */
    setError(message) {
      this.errorMessage = message;
      this.renderState = '错误: ' + message;
      console.error(message);
      this.$emit('error', new Error(message));
    },
    
    /**
     * 准备图表选项
     */
    prepareChartOptions(opts) {
      if (!opts || !opts.type) {
        return null;
      }
      
      const chartOpts = {
        type: opts.type,
        title: opts.title,
        padding: opts.padding || [15, 15, 15, 15],
        legend: opts.legend || { show: true },
        dataLabel: opts.dataLabel !== false,
        color: opts.color,
        enableScroll: !!opts.enableScroll,
        enableMarkLine: !!opts.enableMarkLine,
        animation: true,
        extra: opts.extra || {}
      };
      
      // 检查基本数据格式
      if (!opts.data) {
        this.setError('图表数据为空');
        return null;
      }
      
      // 数据格式处理
      if (opts.type === 'pie') {
        // 饼图特殊处理
        if (!opts.data.series || !Array.isArray(opts.data.series)) {
          this.setError('饼图需要series数组');
          return null;
        }
        
        chartOpts.series = opts.data.series.map(item => ({
          name: item.name,
          data: item.value || item.data
        }));
        
      } else {
        // 柱状图、折线图等通用格式
        if (!opts.data.xAxis || !Array.isArray(opts.data.xAxis)) {
          this.setError(`${opts.type}图表需要xAxis数组`);
          return null;
        }
        
        if (!opts.data.series || !Array.isArray(opts.data.series)) {
          this.setError(`${opts.type}图表需要series数组`);
          return null;
        }
        
        chartOpts.categories = opts.data.xAxis;
        chartOpts.series = opts.data.series;
        
        // Y轴设置
        chartOpts.yAxis = opts.yAxis || {
          data: [{ min: 0 }],
          showTitle: true,
          gridType: 'dash'
        };
      }
      
      return chartOpts;
    },
    
    /**
     * 手动重新绘制图表
     */
    redraw() {
      if (this.chartInstance && typeof this.chartInstance.draw === 'function') {
        try {
          this.chartInstance.draw();
          return true;
        } catch (e) {
          console.error('重绘图表失败:', e);
          return false;
        }
      }
      return false;
    },
    
    /**
     * 更新图表
     */
    updateChart() {
      if (!this.chartInstance) {
        this.initChart();
        return;
      }
      
      try {
        // 准备新数据
        const series = this.options.data?.series || [];
        const categories = this.options.data?.xAxis || [];
        
        // 更新图表
        this.chartInstance.updateData({
          series: series,
          categories: categories
        });
        
        console.log('图表数据已更新');
      } catch (e) {
        console.error('图表更新失败:', e);
        this.setError('图表更新失败: ' + e.message);
      }
    },
    
    /**
     * 触摸事件处理
     */
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
    },
    // 根据不同运行环境调整初始化方法
    initForPlatform() {
      const systemInfo = uni.getSystemInfoSync();
      
      if (systemInfo.platform === 'devtools' || systemInfo.platform === 'wechat') {
        // 微信小程序环境
        console.log('微信小程序环境初始化');
        this.initForMiniProgram();
      } else if (systemInfo.platform === 'h5') {
        // H5环境
        console.log('H5环境初始化');  
        this.initForH5();
      } else {
        // App环境
        console.log('App环境初始化');
        this.initForApp();
      }
    }
  }
};
</script>

<style>
.chart-container {
  width: 100%;
  position: relative;
  margin: 10px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #FFFFFF;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.chart-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
  color: #333333;
}

.chart-canvas {
  width: 100%;
  display: block;
}

.chart-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.render-debug {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 2px 5px;
  font-size: 10px;
  border-radius: 3px;
}
</style>