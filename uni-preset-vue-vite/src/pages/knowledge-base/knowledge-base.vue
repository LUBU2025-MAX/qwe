<template>
  <view class="knowledge-container">
    <!-- 顶部背景 -->
    <view class="bg-top"></view>
    
    <!-- 使用纯文本返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <text class="back-text">返回</text>
    </view>
    
    <!-- 页面内容 -->
    <view class="knowledge-content">
      <!-- 标题 -->
      <view class="knowledge-header">
        <text class="knowledge-title">知识库系统</text>
        <text class="knowledge-subtitle">查询和上传技术文档</text>
      </view>
      
      <!-- 搜索区域 -->
      <view class="search-area">
        <input 
          class="keyword-input" 
          type="text" 
          v-model="keyword" 
          placeholder="输入关键词查找" 
        />
        <button class="search-btn" @tap="searchDocuments">搜索</button>
      </view>
      
      <!-- 我的上传标题 -->
      <view class="section-title">
        <text>我的上传：</text>
      </view>
      
      <!-- 文档列表 -->
      <view class="document-list">
        <view class="document-card" v-for="(doc, index) in myDocuments" :key="index">
          <view class="document-info">
            <view class="info-row">
              <text class="info-label">时间：</text>
              <text class="info-value">{{ doc.time }}</text>
              <text class="info-label upload-person">上传人：</text>
              <text class="info-value">{{ doc.uploader }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">文件名：</text>
              <text class="info-value">{{ doc.fileName }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 上传区域 -->
      <view class="upload-area">
        <view class="section-title">
          <text>请上传：</text>
        </view>
        <view class="upload-content">
          <textarea 
            class="upload-description" 
            v-model="uploadDescription" 
            placeholder="请输入文档描述信息..."
          />
        </view>
        <view class="upload-buttons">
          <button class="upload-file-btn" @tap="selectFile">上传文件</button>
          <button class="submit-btn" @tap="submitUpload">上传</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

/**
 * @description 搜索关键词
 * @type {Ref<string>}
 */
const keyword = ref('');

/**
 * @description 我的上传文档列表
 * @type {Ref<Array>}
 */
const myDocuments = ref([
  {
    time: '2023-06-10 14:30',
    uploader: '张工程师',
    fileName: '高强度合金钢生产工艺规范V2.1.pdf'
  },
  {
    time: '2023-05-22 09:15',
    uploader: '张工程师',
    fileName: '设备维护手册-压力机.docx'
  },
  {
    time: '2023-04-05 16:45',
    uploader: '张工程师',
    fileName: '质量检测标准操作流程.pdf'
  }
]);

/**
 * @description 上传文档描述
 * @type {Ref<string>}
 */
const uploadDescription = ref('');

/**
 * @description 选择的文件
 * @type {Ref<string>}
 */
const selectedFile = ref('');

/**
 * @description 搜索文档
 */
const searchDocuments = () => {
  if (!keyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '搜索中...'
  });
  
  // 模拟搜索请求
  setTimeout(() => {
    uni.hideLoading();
    
    uni.showToast({
      title: '搜索完成',
      icon: 'success'
    });
  }, 1000);
};

/**
 * @description 选择文件
 */
const selectFile = () => {
  uni.showToast({
    title: '文件选择功能开发中',
    icon: 'none'
  });
  
  // 模拟选择文件
  selectedFile.value = '已选择文件：技术文档.pdf';
};

/**
 * @description 提交上传
 */
const submitUpload = () => {
  if (!uploadDescription.value.trim()) {
    uni.showToast({
      title: '请输入文档描述',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '上传中...'
  });
  
  // 模拟上传请求
  setTimeout(() => {
    uni.hideLoading();
    
    // 添加到我的文档列表
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    myDocuments.value.unshift({
      time: timeStr,
      uploader: '张工程师',
      fileName: '新上传文档.pdf'
    });
    
    uploadDescription.value = '';
    
    uni.showToast({
      title: '上传成功',
      icon: 'success'
    });
  }, 1500);
};

/**
 * @description 返回AI聊天页面
 */
const goBack = () => {
  console.log('返回按钮被点击');
  // 直接跳转到AI聊天页面
  uni.reLaunch({
    url: '/pages/ai-chat/ai-chat'
  });
};
</script>

<style lang="scss">
page {
  background-color: #f5f7fa;
}

.knowledge-container {
  min-height: 100vh;
  position: relative;
}

/* 顶部背景 */
.bg-top {
  height: 250rpx;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  border-bottom-left-radius: 50rpx;
  border-bottom-right-radius: 50rpx;
}

/* 页面内容 */
.knowledge-content {
  position: relative;
  padding: 0 40rpx;
  margin-top: -100rpx;
}

/* 标题 */
.knowledge-header {
  margin-bottom: 60rpx;
}

.knowledge-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 10rpx;
}

.knowledge-subtitle {
  font-size: 28rpx;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

/* 搜索区域 */
.search-area {
  display: flex;
  margin-bottom: 30rpx;
}

.keyword-input {
  flex: 1;
  height: 90rpx;
  background-color: #fff;
  border-radius: 45rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid #e0e0e0;
}

.search-btn {
  width: 160rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  color: #fff;
  border-radius: 45rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
  box-shadow: 0 5rpx 15rpx rgba(71, 118, 230, 0.3);
}

/* 区域标题 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin: 30rpx 0 20rpx;
  padding: 0 20rpx;
}

/* 文档列表 */
.document-list {
  margin-bottom: 30rpx;
}

.document-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

.document-info {
  width: 100%;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10rpx;
}

.info-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.upload-person {
  margin-left: auto;
}

.info-value {
  font-size: 28rpx;
  color: #666;
  margin-right: 20rpx;
}

/* 上传区域 */
.upload-area {
  margin-bottom: 40rpx;
}

.upload-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

.upload-description {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.upload-buttons {
  display: flex;
  justify-content: space-between;
}

.upload-file-btn, .submit-btn {
  width: 45%;
  height: 90rpx;
  border-radius: 45rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
}

.upload-file-btn {
  background-color: #fff;
  color: #4776E6;
  border: 2rpx solid #4776E6;
}

.submit-btn {
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  color: #fff;
}

/* 返回按钮样式 */
.back-btn {
  position: fixed;
  top: 60rpx;
  left: 30rpx;
  width: 100rpx;
  height: 60rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.back-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
}
</style> 