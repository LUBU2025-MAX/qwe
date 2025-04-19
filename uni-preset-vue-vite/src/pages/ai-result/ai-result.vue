<template>
  <view class="result-container">
    <!-- 添加钢铁厂元素装饰 -->
    <view class="factory-element factory-chart"></view>
    <view class="factory-element factory-monitor"></view>
    
    <!-- 问题显示卡片 -->
    <view class="result-card question-card">
      <view class="card-title">您的问题</view>
      <view class="question-content">{{ question }}</view>
    </view>
    
    <!-- 回答内容卡片 -->
    <view class="result-card answer-card">
      <view class="card-title">AI回答</view>
      <view class="loading-box" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">AI正在思考中...</text>
      </view>
      <view class="answer-content" v-else>
        {{ answer }}
      </view>
      
      <view class="feedback-section" v-if="!loading">
        <text class="feedback-title">回答对您有帮助吗？</text>
        <view class="feedback-buttons">
          <button class="feedback-button positive" @tap="submitFeedback(true)">
            <text class="feedback-icon">👍</text>有帮助
          </button>
          <button class="feedback-button negative" @tap="submitFeedback(false)">
            <text class="feedback-icon">👎</text>没帮助
          </button>
        </view>
      </view>
      
      <view class="action-buttons">
        <button class="action-button back-button" @tap="goBack">返回</button>
        <button class="action-button new-button" @tap="askNewQuestion">新问题</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

/**
 * @description AI返回的回答内容
 * @type {Ref<string>}
 */
const answer = ref('这是AI助手对您问题的回答。在这里您将看到针对您提出问题的详细解答。回答内容将根据您的提问自动生成，包含相关信息和建议。您可以选择保存这个回答，或者返回重新提问。');

/**
 * @description 已保存的回答列表
 * @type {Ref<Array<string>>}
 */
const savedAnswers = ref([
  '如何使用AI助手？AI助手是一个智能问答工具，您可以输入任何问题...',
  '支持哪些类型的问题？本AI助手支持多种类型的问题，包括但不限于...',
  '如何提高回答准确率？要提高AI回答的准确率，请尽可能清晰地描述您的问题...'
]);

/**
 * @description 是否处于管理模式
 * @type {Ref<boolean>}
 */
const isManageMode = ref(false);

/**
 * @description 加载状态
 * @type {Ref<boolean>}
 */
const loading = ref(true);

/**
 * @description 用户问题
 * @type {Ref<string>}
 */
const question = ref('');

/**
 * @description 处理返回按钮点击事件
 * @returns {void}
 */
const handleBack = () => {
  uni.navigateBack();
};

/**
 * @description 处理保存按钮点击事件
 * @returns {void}
 */
const handleSave = () => {
  if (!answer.value.trim()) {
    uni.showToast({
      title: '没有内容可保存',
      icon: 'none'
    });
    return;
  }
  
  // 将当前回答添加到保存列表
  savedAnswers.value.unshift(answer.value);
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  });
};

/**
 * @description 查看已保存的回答
 * @param {number} index - 回答的索引
 * @returns {void}
 */
const viewSavedAnswer = (index) => {
  answer.value = savedAnswers.value[index];
  
  uni.showToast({
    title: '已加载保存的回答',
    icon: 'none'
  });
};

/**
 * @description 切换管理模式
 * @returns {void}
 */
const toggleManageMode = () => {
  isManageMode.value = !isManageMode.value;
};

/**
 * @description 删除保存的回答
 * @param {number} index - 要删除的回答索引
 * @returns {void}
 */
const deleteAnswer = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条保存的内容吗？',
    success: (res) => {
      if (res.confirm) {
        savedAnswers.value.splice(index, 1);
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      }
    }
  });
};

/**
 * @description 页面加载时获取问题并生成回答
 */
onMounted(() => {
  // 从本地存储获取问题
  const storedQuestion = uni.getStorageSync('currentQuestion');
  if (storedQuestion) {
    question.value = storedQuestion;
  }
  
  // 模拟AI生成回答的过程
  setTimeout(() => {
    generateAnswer();
  }, 2000);
});

/**
 * @description 生成AI回答
 */
const generateAnswer = () => {
  // 这里应该是调用AI接口获取回答
  // 这里使用模拟数据
  const demoAnswers = {
    '如何查看生产计划?': '您可以在系统首页点击"生产管理"模块，然后选择"生产计划"选项。在此页面，您可以按照日期、车间或产品类型筛选查看相关的生产计划。此外，系统支持导出计划报表功能，您可以导出Excel或PDF格式的计划文档进行打印或分享。',
    '如何处理设备故障?': '发现设备故障后，请按以下步骤处理：\n1. 立即停止设备运行，确保安全\n2. 登录系统，点击"设备管理"->"故障报修"\n3. 填写详细的故障描述、设备编号和紧急程度\n4. 提交后系统会自动通知维修团队\n5. 跟踪维修进度，在维修完成后确认验收',
    '如何提交原材料申请?': '提交原材料申请的流程如下：\n1. 进入"库存管理"模块\n2. 点击"材料申请"按钮\n3. 填写申请表单，包括材料名称、规格、数量和用途\n4. 选择需求日期和优先级\n5. 提交申请后，等待主管审批\n6. 审批通过后，系统会自动安排材料出库',
    '如何查看库存状态?': '查看库存状态的方法有两种：\n1. 快速查看：在系统首页的"库存概览"卡片中可以看到主要材料的库存情况\n2. 详细查询：进入"库存管理"->"库存查询"页面，您可以按物料编码、名称或仓库位置进行筛选查询\n系统会显示当前库存量、安全库存量和最近入库出库记录。'
  };
  
  // 根据问题返回对应答案，如果没有匹配则给出通用回复
  answer.value = demoAnswers[question.value] || '对于您的问题"' + question.value + '"，建议您联系相关部门获取更准确的信息。我们的系统会不断更新知识库以提供更好的服务。';
  
  // 设置加载完成
  loading.value = false;
};

/**
 * @description 提交反馈
 * @param {boolean} isPositive - 是否是正面反馈
 */
const submitFeedback = (isPositive) => {
  // 这里应该是提交反馈到服务器
  console.log('用户反馈:', isPositive ? '有帮助' : '没帮助');
  
  uni.showToast({
    title: '感谢您的反馈',
    icon: 'success'
  });
};

/**
 * @description 返回上一页
 */
const goBack = () => {
  uni.navigateBack();
};

/**
 * @description 提出新问题
 */
const askNewQuestion = () => {
  uni.navigateBack();
};
</script>

<style lang="scss">
page {
  background: linear-gradient(135deg, #4776E6, #8E54E9);
}

.result-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  padding: 60rpx 40rpx;
  position: relative;
  overflow: hidden;
}

/* 几何图案装饰 */
.result-container::before {
  content: '';
  position: absolute;
  top: -5%;
  left: -5%;
  width: 70%;
  height: 60%;
  background: linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.2) 49%, rgba(255, 255, 255, 0.2) 51%, transparent 52%);
  background-size: 30rpx 30rpx;
  transform: rotate(15deg);
  z-index: 1;
}

.result-container::after {
  content: '';
  position: absolute;
  bottom: -5%;
  right: -5%;
  width: 60%;
  height: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 3px, transparent 4px);
  background-size: 30rpx 30rpx;
  z-index: 1;
}

/* 工厂元素 */
.factory-element {
  position: absolute;
  z-index: 5;
  pointer-events: none;
}

/* 图表元素 - 左侧 */
.factory-chart {
  left: 60rpx;
  top: 200rpx;
  width: 100rpx;
  height: 80rpx;
}

.factory-chart::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100rpx;
  height: 2rpx;
  background-color: rgba(255, 255, 255, 0.9);
}

.factory-chart::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10rpx;
  width: 10rpx;
  height: 30rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 
    20rpx 0 0 0 rgba(255, 255, 255, 0.2),
    40rpx 0 0 0 rgba(255, 255, 255, 0.2),
    60rpx 0 0 0 rgba(255, 255, 255, 0.2),
    80rpx 0 0 0 rgba(255, 255, 255, 0.2),
    20rpx 0 0 0 rgba(255, 255, 255, 0.9) inset,
    40rpx 0 0 0 rgba(255, 255, 255, 0.9) inset,
    60rpx 0 0 0 rgba(255, 255, 255, 0.9) inset,
    80rpx 0 0 0 rgba(255, 255, 255, 0.9) inset;
  height: 20rpx;
  bottom: 2rpx;
  left: 10rpx;
}

/* 监控屏 - 右侧 */
.factory-monitor {
  right: 60rpx;
  bottom: 180rpx;
  width: 80rpx;
  height: 60rpx;
}

.factory-monitor::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 80rpx;
  height: 60rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 6rpx;
  background-color: rgba(255, 255, 255, 0.1);
}

.factory-monitor::after {
  content: '';
  position: absolute;
  bottom: -15rpx;
  left: 35rpx;
  width: 15rpx;
  height: 15rpx;
  border-left: 3rpx solid rgba(255, 255, 255, 0.9);
  border-right: 3rpx solid rgba(255, 255, 255, 0.9);
  border-bottom: 3rpx solid rgba(255, 255, 255, 0.9);
}

/* 卡片通用样式 */
.result-card {
  width: 85%;
  max-width: 650rpx;
  margin: 20rpx auto;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 25rpx rgba(0, 0, 0, 0.15),
              0 0 30rpx rgba(71, 118, 230, 0.1);
  position: relative;
  z-index: 2;
  border-left: 4rpx solid #23F0C7;
  overflow: hidden;
}

/* 问题卡片样式 */
.question-card {
  margin-top: 60rpx;
}

/* 问题卡片装饰 */
.question-card::before {
  content: '';
  position: absolute;
  top: -120rpx;
  left: -80rpx;
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(to right, rgba(35, 240, 199, 0.3), rgba(35, 240, 199, 0));
  border-radius: 35% 65% 60% 40% / 45% 45% 55% 55%;
  transform: rotate(30deg);
  z-index: -1;
}

/* 回答卡片样式 */
.answer-card {
  margin-top: 30rpx;
}

/* 回答卡片装饰 */
.answer-card::after {
  content: '';
  position: absolute;
  bottom: -150rpx;
  right: -100rpx;
  width: 250rpx;
  height: 250rpx;
  background: linear-gradient(to left, rgba(147, 88, 247, 0.3), rgba(147, 88, 247, 0));
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  z-index: -1;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 25rpx;
  position: relative;
  padding-left: 20rpx;
}

.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 30rpx;
  background-color: #23F0C7;
  border-radius: 3rpx;
}

.question-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.answer-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  white-space: pre-wrap;
}

/* 加载样式 */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(94, 53, 177, 0.1);
  border-left-color: #5e35b1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}

/* 反馈部分 */
.feedback-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.feedback-title {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  margin-bottom: 20rpx;
  display: block;
}

.feedback-buttons {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.feedback-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 30rpx;
  background-color: #f0f0f0;
  border: none;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #333;
}

.feedback-button.positive {
  background-color: rgba(35, 240, 199, 0.1);
  color: #007160;
}

.feedback-button.negative {
  background-color: rgba(94, 53, 177, 0.1);
  color: #5e35b1;
}

.feedback-icon {
  margin-right: 10rpx;
  font-size: 28rpx;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.action-button {
  width: 45%;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.back-button {
  background-color: #f0f0f0;
  color: #666;
}

.new-button {
  background: linear-gradient(to right, #5e35b1, #8E54E9);
  color: #ffffff;
  font-weight: bold;
  box-shadow: 0 4rpx 15rpx rgba(94, 53, 177, 0.3);
}
</style> 