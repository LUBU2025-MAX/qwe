/**
 * 图表处理工具函数
 * 用于从服务器响应中提取和处理图表数据
 */
import { renderMarkdown } from './markdown'; // 确保导入markdown渲染函数

/**
 * 将标准图表数据结构转换为前端可识别的图表配置
 * @param {Object} standardData - 标准图表数据结构
 * @param {string} chartType - 图表类型，可选值：'line'、'bar'、'column'、'pie'等
 * @param {string} title - 图表标题
 * @param {Object} extraOptions - 额外配置选项
 * @returns {Object} 前端可识别的图表配置
 */
const convertToChartOptions = (standardData, chartType = 'line', title = '数据图表', extraOptions = {}) => {
  // 检查数据有效性
  if (!standardData || !standardData.categories || !standardData.series) {
    console.error('无效的图表数据结构');
    return null;
  }
  
  console.log('📊 转换标准数据为图表配置，类型:', chartType);
  
  // 创建基础图表配置
  let chartOptions = {
    type: chartType,
    title: {
      text: title,
      fontSize: 16,
      color: '#333333'
    },
    padding: [15, 30, 15, 30],
    background: '#ffffff',
    enableScroll: false,
    color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'],
    legend: {
      show: true,
      position: 'top',
      float: 'center'
    }
  };
  
  // 根据图表类型设置不同的数据格式
  if (chartType === 'pie') {
    // 饼图特殊处理
    chartOptions.data = {
      series: standardData.categories.map((category, index) => ({
        name: category,
        value: standardData.series[0].data[index]
      }))
    };
    
    chartOptions.extra = {
      pie: {
        labelWidth: 15,
        activeRadius: 10,
        offsetAngle: 0,
        labelShow: true,
        border: false
      }
    };
    
    console.log('🥧 转换为饼图格式:', chartOptions.data.series);
  } else {
    // 线图、柱图等的通用格式
    chartOptions.data = {
      xAxis: standardData.categories,
      series: standardData.series
    };
    
    // 设置Y轴
    let maxValue = 0;
    standardData.series.forEach(series => {
      const seriesMax = Math.max(...series.data);
      if (seriesMax > maxValue) maxValue = seriesMax;
    });
    
    // 向上取整到最接近的10的倍数
    const yAxisMax = Math.ceil(maxValue / 10) * 10;
    
    chartOptions.yAxis = {
      show: true,
      data: [
        {
          min: 0,
          max: yAxisMax,
          fontSize: 12
        }
      ],
      gridType: 'dash'
    };
    
    console.log('📈 设置坐标轴数据:', chartOptions.data.xAxis);
  }
  
  // 根据图表类型添加特定配置
  switch (chartType) {
    case 'line':
      chartOptions.extra = {
        line: {
          type: 'curve', // 可选：'straight'(直线)、'curve'(曲线)
          width: 2,
          activeType: 'hollow'
        }
      };
      break;
      
    case 'column':
    case 'bar':
      chartOptions.extra = {
        column: {
          type: 'group',
          width: 30,
          seriesGap: 5,
          categoryGap: 15,
          barBorderRadius: [3, 3, 0, 0]
        }
      };
      break;
  }
  
  // 合并额外选项
  if (extraOptions) {
    for (const key in extraOptions) {
      if (typeof extraOptions[key] === 'object' && chartOptions[key]) {
        chartOptions[key] = {...chartOptions[key], ...extraOptions[key]};
      } else {
        chartOptions[key] = extraOptions[key];
      }
    }
  }
  
  console.log('✅ 最终图表配置生成完成');
  return chartOptions;
};

/**
 * 从服务器返回的标准数据创建图表配置
 * @param {Object} serverData - 服务器返回的标准图表数据
 * @param {Object} options - 配置选项
 * @returns {Object} 图表配置对象
 */
const createChartFromServerData = (serverData, options = {}) => {
  // 设置默认值
  const {
    chartType = 'line',
    title = '数据图表',
    colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666'],
    showLegend = true
  } = options;
  
  // 转换标准数据为图表配置
  const chartOptions = convertToChartOptions(serverData, chartType, title);
  
  if (!chartOptions) return null;
  
  // 添加额外的常用配置
  // 添加图例
  chartOptions.legend = {
    show: showLegend,
    position: 'top',
    float: 'center',
    itemGap: 20,
    fontSize: 12,
    fontColor: '#666666',
    padding: 10
  };
  
  // 添加颜色
  chartOptions.color = colors;
  
  // 添加Y轴配置
  if (['line', 'column', 'bar'].includes(chartType)) {
    // 找出数据中的最大值，用于设置Y轴范围
    let maxValue = 0;
    serverData.series.forEach(series => {
      const seriesMax = Math.max(...series.data);
      if (seriesMax > maxValue) maxValue = seriesMax;
    });
    
    // 向上取整到最接近的10的倍数
    const yAxisMax = Math.ceil(maxValue / 10) * 10;
    
    chartOptions.yAxis = {
      show: true,
      data: [
        {
          min: 0,
          max: yAxisMax,
          fontColor: '#666666',
          fontSize: 12,
          title: '',
          titleFontSize: 12,
          format: ''
        }
      ],
      axisLine: true,
      axisLineColor: '#cccccc',
      gridType: 'dash'
    };
  }
  
  return chartOptions;
};

/**
 * 解析服务器标准格式的图表数据
 * @param {string} content - 包含图表数据的内容
 * @returns {Object} 解析后的图表数据和配置信息
 */
const parseServerChartData = (content) => {
  try {
    console.log('尝试解析图表数据字符串:', content.substring(0, 100) + '...');
    
    // 尝试将内容解析为JSON
    let chartData = JSON.parse(content);
    
    console.log('JSON解析成功，检查数据结构:', chartData);
    
    // 检查是否符合标准图表数据结构
    if (chartData && chartData.categories && chartData.series) {
      console.log('✅ 标准图表数据格式验证通过');
      console.log('类别:', chartData.categories);
      console.log('系列数量:', chartData.series.length);
      
      // 推断图表类型
      const inferredType = inferChartType(chartData);
      console.log('🔍 推断的图表类型:', inferredType);
      
      // 创建图表配置
      const chartOptions = createChartFromServerData(chartData, {
        chartType: inferredType,
        title: '数据分析图表'
      });
      
      console.log('🎨 生成的图表配置:', JSON.stringify(chartOptions, null, 2));
      
      return {
        success: true,
        chartData: chartData,
        chartOptions: chartOptions,
        inferredType: inferredType
      };
    } else {
      console.log('❌ 数据不符合标准图表格式：');
      console.log('- categories存在:', !!chartData.categories);
      console.log('- series存在:', !!chartData.series);
      return {
        success: false,
        error: '数据结构不符合标准图表格式'
      };
    }
  } catch (err) {
    console.error('❌ 解析图表数据失败:', err);
    return {
      success: false,
      error: `解析失败: ${err.message}`
    };
  }
};

/**
 * 推断图表类型
 * @param {Object} data - 标准图表数据
 * @returns {string} 推断的图表类型
 */
const inferChartType = (data) => {
  // 如果只有一个类别或少量类别，且系列多，考虑使用饼图
  if (data.categories.length <= 5 && data.series.length === 1) {
    return 'pie';
  }
  
  // 如果类别少，系列多，考虑使用柱状图
  if (data.categories.length <= 8) {
    return 'column';
  }
  
  // 如果类别多，默认使用折线图
  return 'line';
};

/**
 * 处理服务器响应，提取并处理图表数据
 * @param {Object} response - 服务器响应对象
 * @returns {Object} 处理后的响应
 */
export const processChartData = (response) => {
  console.log('处理服务器响应:', response);
  
  const content = response.answer || '';
  const result = {
    content: content,
    plainText: content,
    contentBlocks: [],
    hasComplexContent: false,
    chartOptions: null,
    isError: false
  };
  
  try {
    // 检查内容中是否包含图表标记
    if (content.includes('```chart')) {
      console.log('检测到图表标记');
      
      // 提取图表配置部分
      const startMarker = '```chart';
      const endMarker = '```';
      const startIndex = content.indexOf(startMarker);
      
      if (startIndex !== -1) {
        const configStart = startIndex + startMarker.length;
        const endIndex = content.indexOf(endMarker, configStart);
        
        if (endIndex !== -1) {
          const configStr = content.substring(configStart, endIndex).trim();
          
          // 先尝试解析为标准图表数据结构
          const standardDataResult = parseServerChartData(configStr);
          
          if (standardDataResult.success) {
            // 成功解析为标准格式
            result.hasComplexContent = true;
            
            // 分离文本部分
            const textBefore = content.substring(0, startIndex).trim();
            if (textBefore) {
              result.contentBlocks.push({
                type: 'text',
                content: renderMarkdown(textBefore)
              });
            }
            
            // 添加图表块
            result.contentBlocks.push({
              type: 'chart',
              chartOptions: standardDataResult.chartOptions
            });
            
            // 提取图表后的文本
            const afterChart = content.substring(endIndex + endMarker.length).trim();
            if (afterChart) {
              result.contentBlocks.push({
                type: 'text',
                content: renderMarkdown(afterChart)
              });
            }
            
            // 保存图表配置
            result.chartOptions = standardDataResult.chartOptions;
            console.log('成功处理标准格式图表数据');
            
          } else {
            // 标准格式解析失败，尝试直接解析JSON
            try {
              const chartConfig = JSON.parse(configStr);
              result.hasComplexContent = true;
              
              // 将内容分割
              const parts = content.split(startMarker);
              if (parts[0].trim()) {
                result.contentBlocks.push({
                  type: 'text',
                  content: renderMarkdown(parts[0].trim())
                });
              }
              
              // 添加图表
              result.contentBlocks.push({
                type: 'chart',
                chartOptions: chartConfig
              });
              
              // 提取图表后的文本
              const afterParts = parts[1].split(endMarker);
              if (afterParts.length > 1 && afterParts[1].trim()) {
                result.contentBlocks.push({
                  type: 'text',
                  content: renderMarkdown(afterParts[1].trim())
                });
              }
              
              result.chartOptions = chartConfig;
              console.log('成功解析JSON格式图表配置');
            } catch (jsonErr) {
              // 所有解析方法都失败
              console.error('所有图表解析方法均失败');
              result.contentBlocks.push({
                type: 'text',
                content: renderMarkdown(content)
              });
              
              result.contentBlocks.push({
                type: 'text',
                content: `<div class="chart-error">图表解析失败，请检查数据格式</div>`
              });
            }
          }
        } else {
          // 没有找到结束标记
          result.contentBlocks.push({
            type: 'text',
            content: renderMarkdown(content)
          });
        }
      }
    } else {
      // 不包含图表标记，直接处理文本
      result.contentBlocks.push({
        type: 'text',
        content: renderMarkdown(content)
      });
    }
    
    return result;
  } catch (err) {
    console.error('处理响应时发生错误:', err);
    return {
      content: content,
      plainText: content,
      contentBlocks: [{ 
        type: 'text', 
        content: renderMarkdown(content) 
      }],
      hasComplexContent: false,
      chartOptions: null,
      isError: true,
      errorType: '处理错误',
      errorDetail: err.message
    };
  }
}; 