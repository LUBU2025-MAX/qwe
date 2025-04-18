<template>
  <view class="assistant-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-button history-button" @click="showHistory">
        <view class="history-icon">
          <!-- 删除iconfont，使用CSS创建图标 -->
        </view>
      </view>
      <view class="space-filler"></view>
      <text class="new-chat-button" @click="startNewChat">新对话</text>
    </view>
    
    <!-- 首次使用显示内容 -->
    <view class="center-content" v-if="isFirstTime">
      <view class="logo-container">
        <view class="cube">
          <view class="cube-face face-front"></view>
          <view class="cube-face face-back"></view>
          <view class="cube-face face-right"></view>
          <view class="cube-face face-left"></view>
          <view class="cube-face face-top"></view>
          <view class="cube-face face-bottom"></view>
        </view>
      </view>
      
      <view class="title-container">
        <text class="title">嗨！我是钢铁智能助手</text>
        <text class="subtitle">我可以帮你搜索、答疑、分析数据，请把你的任务交给我吧~</text>
      </view>
    </view>
    
    <!-- 聊天记录区域 -->
    <scroll-view 
      v-if="!isFirstTime" 
      class="chat-container" 
      scroll-y="true" 
      :scroll-top="scrollTop"
    >
      <view v-for="(item, index) in chatMessages" :key="index" class="message-item">
        <!-- AI消息 -->
        <view v-if="item.type === 'ai'" class="ai-message">
          <!-- 头像部分 - 保持原有的立方体动画 -->
          <view class="ai-avatar">
            <view class="small-cube">
              <view class="cube-face face-front"></view>
              <view class="cube-face face-back"></view>
              <view class="cube-face face-right"></view>
              <view class="cube-face face-left"></view>
              <view class="cube-face face-top"></view>
              <view class="cube-face face-bottom"></view>
            </view>
          </view>
          
          <!-- 消息内容部分 - 包含文本框和名片 -->
          <view class="message-content">
            <!-- 纯文本部分 - 对话气泡 -->
            <view :class="['ai-bubble', item.isError ? 'error-message' : '']" v-if="item.plainText || item.content">
              <!-- 错误类型显示（如果有） -->
              <view v-if="item.isError && item.errorType" class="error-type">
                {{ item.errorType }}
              </view>
              
              <!-- 消息文本内容 -->
              <text>{{ item.plainText || item.content }}</text>
              
              <!-- 错误详情显示（如果有） -->
              <view v-if="item.isError && item.errorDetail" class="error-detail">
                {{ item.errorDetail }}
              </view>
            </view>
            
            <!-- 复杂内容部分 - 名片形式 -->
            <view v-if="item.hasComplexContent" class="content-card">
              <!-- 分块内容渲染 -->
              <view v-if="item.contentBlocks && item.contentBlocks.length > 0">
                <view v-for="(block, blockIndex) in item.contentBlocks" :key="blockIndex">
                  <!-- 文本块 -->
                  <view v-if="block.type === 'text'" class="text-block" v-html="block.content"></view>
                  
                  <!-- 图表块 -->
                  <view v-if="block.type === 'chart'" class="chart-container">
                    <u-chart-renderer 
                      :options="block.chartOptions" 
                      :height="450"
                      class="chart-block"
                    />
                  </view>
                </view>
              </view>
              
              <!-- 兼容处理：有图表但无内容块 -->
              <template v-else-if="item.chartOptions">
                <u-chart-renderer 
                  :options="item.chartOptions" 
                  :height="450"
                  class="chart-block"
                />
              </template>
            </view>
          </view>
        </view>
        
        <!-- 用户消息 - 确保在右侧显示 -->
        <view v-else class="user-message">
          <view class="user-bubble">
            <text>{{ item.content }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="bottom-content">
      <view class="message-container">
        <textarea 
          class="message-textarea" 
          v-model="message" 
          placeholder="给【钢铁智能助手】发送消息"
          maxlength="1000"
          show-confirm-bar="false"
        />
      </view>
      
      <view class="buttons-container">
        <view class="function-buttons-group">
          <view class="function-button logistics-button" @click="handleLogistics">
            <text>一键物流追溯</text>
          </view>
          
          <view class="function-button knowledge-button" @click="handleKnowledge">
            <text>知识库系统</text>
          </view>
        </view>
        
        <view class="send-button" @click="sendMessage">
          <text>发送</text>
        </view>
      </view>
    </view>
    
    <!-- 历史记录弹出层 -->
    <view class="history-panel" v-if="isHistoryVisible" @click.stop>
      <view class="history-panel-mask" @click="hideHistory"></view>
      <view class="history-panel-content">
        <view class="history-panel-header">
          <text class="history-panel-title">历史对话</text>
          <view class="history-panel-close" @click="hideHistory">×</view>
        </view>
        <scroll-view class="history-list" scroll-y="true">
          <view 
            v-for="(history, index) in chatHistory" 
            :key="index" 
            class="history-item"
            @click="loadChatHistory(index)"
          >
            <text class="history-item-title">{{ getHistoryTitle(history) }}</text>
            <text class="history-item-time">{{ formatHistoryTime(history.time) }}</text>
          </view>
          <view v-if="chatHistory.length === 0" class="history-empty">
            <text>暂无历史对话</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 修复AI思考状态的显示 -->
    <view v-if="isAITyping" class="ai-typing">
      <view class="ai-avatar">
        <view class="small-cube thinking">
          <view class="cube-face face-front"></view>
          <view class="cube-face face-back"></view>
          <view class="cube-face face-right"></view>
          <view class="cube-face face-left"></view>
          <view class="cube-face face-top"></view>
          <view class="cube-face face-bottom"></view>
        </view>
      </view>
      <view class="thinking-text">AI正在思考...</view>
    </view>
  </view>
</template>

<script setup>
/**
 * AI问答助手页面
 * @description 钢铁智能助手问答界面，支持基础Markdown渲染和图表展示
 */
import { ref, nextTick, computed, onMounted } from 'vue';
// 引入图表渲染组件
import UChartRenderer from '../../components/u-chart-renderer/u-chart-renderer.vue';

// 消息输入内容
const message = ref('');
// 是否为首次使用
const isFirstTime = ref(true);
// 聊天消息记录
const chatMessages = ref([]);
// 滚动位置
const scrollTop = ref(0);
// 历史记录
const chatHistory = ref([]);
// 当前会话ID
const currentSessionId = ref(Date.now().toString());
// 当前会话是否已保存
const isCurrentSessionSaved = ref(true);
// 历史面板是否可见
const isHistoryVisible = ref(false);
// 显示详情弹窗相关变量
const isDetailViewVisible = ref(false);
const currentDetailItem = ref({});
// AI是否正在思考中
const isAITyping = ref(false);

// 添加格式化图表数据的方法
const formatChartData = (options) => {
  const chartData = {
    categories: [],
    series: []
  };
  
  if (!options || !options.data) return chartData;
  
  // 根据图表类型处理数据
  if (options.type === 'bar' || options.type === 'line') {
    chartData.categories = options.data.xAxis || [];
    chartData.series = options.data.series || [];
  } else if (options.type === 'pie') {
    chartData.series = options.data.series.map(item => ({
      name: item.name,
      data: item.data
    }));
  }
  
  return chartData;
};

/**
 * 渲染Markdown内容为HTML（但不处理chart代码块）
 */
const renderMarkdown = (content) => {
  if (!content) return '';
  
  // 先替换chart代码块为占位符，避免被其他规则处理
  const placeholders = [];
  let processedContent = content.replace(/(```|''')chart[\s\S]*?(```|''')/g, (match) => {
    const placeholder = `__CHART_PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(match);
    return placeholder;
  });
  
  // 处理其他Markdown语法
  processedContent = processedContent
    .replace(/#{1,6}\s+(.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n/g, '<br>');
  
  // 恢复占位符（但实际上不需要恢复，因为图表代码块会被单独处理）
  return processedContent;
};

/**
 * 返回Markdown格式演示样例
 * @returns {string} Markdown样例文本
 */
const getMarkdownExample = () => {
  return `
# Markdown 格式演示

这是一段普通文本，展示**粗体**和*斜体*效果，还有\`行内代码\`。

## 列表演示

无序列表:
* 项目一
* 项目二
* 项目三

有序列表:
1. 第一步
2. 第二步
3. 第三步

## 代码块演示

\`\`\`
function calculatePrice(qty, price) {
  return qty * price;
}

// 计算10吨钢材的价格
const totalPrice = calculatePrice(10, 4200);
console.log(\`总价: ¥\${totalPrice}\`);
\`\`\`

## 表格演示

| 材料类型 | 规格 | 单价(元/吨) | 库存 |
| 高强度钢筋 | HRB400 | 4,200 | 充足 |
| 结构钢 | Q235B | 3,800 | 有限 |
| 不锈钢 | 304 | 15,600 | 紧缺 |

## 引用演示

> 注意：价格随市场波动可能有所变化，请以实际询价为准。
> 联系电话：400-123-4567

## 链接演示

[点击查看更多钢材价格](https://example.com/steel-prices)
`;
};

/**
 * 解析消息中的图表标记
 * @param {string} text - 原始消息文本
 * @returns {Object} 包含处理后消息文本和图表选项的对象
 */
const parseChartMarkup = (text) => {
  if (!text) return { text: '', chartOptions: null, hasComplexContent: false };
  
  // 获取所有图表标记
  const chartRegex = /{{chart\s*([\s\S]*?)}}|```chart\s*([\s\S]*?)```/g;
  const matches = [...text.matchAll(chartRegex)];
  
  // 如果没有图表标记，直接返回
  if (matches.length === 0) {
    return { text: text, chartOptions: null, hasComplexContent: false };
  }
  
  // 仅处理第一个图表标记
  const firstMatch = matches[0];
  const chartConfig = (firstMatch[1] || firstMatch[2]).trim();
  let options = null;
  
  try {
    // 尝试解析图表配置
    if (chartConfig.startsWith('{') && chartConfig.endsWith('}')) {
      options = JSON.parse(chartConfig);
    } else {
      options = new Function(`return ({${chartConfig}})`)();
    }
    
    // 确保options有合适的类型
    if (!options.type) {
      options.type = 'bar'; // 默认为柱状图
    }
    
    // 获取图表前的描述文本作为图表描述
    const beforeText = text.substring(0, firstMatch.index).trim();
    const descLines = beforeText.split('\n');
    const lastLine = descLines[descLines.length - 1];
    
    if (lastLine && !lastLine.startsWith('#') && !lastLine.endsWith(':')) {
      options.description = lastLine;
    }
    
    // 从原始文本中移除所有图表标记
    let cleanText = text;
    for (const match of matches) {
      cleanText = cleanText.replace(match[0], '');
    }
    cleanText = cleanText.trim();
    
    console.log('解析到图表配置:', options);
    
    return { 
      text: cleanText, 
      chartOptions: options, 
      hasComplexContent: true 
    };
  } catch (e) {
    console.error('图表配置解析错误:', e);
    return { text: text, chartOptions: null, hasComplexContent: false };
  }
};

/**
 * 检查图表配置是否有效
 * @param {Object} chartOptions - 图表配置对象
 * @returns {Object} 包含验证结果和错误信息
 */
const validateChartOptions = (chartOptions) => {
  // 初始化结果对象
  const result = {
    isValid: true,
    errorMessage: '',
    chartOptions: JSON.parse(JSON.stringify(chartOptions)) // 深拷贝一份，避免修改原对象
  };
  
  try {
    // 基本检查
    if (!result.chartOptions) {
      result.isValid = false;
      result.errorMessage = '图表配置为空';
      return result;
    }
    
    // 检查图表类型
    if (!result.chartOptions.type) {
      result.isValid = false;
      result.errorMessage = '图表类型(type)未指定';
      return result;
    }
    const chartType = result.chartOptions.type.toLowerCase();
    
    // 检查数据字段
    if (!result.chartOptions.data) {
      result.isValid = false;
      result.errorMessage = '图表数据(data)字段缺失';
      return result;
    }
    
    // 检查系列数据
    if (!result.chartOptions.data.series || !Array.isArray(result.chartOptions.data.series)) {
       // 兼容饼图直接在 data 下放数据点数组的情况
       if (chartType === 'pie' && Array.isArray(result.chartOptions.data)) {
         // 将其包装成 series 结构
         result.chartOptions.data = { series: result.chartOptions.data };
       } else {
         result.isValid = false;
         result.errorMessage = '图表系列数据(data.series)缺失或格式错误';
         return result;
       }
    }
    
    // 特定图表类型检查
    switch (chartType) {
      case 'pie':
        // 检查饼图必需的 extra 配置，如果缺少则自动添加默认值
        if (!result.chartOptions.extra) result.chartOptions.extra = {};
        if (!result.chartOptions.extra.pie) {
          console.warn('饼图缺少 extra.pie 配置，自动添加默认值');
          result.chartOptions.extra.pie = {
            labelWidth: 15,
            activeRadius: 10,
            offsetAngle: 0,
            legendWidth: 15,
            border: false,
            labelShow: true,
            labelPosition: 'outside'
          };
        } else {
          // 确保核心属性存在
          const pieExtra = result.chartOptions.extra.pie;
          if (pieExtra.labelWidth === undefined) pieExtra.labelWidth = 15;
          if (pieExtra.activeRadius === undefined) pieExtra.activeRadius = 10;
          if (pieExtra.offsetAngle === undefined) pieExtra.offsetAngle = 0;
          if (pieExtra.legendWidth === undefined) pieExtra.legendWidth = 15;
        }
        // 检查饼图数据点格式
        if (result.chartOptions.data.series.length === 0 || !result.chartOptions.data.series[0].data) {
           // 兼容 series 直接是数据点数组的情况
           if (Array.isArray(result.chartOptions.data.series) && result.chartOptions.data.series.every(item => item && typeof item.name !== 'undefined' && typeof item.value !== 'undefined')) {
             // 数据格式已经是 [ { name: 'xx', value: yy }, ... ]
             // 不需要进一步处理 data.series[0].data
           } else {
             result.isValid = false;
             result.errorMessage = '饼图数据格式错误，应为 data.series[0].data = [{name, value}, ...] 或 data.series = [{name, value}, ...]';
             return result;
           }
        }
        break;
        
      case 'bar':
      case 'column':
      case 'line':
        // 检查 xAxis 是否存在
        if (!result.chartOptions.data.xAxis || !Array.isArray(result.chartOptions.data.xAxis)) {
          result.isValid = false;
          result.errorMessage = `${chartType} 图表缺少 xAxis 数据或格式错误`;
          return result;
        }
        // 检查 series 数据点格式
        if (!result.chartOptions.data.series.every(s => s && Array.isArray(s.data))) {
          result.isValid = false;
          result.errorMessage = `${chartType} 图表系列数据(series[n].data)格式错误`;
          return result;
        }
        break;
        
      // 可以添加其他图表类型的验证...

      default:
        console.warn(`未知的图表类型: ${chartType}，跳过特定验证`);
        break;
    }
    
    // 如果所有检查通过
    return result;
    
  } catch (err) {
    result.isValid = false;
    result.errorMessage = `图表数据验证时发生错误: ${err.message}`;
    return result;
  }
};

/**
 * 处理用户消息 - 修复测试消息处理逻辑
 * @param {string} userMessage - 用户消息
 * @returns {boolean} 是否处理了消息
 */
const processUserMessage = (userMessage) => {
  console.log('处理用户消息:', userMessage);
  let response = '';
  let hasComplexContent = false;
  
  // 处理不同类型的测试消息
  if (userMessage === '测试') {
    console.log('触发测试功能');
    
    // 添加第一条测试消息 - 包含Markdown演示和柱状图
    chatMessages.value.push({
      type: 'ai',
      content: `## Markdown基础格式演示

这是一段普通文本，展示**粗体**和*斜体*效果，还有\`行内代码\`。

### 列表演示

无序列表:
* 高强度钢筋
* 不锈钢
* 结构钢
* 合金钢

有序列表:
1. 检查原材料质量
2. 控制冶炼温度
3. 热处理工艺优化
4. 表面处理与防腐

### 代码块演示

\`\`\`javascript
function calculateSteelPrice(weight, unitPrice, discount = 1) {
  return weight * unitPrice * discount;
}

// 计算10吨高强度钢筋的价格
const totalPrice = calculateSteelPrice(10, 4200, 0.95);
console.log(\`总价: ¥\${totalPrice}\`);
\`\`\`

### 表格演示

| 材料类型 | 规格 | 单价(元/吨) | 库存状态 |
| --- | --- | --- | --- |
| 高强度钢筋 | HRB400 | 4,200 | 充足 |
| 不锈钢 | 304 | 15,600 | 紧缺 |
| 结构钢 | Q235B | 3,800 | 一般 |
| 合金钢 | 42CrMo | 6,500 | 充足 |

### 引用演示

> 注意：钢材价格受国际大宗商品市场影响，价格波动较大。
> 建议定期关注市场行情，把握采购时机。

## 图表展示部分

### 柱状图示例

以下是近6个月的钢材销量数据统计：
各类钢材的销售情况整体呈上升趋势，其中不锈钢的增长最为显著，5月份达到峰值290吨，高强度钢筋在6月份销量突增至230吨，较前几个月有明显提升。

{{chart
type: 'bar',
title: { text: '钢材月度销量统计(吨)' },
data: {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '高强度钢筋', data: [120, 132, 101, 134, 190, 230] },
    { name: '不锈钢', data: [220, 182, 191, 234, 290, 330] },
    { name: '结构钢', data: [150, 132, 201, 154, 190, 230] }
  ]
}
}}`,
      chartOptions: {
        type: 'bar',
        title: { text: '钢材月度销量统计(吨)' },
        data: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
          series: [
            { name: '高强度钢筋', data: [120, 132, 101, 134, 190, 230] },
            { name: '不锈钢', data: [220, 182, 191, 234, 290, 330] },
            { name: '结构钢', data: [150, 132, 201, 154, 190, 230] }
          ]
        }
      },
      timestamp: Date.now(),
      hasComplexContent: true
    });
    
    // 确保滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
    
    // 延迟添加折线图
    setTimeout(() => {
      chatMessages.value.push({
        type: 'ai',
        content: `### 折线图示例

以下是2023年上半年钢材价格走势图：
观察近几个月的趋势，高强度钢筋价格在3月达到高点后有所回落，但整体保持在较高水平；不锈钢价格波动较大，呈现震荡上行趋势；结构钢价格相对稳定，小幅上涨。

{{chart
type: 'line',
title: { text: '2023年钢材价格走势(元/吨)' },
data: {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '高强度钢筋', data: [4200, 4350, 4500, 4380, 4320, 4400] },
    { name: '不锈钢', data: [15600, 15200, 15800, 16000, 15500, 16200] },
    { name: '结构钢', data: [3800, 3850, 3900, 3950, 4000, 4050] }
  ]
}
}}`,
        chartOptions: {
          type: 'line',
          title: { text: '2023年钢材价格走势(元/吨)' },
          data: {
            xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
            series: [
              { name: '高强度钢筋', data: [4200, 4350, 4500, 4380, 4320, 4400] },
              { name: '不锈钢', data: [15600, 15200, 15800, 16000, 15500, 16200] },
              { name: '结构钢', data: [3800, 3850, 3900, 3950, 4000, 4050] }
            ]
          }
        },
        timestamp: Date.now(),
        hasComplexContent: true
      });
      
      // 确保滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
      
      // 延迟添加饼图
      setTimeout(() => {
        chatMessages.value.push({
          type: 'ai',
          content: `### 饼图示例

以下是本季度各类钢材销售占比：
从数据可以看出，不锈钢占据最大市场份额，达到42%；其次是高强度钢筋，占比28%；结构钢和合金钢分别占18%和12%。

{{chart
type: 'pie',
title: { text: '各类钢材销售占比(%)' },
data: {
  series: [
    { name: '不锈钢', value: 42 },
    { name: '高强度钢筋', value: 28 },
    { name: '结构钢', value: 18 },
    { name: '合金钢', value: 12 }
  ]
}
}}`,
          chartOptions: {
            type: 'pie',
            title: { text: '各类钢材销售占比(%)' },
            data: {
              series: [
                { name: '不锈钢', value: 42 },
                { name: '高强度钢筋', value: 28 },
                { name: '结构钢', value: 18 },
                { name: '合金钢', value: 12 }
              ]
            }
          },
          timestamp: Date.now(),
          hasComplexContent: true
        });
        
        // 确保滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
      }, 800);
    }, 800);
    
    return true;
  }
  // 保留其他条件...

  return false;
};

/**
 * 发送消息到服务器
 * @param {string} userMessage - 用户发送的消息
 */
const sendMessageToServer = (userMessage) => {
  console.log('发送到服务器:', userMessage);
  
  // 设置AI思考状态
  isAITyping.value = true;
  
  // 构建API URL - 使用查询参数传递用户问题
  const encodedQuestion = encodeURIComponent(userMessage);
  const apiUrl = `http://localhost:3000/responses?question=${encodedQuestion}`;
  
  // 发送GET请求获取匹配问题的响应
  uni.request({
    url: apiUrl,
    method: 'GET',
    header: {
      'content-type': 'application/json'
    },
    success: (res) => {
      // 关闭思考状态
      isAITyping.value = false;
      
      // 处理响应数据
      if (res.statusCode === 200 && res.data && res.data.length > 0) {
        // 获取匹配的第一个响应
        const responseItem = res.data[0];
        
        // 处理找到的回答
        const response = processServerResponse(responseItem);
        
        // 添加AI回复到聊天记录
        chatMessages.value.push({
          type: 'ai',
          content: response.content,
          plainText: response.plainText,
          contentBlocks: response.contentBlocks,
          hasComplexContent: response.hasComplexContent,
          chartOptions: response.chartOptions,
          timestamp: Date.now()
        });
        
        // 标记会话为未保存
        isCurrentSessionSaved.value = false;
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
      } else {
        // 如果没有匹配的响应，获取默认回复
        getDefaultResponse(userMessage);
      }
    },
    fail: (err) => {
      // 处理请求失败
      isAITyping.value = false;
      handleErrorResponse("请求失败: " + (err.errMsg || "未知错误"));
    }
  });
};

/**
 * 获取默认响应（当没有匹配的响应时）
 * @param {string} userMessage - 用户消息
 */
const getDefaultResponse = (userMessage) => {
  // 请求所有响应，选择第一个作为默认
  uni.request({
    url: 'http://localhost:3000/responses',
    method: 'GET',
    header: {
      'content-type': 'application/json'
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data && res.data.length > 0) {
        // 使用第一个响应作为默认
        const defaultAnswer = res.data[0].answer;
        const response = processServerResponse(defaultAnswer);
        
        // 添加默认AI回复到聊天记录
        chatMessages.value.push({
          type: 'ai',
          content: response.content,
          plainText: response.plainText,
          contentBlocks: response.contentBlocks,
          hasComplexContent: response.hasComplexContent,
          chartOptions: response.chartOptions,
          timestamp: Date.now()
        });
      } else {
        // 如果没有任何响应，显示通用错误消息
        handleErrorResponse("抱歉，我无法理解您的问题。请尝试其他问题。");
      }
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
    },
    fail: () => {
      handleErrorResponse("获取默认回复失败");
    }
  });
};

/**
 * 处理错误响应
 */
const handleErrorResponse = (message) => {
  chatMessages.value.push({
    type: 'ai',
    content: message,
    isError: true,
    errorType: '服务器错误',
    timestamp: Date.now()
  });
  
  scrollToBottom();
};

/**
 * 处理服务器响应内容 (新逻辑：优先分析文本)
 * @param {Object} response - 服务器返回的响应对象
 * @returns {Object} 处理后的响应对象
 */
const processServerResponse = (response) => {
  console.log('新处理流程 - 接收到响应:', response);

  // 获取核心文本内容
  const content = response.answer || '';

  // 初始化结果对象
  const result = {
    content: content, // 保留原始文本
    plainText: content,
    hasComplexContent: false,
    contentBlocks: [],
    chartOptions: null, // 主图表选项
    isError: false,
    errorType: '',
    errorDetail: ''
  };

  try {
    // 1. 定义图表代码块的正则表达式 (匹配 ```chart 和 '''chart)
    const chartRegex = /(```|''')chart\s*\n([\s\S]*?)\n(```|''')/g;
    let lastIndex = 0;
    let match;
    let foundChart = false;

    // 2. 查找并处理所有图表代码块
    while ((match = chartRegex.exec(content)) !== null) {
      foundChart = true;
      result.hasComplexContent = true; // 标记包含复杂内容

      // a. 添加匹配前的文本块
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index).trim();
        if (textBefore) {
          result.contentBlocks.push({
            type: 'text',
            content: renderMarkdown(textBefore) // 渲染Markdown
          });
        }
      }

      // b. 尝试处理图表块
      const chartJsonString = match[2].trim(); // 提取JSON字符串
      try {
        const parsedOptions = JSON.parse(chartJsonString);
        const validationResult = validateChartOptions(parsedOptions); // 验证

        if (validationResult.isValid) {
          // 验证成功，添加图表块
          result.contentBlocks.push({
            type: 'chart',
            chartOptions: validationResult.chartOptions
          });
          // 如果是第一个有效图表，设为主图表
          if (!result.chartOptions) {
            result.chartOptions = validationResult.chartOptions;
          }
          console.log('成功解析并验证图表:', validationResult.chartOptions.type);
        } else {
          // 验证失败，添加错误文本块
          console.error('图表验证失败:', validationResult.errorMessage, '原始JSON:', chartJsonString);
          result.contentBlocks.push({
            type: 'text',
            content: `<div class="chart-error-message">
              <p style="color: #f56c6c; font-weight: bold;">图表格式错误</p>
              <p>${validationResult.errorMessage}</p>
              <pre style="background: #f8f8f8; padding: 10px; font-size: 12px; white-space: pre-wrap; word-break: break-all;">${chartJsonString}</pre>
            </div>`
          });
        }
      } catch (err) {
        // JSON 解析失败，添加错误文本块
        console.error('图表JSON解析错误:', err, '原始JSON:', chartJsonString);
        result.contentBlocks.push({
          type: 'text',
          content: `<div class="chart-error-message">
            <p style="color: #f56c6c; font-weight: bold;">图表解析错误</p>
            <p>${err.message}</p>
            <pre style="background: #f8f8f8; padding: 10px; font-size: 12px; white-space: pre-wrap; word-break: break-all;">${chartJsonString}</pre>
          </div>`
        });
      }

      // 更新下一个文本块的起始位置
      lastIndex = chartRegex.lastIndex;
    }

    // 3. 添加最后一个图表块之后的文本
    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex).trim();
      if (textAfter) {
        result.contentBlocks.push({
          type: 'text',
          content: renderMarkdown(textAfter) // 渲染Markdown
        });
      }
    }

    // 4. 如果没有找到任何图表块，则将整个内容作为单个文本块
    if (!foundChart) {
      result.contentBlocks.push({
        type: 'text',
        content: renderMarkdown(content) // 渲染Markdown
      });
      result.hasComplexContent = false; // 确认没有复杂内容
    }

    console.log('处理完成，内容块:', result.contentBlocks.length, '主图表:', result.chartOptions ? result.chartOptions.type : '无');
    return result;

  } catch (err) {
    console.error('处理响应时发生意外错误:', err);
    // 发生意外错误时，显示原始文本并标记错误
    result.contentBlocks = [{ type: 'text', content: renderMarkdown(content) }];
    result.isError = true;
    result.errorType = '数据处理异常';
    result.errorDetail = err.message;
    result.hasComplexContent = false; // 出错时认为无复杂内容
    return result;
  }
};

/**
 * 发送消息
 */
const sendMessage = () => {
  // 检查消息是否为空
  if (!message.value.trim()) return;
  
  // 获取用户消息
  const userMessage = message.value.trim();
  console.log('用户发送消息:', userMessage);
  
  // 添加用户消息到聊天历史
  chatMessages.value.push({
    type: 'user',
    content: userMessage,
    timestamp: Date.now()
  });
  
  // 确保欢迎界面消失
  isFirstTime.value = false;
  
  // 清空输入框
  message.value = '';
  
  // 使用nextTick确保DOM更新后再执行后续操作
  nextTick(() => {
    // 滚动到底部
    scrollToBottom();
    
    // 等待DOM更新完成后再发送到服务器处理
    sendMessageToServer(userMessage);
  });
};

/**
 * 处理物流追溯功能
 * @returns {void}
 */
const handleLogistics = () => {
  // 导航到物流追溯页面
  uni.navigateTo({
    url: '/pages/logistics-tracking/index'
  });
};

/**
 * 处理知识库系统功能
 * @returns {void}
 */
const handleKnowledge = () => {
  // 添加一条系统消息
  chatMessages.value.push({
    type: 'ai',
    content: '您好，钢铁知识库已就绪，请问您需要查询哪方面的信息？',
    timestamp: Date.now()
  });
  
  // 确保切换到对话界面
  isFirstTime.value = false;
  
  // 确保DOM更新后再滚动
  nextTick(() => {
    scrollToBottom();
  });
};

/**
 * 开始新对话
 * @returns {void}
 */
const startNewChat = () => {
  // 如果当前会话有内容并且未保存，则保存到历史记录
  if (chatMessages.value.length > 0 && !isCurrentSessionSaved.value) {
    saveCurrentChatToHistory();
  }
  
  // 清空当前聊天记录
  chatMessages.value = [];
  // 重置首次使用状态
  isFirstTime.value = true;
  // 生成新的会话ID
  currentSessionId.value = Date.now().toString();
  // 标记新会话为已保存状态（因为是空的）
  isCurrentSessionSaved.value = true;
};

/**
 * 保存当前聊天记录到历史
 * @returns {void}
 */
const saveCurrentChatToHistory = () => {
  // 创建历史记录对象
  const historyRecord = {
    id: currentSessionId.value,
    messages: [...chatMessages.value],
    time: Date.now()
  };
  
  // 添加到历史记录
  chatHistory.value.unshift(historyRecord);
  
  // 标记当前会话为已保存
  isCurrentSessionSaved.value = true;
};

/**
 * 显示历史记录面板
 * @returns {void}
 */
const showHistory = () => {
  // 如果当前会话有内容并且未保存，则保存到历史记录
  if (chatMessages.value.length > 0 && !isCurrentSessionSaved.value) {
    saveCurrentChatToHistory();
  }
  
  isHistoryVisible.value = true;
};

/**
 * 隐藏历史记录面板
 * @returns {void}
 */
const hideHistory = () => {
  isHistoryVisible.value = false;
};

/**
 * 加载历史聊天记录
 * @param {number} index - 历史记录索引
 * @returns {void}
 */
const loadChatHistory = (index) => {
  // 如果当前会话有内容并且未保存，则保存到历史记录
  if (chatMessages.value.length > 0 && !isCurrentSessionSaved.value) {
    saveCurrentChatToHistory();
  }
  
  // 获取选中的历史记录
  const selectedHistory = chatHistory.value[index];
  
  // 更新当前会话
  chatMessages.value = [...selectedHistory.messages];
  currentSessionId.value = selectedHistory.id;
  isFirstTime.value = false;
  isCurrentSessionSaved.value = true;
  
  // 隐藏历史记录面板
  hideHistory();
  
  // 滚动到底部
  nextTick(() => {
    scrollTop.value = 9999999;
  });
};

/**
 * 获取历史记录标题（使用第一条用户消息作为标题）
 * @param {Object} history - 历史记录对象
 * @returns {string} 历史记录标题
 */
const getHistoryTitle = (history) => {
  // 寻找第一条用户消息
  const firstUserMessage = history.messages.find(msg => msg.type === 'user');
  
  if (firstUserMessage) {
    // 截取前20个字符，如果超出则添加省略号
    const content = firstUserMessage.content;
    return content.length > 20 ? content.substring(0, 20) + '...' : content;
  }
  
  return '未命名对话';
};

/**
 * 格式化历史时间
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间
 */
const formatHistoryTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  // 使用一个足够大的值确保滚动到底部
  scrollTop.value = 99999;
  
  // 额外保障：延迟再次滚动一次
  setTimeout(() => {
    scrollTop.value = 99999;
  }, 50);
};

/**
 * 保存当前会话
 */
const saveCurrentSession = () => {
  // 创建历史记录对象
  const historyRecord = {
    id: currentSessionId.value,
    messages: [...chatMessages.value],
    time: Date.now()
  };
  
  // 添加到历史记录
  chatHistory.value.unshift(historyRecord);
  
  // 标记当前会话为已保存
  isCurrentSessionSaved.value = true;
};

/**
 * 增强的Markdown渲染函数，支持内联图表
 * @param {string} text - Markdown文本
 * @returns {string} 转换后的HTML
 */
const renderEnhancedMarkdown = (text) => {
  if (!text) return '';
  
  try {
    // 标记图表位置，以便后续处理
    const chartPositions = [];
    let modifiedText = text.replace(/{{chart\s*([\s\S]*?)}}|```chart\s*([\s\S]*?)```/g, (match, config1, config2, offset) => {
      const config = (config1 || config2).trim();
      let chartHtml = '';
      
      try {
        // 解析图表配置
        let options = null;
        if (config.startsWith('{') && config.endsWith('}')) {
          options = JSON.parse(config);
        } else {
          options = new Function(`return ({${config}})`)();
        }
        
        // 生成图表占位符
        chartHtml = `<div class="embedded-chart" style="width:100%;height:450px;background:#f9f9f9;margin:20px 0;border-radius:8px;display:flex;justify-content:center;align-items:center;">
          <div style="text-align:center;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:10px;">${options.title?.text || '图表'}</div>
            <div style="color:#666;">在此位置将展示${getChartTypeName(options.type)}，请在名片视图中查看。</div>
          </div>
        </div>`;
      } catch (e) {
        console.error('处理内嵌图表错误:', e);
        chartHtml = '<div style="color:#f00;padding:10px;background:#fee;border-radius:4px;">图表配置错误</div>';
      }
      
      chartPositions.push({ offset, chartHtml });
      return `{{CHART_PLACEHOLDER_${chartPositions.length - 1}}}`;
    });
    
    // 先进行常规Markdown渲染
    let html = renderMarkdown(modifiedText);
    
    // 替换图表占位符
    chartPositions.forEach((pos, index) => {
      html = html.replace(`{{CHART_PLACEHOLDER_${index}}}`, pos.chartHtml);
    });
    
    return html;
  } catch (e) {
    console.error('增强Markdown渲染错误:', e);
    return renderMarkdown(text); // 降级处理
  }
};

/**
 * 获取图表类型的中文名称
 */
const getChartTypeName = (type) => {
  const typeMap = {
    'bar': '柱状图',
    'line': '折线图',
    'pie': '饼图',
    'radar': '雷达图',
    'scatter': '散点图'
  };
  return typeMap[type] || '图表';
};

// 计算属性 - 解析详情内容为多个区块
const detailContentBlocks = computed(() => {
  if (!currentDetailItem.value || !currentDetailItem.value.content) {
    return [];
  }
  
  // 如果是测试命令的完整响应，解析出文本块和图表块
  if (currentDetailItem.value.fullContent || 
      (currentDetailItem.value.content && currentDetailItem.value.content.includes('{{chart'))) {
    return parseContentBlocks(currentDetailItem.value.content || currentDetailItem.value.fullContent);
  }
  
  return [];
});

// 页面加载时执行
onMounted(() => {
  console.log('组件接收到的完整options:', JSON.stringify(this.options));
  // 可能需要初始化逻辑...
});
</script>

<style>
.assistant-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40rpx 40rpx 40rpx;
  min-height: 100vh;
  background-color: #fff;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-top: 40rpx;
}

.space-filler {
  flex: 1;
}

.nav-button {
  margin-right: 20rpx;
}

.history-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.history-icon {
  position: relative;
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #7a6cc8;
  border-radius: 50%;
  background: linear-gradient(135deg, #00b4cc 0%, #a64dff 50%, #0066ff 100%);
  border: none;
}

.history-icon:before, .history-icon:after {
  background-color: #fff;
}

.history-icon:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16rpx;
  height: 3rpx;
  transform: translate(0, 0);
}

.history-icon:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3rpx;
  height: 16rpx;
  transform: translate(0, -100%);
}

.new-chat-button {
  font-size: 28rpx;
  background: linear-gradient(135deg, #00b4cc 0%, #a64dff 50%, #0066ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: right;
  font-weight: bold;
  text-shadow: none;
}

.center-content {
  flex: 1;
  display: flex;
  flex-direction: column; 
  justify-content: center;
  align-items: center;
  margin-top: 60rpx;
}

.chat-container {
  flex: 1;
  width: 100%;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  margin-top: 60rpx;
}

.message-item {
  width: 100%;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
}

.ai-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
  padding: 0 30rpx;
  flex-wrap: wrap; /* 允许内容换行 */
}

.user-message {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40rpx;
}

.ai-avatar {
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 600rpx;
  flex-shrink: 0; /* 防止头像被挤压 */
}

.small-cube {
  width: 50rpx;
  height: 50rpx;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 10s infinite linear;
}

.small-cube .cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #B0E0E6 0%, #00b4cc 50%, #008B8B 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.small-cube .face-front { transform: translateZ(25rpx); }
.small-cube .face-back { transform: rotateY(180deg) translateZ(25rpx); }
.small-cube .face-right { transform: rotateY(90deg) translateZ(25rpx); }
.small-cube .face-left { transform: rotateY(-90deg) translateZ(25rpx); }
.small-cube .face-top { transform: rotateX(90deg) translateZ(25rpx); }
.small-cube .face-bottom { transform: rotateX(-90deg) translateZ(25rpx); }

.message-content {
  display: flex;
  flex-direction: column;
  width: calc(100% - 100rpx); /* 保持头像的空间 */
  position: relative;
  align-items: flex-start; /* 文本气泡靠左 */
}

.ai-bubble {
  background-color: #f0f9ff;
  padding: 20rpx 25rpx;
  border-radius: 0 12rpx 12rpx 12rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  line-height: 1.5;
  color: #333;
  word-break: break-word;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  width: fit-content;
  max-width: 100%;
  align-self: flex-start; /* 确保气泡靠左对齐 */
}

.user-bubble {
  max-width: 75%;
  padding: 20rpx;
  background-color: #f0e6ff; /* 淡紫色背景 */
  border-radius: 20rpx;
  font-size: 30rpx;
  color: #333;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  justify-content: center;
  height: 100rpx;
  perspective: 1200rpx;
  margin-bottom: 60rpx;
}

.cube {
  width: 100rpx;
  height: 100rpx;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 10s infinite linear;
}

@keyframes rotate {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #B0E0E6 0%, #00b4cc 50%, #008B8B 100%);
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.face-front { transform: translateZ(50rpx); }
.face-back { transform: translateZ(-50rpx) rotateY(180deg); }
.face-right { transform: rotateY(90deg) translateZ(50rpx); }
.face-left { transform: rotateY(-90deg) translateZ(50rpx); }
.face-top { transform: rotateX(90deg) translateZ(50rpx); }
.face-bottom { transform: rotateX(-90deg) translateZ(50rpx); }

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  color: #000;
  margin-bottom: 30rpx;
}

.subtitle {
  font-size: 32rpx;
  color: #333;
  line-height: 1.5;
  max-width: 80%;
}

.bottom-content {
  margin-top: 20rpx;
  width: 100%;
}

.message-container {
  margin-bottom: 40rpx;
  width: 100%;
}

.message-textarea {
  width: 100%;
  height: 150rpx;
  background-color: #f5f7fa;
  border: 2rpx solid #e0e0e0;
  border-radius: 30rpx;
  padding: 20rpx 30rpx;
  font-size: 32rpx;
  color: #000;
  box-sizing: border-box;
  overflow-y: auto;
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.function-buttons-group {
  display: flex;
  gap: 20rpx;
}

.function-button {
  width: 180rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  background-color: #fff;
  color: #444;
  border: 2rpx solid #e0e0e0;
  font-weight: bold;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
}

.send-button {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #00b4cc 0%, #008B8B 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 50rpx rgba(0, 180, 204, 0.4);
}

/* 历史记录面板 */
.history-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: flex-end;
}

.history-panel-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.history-panel-content {
  width: 70%;
  height: 100%;
  background-color: #fff;
  position: relative;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.15);
}

.history-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.history-panel-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.history-panel-close {
  font-size: 48rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.history-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.history-item {
  padding: 30rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.history-item-title {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.history-item-time {
  font-size: 26rpx;
  color: #999;
}

.history-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  color: #999;
  font-size: 30rpx;
}

/* 表格相关样式 */
.ai-bubble .md-table {
  border-collapse: collapse;
  width: 100%;
  margin: 20rpx 0;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 8rpx;
  overflow: hidden;
}

.ai-bubble .md-table-row {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.ai-bubble .md-table-row:last-child {
  border-bottom: none;
}

.ai-bubble .md-table-cell {
  padding: 16rpx 20rpx;
  text-align: left;
  flex: 1;
  border-right: 1px solid #ddd;
  font-size: 28rpx;
}

.ai-bubble .md-table-cell:last-child {
  border-right: none;
}

.ai-bubble th.md-table-cell {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* 引用样式 */
.ai-bubble blockquote {
  border-left: 8rpx solid #ddd;
  padding: 10rpx 20rpx;
  margin: 20rpx 0;
  color: #666;
  background-color: #f9f9f9;
}

/* 改进代码块样式 */
.ai-bubble .code-block {
  background-color: #f6f8fa;
  border-radius: 8rpx;
  padding: 20rpx;
  font-family: monospace;
  font-size: 28rpx;
  line-height: 1.5;
  overflow-x: auto;
  margin: 20rpx 0;
  white-space: pre-wrap;
}

/* 添加展开按钮样式 */
.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  padding: 15rpx 30rpx;
  background: #f0f8ff;
  border-radius: 30rpx;
  color: #409EFF;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.expand-icon {
  transform: rotate(90deg);
  margin-left: 10rpx;
  font-weight: bold;
}

/* 内容区块样式 */
.detail-text-block {
  margin-bottom: 30rpx;
  padding: 0 10rpx;
}

.detail-chart-block {
  margin: 30rpx 0;
  border-radius: 8rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 内联详情内容样式 */
.inline-detail-content {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  border: 1rpx solid #e6e6e6;
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 展开按钮样式调整 */
.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  padding: 15rpx 30rpx;
  background: #f0f8ff;
  border-radius: 30rpx;
  color: #409EFF;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.expand-icon {
  transition: transform 0.3s;
  margin-left: 10rpx;
  font-weight: bold;
}

/* 图表容器样式 */
.chart-container-outside {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  border: 1rpx solid #e6e6e6;
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chart-block {
  margin: 30rpx 0;
  border-radius: 8rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 图表直接显示容器，增加宽度并居中 */
.chart-container-direct {
  width: 92%; /* 增加宽度，之前是85% */
  margin: 30rpx auto; /* 使用auto实现水平居中 */
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

/* 确保图表容器内的文本正确显示 */
.chart-container-direct .detail-text-block {
  margin-bottom: 30rpx;
  padding: 0 15rpx; /* 增加一点内边距 */
}

/* 图表块样式优化 */
.chart-container-direct .chart-block {
  width: 100%;
  margin: 20rpx 0;
  border-radius: 8rpx;
  overflow: hidden;
}

/* 修复AI思考状态的显示 */
.ai-typing {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  border: 1rpx solid #e6e6e6;
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.ai-avatar {
  width: 70rpx;
  height: 70rpx;
  margin-right: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 600rpx;
}

.small-cube {
  width: 50rpx;
  height: 50rpx;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 10s infinite linear;
}

.small-cube .cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #B0E0E6 0%, #00b4cc 50%, #008B8B 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.small-cube .face-front { transform: translateZ(25rpx); }
.small-cube .face-back { transform: rotateY(180deg) translateZ(25rpx); }
.small-cube .face-right { transform: rotateY(90deg) translateZ(25rpx); }
.small-cube .face-left { transform: rotateY(-90deg) translateZ(25rpx); }
.small-cube .face-top { transform: rotateX(90deg) translateZ(25rpx); }
.small-cube .face-bottom { transform: rotateX(-90deg) translateZ(25rpx); }

.thinking-text {
  font-size: 32rpx;
  color: #333;
  margin-left: 20rpx;
}

/* 内容卡片样式 - 超宽居中显示 */
.content-card {
  margin: 20rpx auto 30rpx; /* 保持上、左右、下边距 */
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #eaeaea;
  width: 115%; /* 设置为更合适的115% */
  box-sizing: border-box;
  position: relative; /* 确保相对于父元素定位 */
  left: -57rpx; /* 调整左偏移量以确保居中 */
}

/* 文本块样式 */
.text-block {
  margin-bottom: 20rpx;
  line-height: 1.6;
}

/* 图表容器样式 */
.chart-container {
  margin: 30rpx auto; /* 保持上下边距30rpx，左右auto实现居中 */
  border-radius: 8rpx;
  overflow: hidden;
  width: 95%; /* 保持图表略小于名片宽度 */
}

/* AI消息内容容器 */
.message-content {
  display: flex;
  flex-direction: column;
  width: calc(100% - 100rpx); /* 保持头像的空间 */
  position: relative;
  align-items: flex-start; /* 文本气泡靠左 */
}

/* 确保AI对话气泡样式正确 */
.ai-bubble {
  background-color: #f0f9ff;
  padding: 20rpx 25rpx;
  border-radius: 0 12rpx 12rpx 12rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  line-height: 1.5;
  color: #333;
  word-break: break-word;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  width: fit-content;
  max-width: 100%;
  align-self: flex-start; /* 确保气泡靠左对齐 */
}

/* 错误消息样式 */
.ai-bubble.error-message {
  background-color: #fff2f0;
  border-left: 4rpx solid #ff4d4f;
}

.error-type {
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 10rpx;
  font-size: 28rpx;
}

.error-detail {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}
</style> 