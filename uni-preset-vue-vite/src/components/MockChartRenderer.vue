<template>
  <scroll-view class="chart-scroll-container" scroll-y :style="{ height: height + 'px' }">
    <view class="mock-chart-container">
      <view class="chart-title" v-if="options.title">{{ options.title.text || options.title }}</view>
      
      <!-- 柱状图 -->
      <view v-if="options.type === 'bar'" class="chart-content">
        <view class="chart-description" v-if="options.description">{{ options.description }}</view>
        <view class="chart-wrapper" :style="{ height: chartHeight + 'px' }">
          <view class="bar-chart">
            <view v-for="(item, index) in getBarData()" :key="index" class="bar-item">
              <view class="bar-value">{{ item.value }}</view>
              <view class="bar" :style="{ 
                height: calculateBarHeight(item.value) + 'px',
                backgroundColor: getColor(index)
              }"></view>
              <view class="bar-label">{{ item.name }}</view>
            </view>
          </view>
        </view>
        
        <view class="chart-legend">
          <view v-for="(series, index) in options.data.series" :key="index" class="legend-item">
            <view class="legend-color" :style="{ backgroundColor: getColor(index) }"></view>
            <text class="legend-text">{{ series.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 折线图 -->
      <view v-else-if="options.type === 'line'" class="chart-content">
        <view class="chart-description" v-if="options.description">{{ options.description }}</view>
        <view class="chart-wrapper" :style="{ height: chartHeight + 'px' }">
          <view class="line-chart">
            <!-- 背景网格 -->
            <view class="grid-lines">
              <view v-for="i in 5" :key="i" class="grid-line"></view>
            </view>
            
            <!-- 为每个数据系列绘制折线 -->
            <view v-for="(series, seriesIndex) in getLineData()" :key="seriesIndex" class="line-series">
              <!-- 绘制连接线 -->
              <view class="line-path" :style="{ borderColor: getColor(seriesIndex) }">
                <view v-for="(point, pointIndex) in series.data" :key="pointIndex" 
                      class="line-segment"
                      v-if="pointIndex < series.data.length - 1"
                      :style="{
                        left: `${(pointIndex / (series.data.length - 1)) * 100}%`,
                        width: `${100 / (series.data.length - 1)}%`,
                        top: `${calculateLinePosition(pointIndex, seriesIndex)}%`,
                        height: '2px',
                        backgroundColor: getColor(seriesIndex)
                      }">
                </view>
              </view>
              
              <!-- 绘制数据点 -->
              <view v-for="(point, pointIndex) in series.data" :key="'point-'+pointIndex"
                    class="data-point"
                    :style="{
                      left: `${(pointIndex / (series.data.length - 1)) * 100}%`,
                      top: `${100 - calculateLineTop(point, seriesIndex)}%`,
                      backgroundColor: getColor(seriesIndex),
                      borderColor: getColor(seriesIndex)
                    }">
              </view>
            </view>
            
            <!-- X轴标签 -->
            <view class="x-axis">
              <text v-for="(label, index) in getXAxisLabels()" :key="index"
                    class="x-label"
                    :style="{ left: `${(index / (getXAxisLabels().length - 1)) * 100}%` }">
                {{ label }}
              </text>
            </view>
          </view>
        </view>
        
        <view class="chart-legend">
          <view v-for="(series, index) in getLineData()" :key="index" class="legend-item">
            <view class="legend-color" :style="{ backgroundColor: getColor(index) }"></view>
            <text class="legend-text">{{ series.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 饼图 -->
      <view v-else-if="options.type === 'pie'" class="chart-content">
        <view class="chart-description" v-if="options.description">{{ options.description }}</view>
        <view class="chart-wrapper" :style="{ height: chartHeight + 'px' }">
          <view class="pie-chart">
            <view class="pie">
              <view v-for="(item, index) in getPieData()" :key="index"
                    class="pie-slice"
                    :style="{
                      backgroundColor: getColor(index),
                      transform: `rotate(${getPieAngle(index)}deg)`,
                      clipPath: getPieClipPath(item, index)
                    }">
              </view>
            </view>
          </view>
        </view>
        
        <view class="chart-legend">
          <view v-for="(item, index) in getPieData()" :key="index" class="legend-item">
            <view class="legend-color" :style="{ backgroundColor: getColor(index) }"></view>
            <text class="legend-text">{{ item.name }}: {{ item.value }}%</text>
          </view>
        </view>
      </view>
      
      <view v-else class="chart-error">
        <text>不支持的图表类型: {{ options.type }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  name: 'MockChartRenderer',
  props: {
    options: {
      type: Object,
      required: true
    },
    height: {
      type: Number,
      default: 350
    }
  },
  data() {
    return {
      chartHeight: 250,
      colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9C64E9', '#36CFC9']
    };
  },
  methods: {
    // 柱状图数据
    getBarData() {
      if (!this.options.data || !this.options.data.series || !this.options.data.series[0]) {
        return [
          {name: '1月', value: 120},
          {name: '2月', value: 132},
          {name: '3月', value: 101},
          {name: '4月', value: 134},
          {name: '5月', value: 90},
          {name: '6月', value: 230}
        ];
      }
      
      const series = this.options.data.series[0];
      const xAxis = this.options.data.xAxis || [];
      
      return series.data.map((value, index) => ({
        name: xAxis[index] || `项目${index+1}`,
        value: value
      }));
    },
    
    // 折线图数据
    getLineData() {
      if (!this.options.data || !this.options.data.series) {
        return [{
          name: '系列1',
          data: [120, 132, 101, 134, 90, 230]
        }];
      }
      
      return this.options.data.series;
    },
    
    // X轴标签
    getXAxisLabels() {
      if (!this.options.data || !this.options.data.xAxis) {
        return ['1月', '2月', '3月', '4月', '5月', '6月'];
      }
      
      return this.options.data.xAxis;
    },
    
    // 饼图数据
    getPieData() {
      if (!this.options.data || !this.options.data.series) {
        return [
          {name: '高强度钢筋', value: 42},
          {name: '不锈钢', value: 28},
          {name: '结构钢', value: 18},
          {name: '合金钢', value: 12}
        ];
      }
      
      // 如果是直接提供的饼图数据格式
      if (this.options.data.series[0].value !== undefined) {
        return this.options.data.series;
      }
      
      // 如果是通过系列的第一个数据点作为饼图数据
      return this.options.data.series.map(item => ({
        name: item.name,
        value: Array.isArray(item.data) ? item.data[0] : item.data
      }));
    },
    
    // 计算柱高
    calculateBarHeight(value) {
      const data = this.getBarData();
      const maxValue = Math.max(...data.map(item => item.value));
      // 最大高度160px，最小高度20px
      return Math.max(20, (value / maxValue) * 160);
    },
    
    // 折线图计算线条位置
    calculateLinePosition(pointIndex, seriesIndex) {
      const series = this.getLineData()[seriesIndex];
      const point1 = series.data[pointIndex];
      const point2 = series.data[pointIndex + 1];
      const maxValue = Math.max(...series.data);
      
      const y1 = 100 - (point1 / maxValue) * 80;
      const y2 = 100 - (point2 / maxValue) * 80;
      
      // 返回线段中点的位置
      return (y1 + y2) / 2;
    },
    
    // 计算折线点的顶部位置
    calculateLineTop(value, seriesIndex) {
      const series = this.getLineData()[seriesIndex];
      const maxValue = Math.max(...series.data);
      return (value / maxValue) * 80; // 使用80%的高度，留出空间
    },
    
    // 饼图角度计算
    getPieAngle(index) {
      const data = this.getPieData();
      let angleSum = 0;
      
      for (let i = 0; i < index; i++) {
        angleSum += (data[i].value / 100) * 360;
      }
      
      return angleSum;
    },
    
    // 生成饼图切片路径
    getPieClipPath(item, index) {
      const data = this.getPieData();
      const totalValue = data.reduce((sum, item) => sum + item.value, 0);
      
      // 标准化百分比
      const percentage = (item.value / totalValue) * 100;
      const angle = (percentage / 100) * 360;
      
      // 生成切片路径
      if (angle <= 90) {
        return `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan(angle * Math.PI / 180)}% 0%)`;
      } else if (angle <= 180) {
        return `polygon(50% 50%, 50% 0%, 100% 0%, 100% ${50 - 50 * Math.tan((180 - angle) * Math.PI / 180)}%)`;
      } else if (angle <= 270) {
        return `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, ${50 - 50 * Math.tan((angle - 180) * Math.PI / 180)}% 100%)`;
      } else {
        return `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${50 - 50 * Math.tan((360 - angle) * Math.PI / 180)}%)`;
      }
    },
    
    // 获取颜色
    getColor(index) {
      return this.colors[index % this.colors.length];
    }
  }
};
</script>

<style>
.chart-scroll-container {
  width: 100%;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mock-chart-container {
  padding: 20rpx;
  box-sizing: border-box;
  width: 100%;
}

.chart-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333;
}

.chart-description {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.chart-content {
  position: relative;
  margin-bottom: 30rpx;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  margin: 20rpx 0 40rpx;
}

/* 柱状图样式 */
.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 40rpx;
  position: relative;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 50rpx;
}

.bar {
  width: 40rpx;
  border-radius: 6rpx 6rpx 0 0;
}

.bar-value {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.bar-label {
  position: absolute;
  bottom: -30rpx;
  font-size: 24rpx;
  color: #666;
  width: 60rpx;
  text-align: center;
  white-space: nowrap;
}

/* 折线图样式 */
.line-chart {
  position: relative;
  height: 100%;
  padding: 20rpx 0 60rpx;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: rgba(0,0,0,0.05);
}

.grid-line:nth-child(1) { top: 0%; }
.grid-line:nth-child(2) { top: 20%; }
.grid-line:nth-child(3) { top: 40%; }
.grid-line:nth-child(4) { top: 60%; }
.grid-line:nth-child(5) { top: 80%; }

.line-series {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.line-path {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.line-segment {
  position: absolute;
  height: 2px;
  z-index: 2;
}

.data-point {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  border: 2px solid #fff;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.x-axis {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 40rpx;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 24rpx;
  color: #666;
  text-align: center;
  bottom: 0;
}

/* 饼图样式 */
.pie-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.pie {
  position: relative;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  overflow: hidden;
}

.pie-slice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center;
}

/* 图例样式 */
.chart-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 20rpx 15rpx;
}

.legend-color {
  width: 24rpx;
  height: 12rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;
}

.legend-text {
  font-size: 24rpx;
  color: #666;
}

.chart-error {
  padding: 40rpx;
  text-align: center;
  color: #F56C6C;
}
</style> 