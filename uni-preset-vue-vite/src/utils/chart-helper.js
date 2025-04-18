/**
 * 将简单数据格式转换为完整的uCharts配置
 * @param {Object} data 服务器返回的简单数据格式
 * @param {String} type 图表类型，默认为'column'
 * @param {String} title 图表标题
 * @returns {Object} 完整的uCharts配置对象
 */
export function convertToChartOptions(data, type = 'column', title = '') {
  if (!data || !data.categories || !data.series) {
    console.error('数据格式不正确');
    return null;
  }
  
  // 创建基本配置
  const chartOptions = {
    type: type,
    title: {
      text: title,
      fontSize: 16,
      color: '#333333'
    },
    data: {
      xAxis: data.categories,
      series: data.series
    },
    padding: [30, 60, 40, 80],
    background: '#ffffff',
    enableScroll: false,
    xAxis: {
      show: true,
      axisLine: true,
      axisLineColor: '#cccccc',
      fontColor: '#666666',
      fontSize: 12,
      disableGrid: true,
      margin: 15
    },
    yAxis: {
      show: true,
      data: [{
        min: 0,
        // 可选：动态计算合适的最大值
        max: Math.ceil(Math.max(...data.series.flatMap(s => s.data)) * 1.2),
        fontColor: '#666666',
        fontSize: 12
      }],
      axisLine: true,
      axisLineColor: '#cccccc',
      gridType: 'line',
      gridColor: '#f0f0f0'
    },
    legend: {
      show: true,
      position: 'top',
      float: 'center',
      itemGap: 20,
      fontColor: '#666666',
      fontSize: 12,
      padding: 15,
      margin: 5
    },
    color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']
  };
  
  // 根据图表类型添加特定配置
  switch(type.toLowerCase()) {
    case 'column':
      chartOptions.extra = {
        column: {
          type: 'group',
          width: 20,
          seriesGap: 4,
          categoryGap: 12,
          barBorderRadius: [3, 3, 0, 0]
        }
      };
      break;
      
    case 'line':
      chartOptions.extra = {
        line: {
          type: 'straight',
          width: 2,
          smooth: false
        }
      };
      break;
      
    // 其他图表类型的特定配置
  }
  
  // 在返回前增强配置
  return enhanceChartConfig(chartOptions);
}

/**
 * 在配置应用到图表前增强图表配置
 * @param {Object} chartOptions 原始图表配置
 * @returns {Object} 增强后的配置
 */
export function enhanceChartConfig(chartOptions) {
  // 这里可以复用上面的 enhanceChartConfiguration 函数的逻辑
  if (!chartOptions || !chartOptions.type) return chartOptions;
  
  // 克隆配置以避免修改原对象
  const config = JSON.parse(JSON.stringify(chartOptions));
  
  // 确保有合理的内边距，防止标签溢出
  if (!config.padding || config.padding.length < 4) {
    config.padding = [30, 60, 40, 60]; // 上,右,下,左
  }
  
  // 确保背景色设置
  config.background = config.background || '#ffffff';
  config.enableScroll = false;
  
  // 针对柱状图的优化
  if (config.type.toLowerCase() === 'column') {
    // 调整X轴
    if (!config.xAxis) config.xAxis = {};
    config.xAxis = {
      show: true,
      axisLine: true,
      axisLineColor: '#cccccc',
      fontColor: '#666666',
      fontSize: 12,
      disableGrid: true,
      margin: 15,
      ...config.xAxis
    };
    
    // 调整Y轴
    if (!config.yAxis) config.yAxis = {};
    config.yAxis = {
      show: true,
      axisLine: true,
      axisLineColor: '#cccccc',
      gridType: 'none',
      ...config.yAxis
    };
    
    // 确保Y轴数据配置
    if (!config.yAxis.data || !config.yAxis.data.length) {
      config.yAxis.data = [{
        min: 0,
        fontColor: '#666666',
        fontSize: 12
      }];
    }
    
    // 增强柱状图配置
    if (!config.extra) config.extra = {};
    if (!config.extra.column) config.extra.column = {};
    
    const defaultColumnConfig = {
      type: 'group',
      width: 20,
      seriesGap: 4,
      categoryGap: 15,
      barBorderRadius: [3, 3, 0, 0]
    };
    
    config.extra.column = { ...defaultColumnConfig, ...config.extra.column };
  }
  
  // 增强图例配置
  if (!config.legend) config.legend = {};
  const defaultLegendConfig = {
    show: true,
    position: 'top',
    float: 'center',
    itemGap: 20,
    fontColor: '#666666',
    fontSize: 12,
    padding: 5,
    margin: 5
  };
  
  config.legend = { ...defaultLegendConfig, ...config.legend };
  
  return config;
} 