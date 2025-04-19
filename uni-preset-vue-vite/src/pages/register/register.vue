<template>
  <view class="register-container">
    <!-- 添加钢铁厂元素 -->
    <view class="factory-element pipe"></view>
    <view class="factory-element control-panel"></view>
    
    <view class="register-card">
      <view class="register-title">创建账号</view>
      <view class="register-subtitle">注册一个新账号</view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="text" 
          v-model="registerForm.username" 
          placeholder="请输入用户名" 
        />
      </view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="password" 
          v-model="registerForm.password" 
          placeholder="请输入密码" 
        />
      </view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="password" 
          v-model="registerForm.confirmPassword" 
          placeholder="请确认密码" 
        />
      </view>
      
      <button class="register-button" @tap="handleRegister">注册</button>
      
      <view class="login-link">
        已有账号? <text @tap="toLogin" class="login-text">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';

/**
 * @description 注册表单数据
 * @type {Object}
 * @property {string} username - 用户名
 * @property {string} password - 密码
 * @property {string} confirmPassword - 确认密码
 */
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

/**
 * @description 处理注册按钮点击事件
 * @returns {void}
 */
const handleRegister = () => {
  if (!registerForm.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    });
    return;
  }
  
  // 这里添加注册逻辑
  console.log('注册信息:', registerForm);
  
  // 模拟注册请求
  uni.showLoading({
    title: '注册中...'
  });
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    });
    
    // 注册成功后跳转到登录页面
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 2000);
};

/**
 * @description 跳转到登录页面
 * @returns {void}
 */
const toLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4776E6, #8E54E9);
  padding: 60rpx;
  position: relative;
  overflow: hidden;
}

/* 几何图案装饰 */
.register-container::before {
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

.register-container::after {
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

/* 钢管 - 左上角 */
.pipe {
  left: 60rpx;
  top: 120rpx;
  width: 120rpx;
  height: 30rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  transform: rotate(-30deg);
}

/* 控制面板 - 右上角 */
.control-panel {
  right: 60rpx;
  top: 120rpx;
  width: 80rpx;
  height: 100rpx;
}

.control-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 80rpx;
  height: 100rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 10rpx;
  background-color: rgba(255, 255, 255, 0.1);
}

.control-panel::after {
  content: '';
  position: absolute;
  top: 20rpx;
  left: 15rpx;
  width: 50rpx;
  height: 10rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 5rpx;
  box-shadow: 0 20rpx 0 0 rgba(255, 255, 255, 0.9), 0 40rpx 0 0 rgba(255, 255, 255, 0.9);
}

.register-card {
  width: 85%;
  max-width: 600rpx;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 4rpx 25rpx rgba(0, 0, 0, 0.15),
              0 0 30rpx rgba(71, 118, 230, 0.1);
  position: relative;
  z-index: 2;
  border-left: 4rpx solid #23F0C7;
  overflow: hidden;
}

/* 不规则形状装饰 */
.register-card::before {
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

.register-card::after {
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

.register-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  color: #333333;
  margin-bottom: 12rpx;
  position: relative;
}

.register-subtitle {
  font-size: 28rpx;
  text-align: center;
  color: #999999;
  margin-bottom: 60rpx;
}

.input-group {
  margin-bottom: 30rpx;
  position: relative;
}

.input-field {
  width: 100%;
  height: 90rpx;
  background-color: #f8f8f8;
  border: none;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  color: #333;
  transition: all 0.3s ease;
}

.input-field:focus {
  box-shadow: 0 0 0 2rpx #5e35b1;
  background-color: #fff;
}

.register-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #5e35b1, #8E54E9);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  border: none;
  font-weight: bold;
  box-shadow: 0 4rpx 15rpx rgba(94, 53, 177, 0.3);
  position: relative;
  overflow: hidden;
}

.register-button::after {
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

.register-button:active::after {
  transform: rotate(30deg) translate(10%, 10%);
}

.login-link {
  text-align: center;
  font-size: 26rpx;
  color: #666666;
  margin-top: 20rpx;
}

.login-text {
  color: #5e35b1;
}

.input-group::after {
  content: '';
  position: absolute;
  right: 10rpx;
  bottom: -10rpx;
  width: 30rpx;
  height: 4rpx;
  background-color: #23F0C7;
  border-radius: 4rpx;
}
</style> 