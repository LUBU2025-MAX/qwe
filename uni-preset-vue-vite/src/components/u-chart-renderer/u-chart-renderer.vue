<template>
  <view :style="{ height: height + 'px' }" class="chart-renderer">
    <qiun-data-charts 
      type="column"
      :chartData="chartData"
      :opts="enhancedOptions"
      :errorShow="errorShow"
    />
  </view>
</template>

<script>
/**
 * 图表渲染器组件
 * 用于渲染各种类型的图表
 */
// 修改引入方式
// import * as echarts from '../../components/u-charts/u-charts.min.js';
import uCharts from '../../components/u-charts/u-charts.min.js';

export default {
  name: 'UChartRenderer',
  
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: Number,
      default: 400
    }
  },
  
  data() {
    return {
      chartData: {},
      errorShow: false
    };
  },
  
  computed: {
    // 在组件内部计算增强后的配置，而不是在外部处理
    enhancedOptions() {
      if (!this.options) return {};
      
      // 创建配置副本
      const enhanced = JSON.parse(JSON.stringify(this.options));
      
      // 确保基础设置
      enhanced.padding = enhanced.padding || [30, 60, 40, 80];
      enhanced.background = enhanced.background || '#ffffff';
      enhanced.enableScroll = false;
      
      // 处理坐标轴
      if (enhanced.xAxis) {
        enhanced.xAxis.disableGrid = true;
        enhanced.xAxis.axisLine = true;
        enhanced.xAxis.axisLineColor = '#cccccc';
        enhanced.xAxis.margin = 15;
        enhanced.xAxis.fontSize = enhanced.xAxis.fontSize || 12;
      }
      
      if (enhanced.yAxis) {
        enhanced.yAxis.gridType = 'none';
        enhanced.yAxis.axisLine = true;
        enhanced.yAxis.axisLineColor = '#cccccc';
        
        // 确保Y轴数据配置
        if (!enhanced.yAxis.data || !enhanced.yAxis.data.length) {
          enhanced.yAxis.data = [{
            min: 0,
            fontColor: '#666666',
            fontSize: 12
          }];
        }
      }
      
      // 针对柱状图的特殊处理
      if (enhanced.type === 'column' && (!enhanced.extra || !enhanced.extra.column)) {
        if (!enhanced.extra) enhanced.extra = {};
        if (!enhanced.extra.column) enhanced.extra.column = {};
        
        enhanced.extra.column = {
          type: 'group',
          width: 20,
          seriesGap: 4,
          categoryGap: 15,
          barBorderRadius: [3, 3, 0, 0],
          ...enhanced.extra.column
        };
      }
      
      // 增强图例配置
      if (!enhanced.legend) enhanced.legend = {};
      enhanced.legend = {
        show: true,
        position: 'top',
        float: 'center',
        itemGap: 20,
        fontColor: '#666666',
        fontSize: 12,
        padding: 5,
        margin: 5,
        ...enhanced.legend
      };
      
      return enhanced;
    }
  },
  
  watch: {
    options: {
      handler(newVal) {
        this.initChart(newVal);
      },
      immediate: true,
      deep: true
    }
  },
  
  mounted() {
    // 打印接收到的选项
    console.log('图表组件收到的选项:', JSON.stringify(this.options, null, 2));
    
    // 检查选项完整性
    this.validateOptions();
    
    // 如果选项有效，初始化图表
    if (!this.errorShow) {
      this.$nextTick(() => {
        setTimeout(() => {
          this.initChart(this.options);
        }, 300);
      });
    }
  },
  
  beforeDestroy() {
    // 清理图表实例
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  },
  
  methods: {
    /**
     * 验证图表选项的完整性
     */
    validateOptions() {
      try {
        // 检查基本选项
        if (!this.options) {
          this.errorShow = true;
          return;
        }
        
        if (!this.options.type) {
          this.errorShow = true;
          return;
        }
        
        if (!this.options.data) {
          this.errorShow = true;
          return;
        }
        
        // 基于图表类型的特定检查
        switch (this.options.type) {
          case 'pie':
            // 确保pie图表有必要的配置
            if (!this.options.extra || !this.options.extra.pie) {
              console.warn('饼图缺少extra.pie配置，自动添加');
              if (!this.options.extra) this.options.extra = {};
              this.options.extra.pie = {
                labelWidth: 15,
                activeRadius: 10,
                offsetAngle: 0,
                legendWidth: 15,
                labelCenterPosition: false
              };
            }
            break;
            
          // 可添加其他图表类型的验证
        }
      } catch (err) {
        this.errorShow = true;
        console.error('图表选项验证错误:', err);
      }
    },
    
    initChart(options) {
      try {
        if (!options) return;
        
        // 设置图表数据
        this.chartData = {
          categories: options.data?.xAxis || [],
          series: options.data?.series || []
        };
        
        this.errorShow = false;
      } catch (error) {
        console.error('图表初始化错误:', error);
        this.errorShow = true;
      }
    },
    
    // 渲染图表 - 使用新的方法
    renderChart() {
      if (!this.chart) {
        this.errorShow = true;
        return;
      }
      
      if (!this.options) {
        this.errorShow = true;
        return;
      }
      
      try {
        console.log('更新图表数据');
        
        // 更新数据
        this.chart.updateData({
          categories: this.getCategories(),
          series: this.getSeries()
        });
        
        console.log('图表渲染完成');
        
        this.errorShow = false;
      } catch (err) {
        this.errorShow = true;
        console.error('渲染图表错误:', err);
      }
    },
    
    // 获取分类数据
    getCategories() {
      if (!this.options || !this.options.data) return [];
      
      if (this.options.type === 'pie') {
        return [];
      }
      
      return this.options.data.xAxis || [];
    },
    
    // 获取系列数据
    getSeries() {
      if (!this.options || !this.options.data) {
        console.log('没有数据');
        return [];
      }
      
      console.log('原始数据:', JSON.stringify(this.options.data));
      
      const series = this.options.data.series || [];
      
      if (this.options.type === 'pie') {
        // 饼图数据结构调整
        if (series.length > 0 && series[0].data) {
          const pieData = series[0].data.map(item => ({
            name: item.name,
            data: item.value
          }));
          console.log('处理后的饼图数据:', pieData);
          return pieData;
        }
      } else {
        // 柱状图和折线图数据结构调整
        const formattedSeries = series.map(item => {
          return {
            name: item.name || '',
            data: item.data || [],
            color: item.color
          };
        });
        console.log('处理后的数据系列:', formattedSeries);
        return formattedSeries;
      }
      
      return [];
    }
  }
};
</script>

<style>
.chart-renderer {
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style> 