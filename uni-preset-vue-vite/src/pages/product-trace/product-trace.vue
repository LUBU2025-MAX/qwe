<template>
  <view class="trace-container">
    <!-- 顶部背景 -->
    <view class="bg-top"></view>
    
    <!-- 页面内容 -->
    <view class="trace-content">
      <!-- 标题 -->
      <view class="trace-header">
        <text class="trace-title">产品追溯系统</text>
        <text class="trace-subtitle">实时查询产品全生命周期信息</text>
      </view>
      
      <!-- 搜索区域 -->
      <view class="search-area">
        <input 
          class="product-input" 
          type="text" 
          v-model="productCode" 
          placeholder="商品编号输入" 
        />
        <button class="confirm-btn" @tap="searchProduct">确认</button>
      </view>
      
      <!-- 产品信息卡片列表 -->
      <view v-if="showResult">
        <view 
          class="info-card" 
          v-for="(module, index) in productModules" 
          :key="index"
        >
          <view class="module-header">
            <text class="module-title">{{ module.title }}</text>
            <text class="module-date">{{ module.date }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">时间</text>
            <text class="info-value">{{ module.time }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">负责人</text>
            <text class="info-value">{{ module.responsible }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">地点</text>
            <text class="info-value">{{ module.location }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">操作流程</text>
            <text class="info-value">{{ module.process }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">产品信息</text>
            <text class="info-value">{{ module.productDetails }}</text>
          </view>
        </view>
      </view>
      
      <!-- 可视化区域 -->
      <view class="visualization-card" v-if="showResult">
        <view class="visualization-title">可视化</view>
        <view class="visualization-placeholder">
          <input 
            class="visualization-input" 
            type="text" 
            disabled 
            placeholder="可视化模块开发中..." 
          />
        </view>
      </view>
      
      <!-- 预警信息 -->
      <view class="warning-card" v-if="showResult">
        <view class="warning-title">预警信息：</view>
        <view class="warning-content" :class="{'warning-alert': isWarning}">
          {{ warningInfo || '暂无预警信息' }}
        </view>
      </view>
    </view>
    
    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <text class="back-text">返回</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

/**
 * @description 产品编号
 * @type {Ref<string>}
 */
const productCode = ref('');

/**
 * @description 是否显示结果
 * @type {Ref<boolean>}
 */
const showResult = ref(false);

/**
 * @description 产品信息模块列表
 * @type {Ref<Array>}
 */
const productModules = ref([]);

/**
 * @description 预警信息
 * @type {Ref<string>}
 */
const warningInfo = ref('');

/**
 * @description 是否有预警
 * @type {Ref<boolean>}
 */
const isWarning = ref(false);

/**
 * @description 搜索产品
 */
const searchProduct = () => {
  if (!productCode.value.trim()) {
    uni.showToast({
      title: '请输入商品编号',
      icon: 'none'
    });
    return;
  }
  
  // 显示加载中
  uni.showLoading({
    title: '查询中...'
  });
  
  // 模拟API请求
  setTimeout(() => {
    // 隐藏加载中
    uni.hideLoading();
    
    // 根据输入的编号决定返回单个模块还是多个模块
    if (productCode.value.includes('M')) {
      // 多个模块
      productModules.value = [
        {
          title: '原材料阶段',
          date: '2023-05-10',
          time: '2023-05-10 09:15:32',
          responsible: '李材料师',
          location: '原料仓库B2',
          process: '原料检验 → 入库 → 预处理',
          productDetails: '高强度合金钢原料，批次: R20230510'
        },
        {
          title: '生产阶段',
          date: '2023-05-15',
          time: '2023-05-15 14:30:25',
          responsible: '张工程师',
          location: '生产线A区',
          process: '钢材热处理 → 成型 → 质检 → 包装',
          productDetails: '高强度合金钢，规格: 30cm×50cm，批次: B20230515'
        },
        {
          title: '仓储阶段',
          date: '2023-05-18',
          time: '2023-05-18 16:45:10',
          responsible: '王仓管',
          location: '成品仓库C5',
          process: '入库 → 库存管理 → 出库准备',
          productDetails: '高强度合金钢成品，规格: 30cm×50cm，批次: B20230515'
        }
      ];
    } else {
      // 单个模块
      productModules.value = [
        {
          title: '生产阶段',
          date: '2023-05-15',
          time: '2023-05-15 14:30:25',
          responsible: '张工程师',
          location: '生产线A区',
          process: '钢材热处理 → 成型 → 质检 → 包装',
          productDetails: '高强度合金钢，规格: 30cm×50cm，批次: B20230515'
        }
      ];
    }
    
    // 设置预警信息
    if (productCode.value.startsWith('W')) {
      warningInfo.value = '该批次产品质检发现轻微偏差，建议复检';
      isWarning.value = true;
    } else if (productCode.value.includes('M')) {
      warningInfo.value = '多阶段产品追溯完成，未发现异常';
      isWarning.value = false;
    } else {
      warningInfo.value = '产品信息正常，无需关注';
      isWarning.value = false;
    }
    
    showResult.value = true;
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

.trace-container {
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
.trace-content {
  position: relative;
  padding: 0 40rpx;
  margin-top: -100rpx;
}

/* 标题 */
.trace-header {
  margin-bottom: 60rpx;
}

.trace-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 10rpx;
}

.trace-subtitle {
  font-size: 28rpx;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

/* 搜索区域 */
.search-area {
  display: flex;
  margin-bottom: 30rpx;
}

.product-input {
  flex: 1;
  height: 90rpx;
  background-color: #fff;
  border-radius: 45rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid #e0e0e0;
}

.confirm-btn {
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

/* 信息卡片 */
.info-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

/* 模块头部 */
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #4776E6;
}

.module-date {
  font-size: 24rpx;
  color: #999;
}

.info-item {
  margin-bottom: 20rpx;
}

.info-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.info-value {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* 可视化卡片 */
.visualization-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

.visualization-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
  text-align: center;
}

.visualization-placeholder {
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visualization-input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f7fa;
  border-radius: 10rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

/* 预警信息 */
.warning-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}

.warning-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.warning-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.warning-alert {
  color: #ff6b6b;
}

/* 返回按钮 */
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