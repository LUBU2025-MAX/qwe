<template>
  <view class="assistant-container">
    <!-- 添加钢铁厂元素装饰 -->
    <view class="factory-element conveyor"></view>
    <view class="factory-element measurement"></view>
    
    <!-- 问题输入卡片 -->
    <view class="assistant-card question-card">
      <view class="assistant-title">AI提问助手</view>
      
      <view class="question-input-area">
        <textarea 
          class="question-input" 
          v-model="question" 
          placeholder="请输入您的问题" 
          maxlength="500"
        />
      </view>
      
      <view class="submit-button-container">
        <button class="submit-button" @tap="handleSubmit">提交</button>
      </view>
    </view>
    
    <!-- 常见问题卡片 -->
    <view class="assistant-card faq-card">
      <view class="faq-title">常见问题</view>
      <view class="faq-list">
        <view 
          class="faq-item" 
          v-for="(item, index) in faqList" 
          :key="index" 
          @tap="selectQuestion(item)"
        >
          <text>问题{{index + 1}}：{{item}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

/**
 * @description 用户输入的问题
 * @type {Ref<string>}
 */
const question = ref('');

/**
 * @description 常见问题列表
 * @type {Array<string>}
 */
const faqList = [
  "如何查看生产计划?",
  "如何处理设备故障?",
  "如何提交原材料申请?",
  "如何查看库存状态?"
];

/**
 * @description 选择常见问题
 * @param {string} q - 选择的问题
 * @returns {void}
 */
const selectQuestion = (q) => {
  question.value = q;
};

/**
 * @description 处理提交按钮点击事件
 * @returns {void}
 */
const handleSubmit = () => {
  if (!question.value.trim()) {
    uni.showToast({
      title: '请输入问题',
      icon: 'none'
    });
    return;
  }
  
  // 这里添加提交问题的逻辑
  console.log('提交的问题:', question.value);
  
  // 将问题存储到本地，方便答案页面获取
  uni.setStorageSync('currentQuestion', question.value);
  
  // 跳转到回答页面
  uni.navigateTo({
    url: '/pages/ai-result/ai-result'
  });
};
</script>

<style lang="scss">
page {
  background: linear-gradient(135deg, #4776E6, #8E54E9);
}

.assistant-container {
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
.assistant-container::before {
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

.assistant-container::after {
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

/* 传送带 - 左侧 */
.conveyor {
  left: 50rpx;
  bottom: 150rpx;
  width: 160rpx;
  height: 80rpx;
}

.conveyor::before {
  content: '';
  position: absolute;
  top: 40rpx;
  left: 0;
  width: 160rpx;
  height: 20rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 10rpx;
  background-color: rgba(255, 255, 255, 0.1);
}

.conveyor::after {
  content: '';
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 15rpx;
  height: 20rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 40rpx 0 0 0 rgba(255, 255, 255, 0.9), 80rpx 0 0 0 rgba(255, 255, 255, 0.9), 120rpx 0 0 0 rgba(255, 255, 255, 0.9);
}

/* 测量仪器 - 右侧 */
.measurement {
  right: 60rpx;
  top: 180rpx;
  width: 100rpx;
  height: 120rpx;
}

.measurement::before {
  content: '';
  position: absolute;
  top: 0;
  left: 35rpx;
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.measurement::after {
  content: '';
  position: absolute;
  top: 30rpx;
  left: 48rpx;
  width: 4rpx;
  height: 90rpx;
  background-color: rgba(255, 255, 255, 0.9);
}

/* 卡片通用样式 */
.assistant-card {
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

/* FAQ卡片样式 */
.faq-card {
  margin-top: 30rpx;
}

/* FAQ卡片装饰 */
.faq-card::after {
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

.assistant-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  color: #333333;
  margin-bottom: 12rpx;
  position: relative;
}

.assistant-subtitle {
  font-size: 28rpx;
  text-align: center;
  color: #999999;
  margin-bottom: 30rpx;
}

.question-input-area {
  margin-bottom: 30rpx;
  position: relative;
}

.question-input {
  width: 100%;
  height: 200rpx;
  background-color: #f8f8f8;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  color: #333;
  transition: all 0.3s ease;
}

.question-input:focus {
  box-shadow: 0 0 0 2rpx #5e35b1;
  background-color: #fff;
}

.submit-button-container {
  margin-bottom: 10rpx;
}

.submit-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #5e35b1, #8E54E9);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: bold;
  box-shadow: 0 4rpx 15rpx rgba(94, 53, 177, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
  transition: transform 0.6s;
}

.submit-button:active::after {
  transform: rotate(30deg) translate(10%, 10%);
}

.faq-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 25rpx;
  text-align: center;
  position: relative;
}

.faq-title::after {
  content: '';
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #23F0C7;
  border-radius: 2rpx;
}

.faq-list {
  border-radius: 12rpx;
  overflow: hidden;
}

.faq-item {
  padding: 26rpx 30rpx;
  font-size: 26rpx;
  color: #333;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
}

.faq-item:last-child {
  margin-bottom: 0;
}

.faq-item:active {
  background-color: rgba(94, 53, 177, 0.1);
  transform: translateY(2rpx);
}
</style> 