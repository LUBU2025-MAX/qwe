<template>
  <view class="login-container">
    <!-- 添加钢铁厂元素 -->
    <view class="factory-element furnace"></view>
    <view class="factory-element crane"></view>
    <view class="factory-element steel-coil"></view>
    <view class="factory-element gear">
      <view class="gear-teeth"></view>
      <view class="gear-teeth"></view>
      <view class="gear-teeth"></view>
      <view class="gear-teeth"></view>
    </view>
    
    <view class="login-card">
      <view class="login-title">欢迎回来</view>
      <view class="login-subtitle">请登录您的账号继续</view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="text" 
          v-model="loginForm.username" 
          placeholder="请输入用户名" 
        />
      </view>
      
      <view class="input-group">
        <input 
          class="input-field" 
          type="password" 
          v-model="loginForm.password" 
          placeholder="请输入密码" 
        />
      </view>
      
      <view class="login-options">
        <view class="remember-me">
          <checkbox 
            :checked="loginForm.remember" 
            @tap="loginForm.remember = !loginForm.remember" 
            color="#ff9f43"
            style="transform: scale(0.8);"
          ></checkbox>
          <text @tap="loginForm.remember = !loginForm.remember">记住我</text>
        </view>
        <text class="forgot-password" @tap="toForgotPassword">忘记密码?</text>
      </view>
      
      <button class="login-button" @tap="handleLogin">登录</button>
      
      <view class="register-link">
        还没有账号? <text @tap="toRegister" class="register-text">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';

/**
 * @description 登录表单数据
 * @type {Object}
 * @property {string} username - 用户名
 * @property {string} password - 密码
 * @property {boolean} remember - 是否记住我
 */
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

/**
 * @description 处理登录按钮点击事件
 * @returns {void}
 */
const handleLogin = () => {
  if (!loginForm.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    });
    return;
  }
  
  if (!loginForm.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  
  // 这里添加登录逻辑
  console.log('登录信息:', loginForm);
  
  // 模拟登录请求
  uni.showLoading({
    title: '登录中...'
  });
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    });
    
    // 登录成功后跳转到首页
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  }, 2000);
};

/**
 * @description 跳转到忘记密码页面
 * @returns {void}
 */
const toForgotPassword = () => {
  uni.navigateTo({
    url: '/pages/forgot-password/forgot-password'
  });
};

/**
 * @description 跳转到注册页面
 * @returns {void}
 */
const toRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  });
};
</script>

<style lang="scss">
.login-container {
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

/* 工厂元素样式优化 */
.factory-element {
  position: absolute;
  z-index: 5; /* 提高z-index确保可见 */
  pointer-events: none;
}

/* 熔炉 - 左下角 */
.furnace {
  left: 40rpx;
  bottom: 100rpx;
  width: 120rpx;
  height: 160rpx;
}

/* 熔炉主体 */
.furnace::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10rpx;
  width: 100rpx;
  height: 120rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 10rpx 10rpx 0 0;
  background: linear-gradient(to bottom, rgba(255, 100, 50, 0.1), rgba(255, 140, 0, 0.2));
}

/* 熔炉顶部 */
.furnace::after {
  content: '';
  position: absolute;
  bottom: 120rpx;
  left: 35rpx;
  width: 50rpx;
  height: 40rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 25rpx 25rpx 0 0;
}

/* 起重机 - 右侧 */
.crane {
  right: 50rpx;
  bottom: 120rpx;
  width: 140rpx;
  height: 200rpx;
}

/* 起重机立柱 */
.crane::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: 20rpx;
  width: 20rpx;
  height: 160rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  background-color: rgba(255, 255, 255, 0.1);
}

/* 起重机臂 */
.crane::after {
  content: '';
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 100rpx;
  height: 0;
  border-top: 3rpx solid rgba(255, 255, 255, 0.9);
  border-left: 3rpx solid rgba(255, 255, 255, 0.9);
  transform-origin: right top;
  transform: rotate(-30deg);
}

/* 钢卷 - 左侧中部 */
.steel-coil {
  left: 80rpx;
  top: 150rpx;
  width: 80rpx;
  height: 60rpx;
}

/* 钢卷主体 */
.steel-coil::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60rpx;
  height: 60rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background-color: rgba(200, 200, 240, 0.2);
}

/* 钢卷内圈 */
.steel-coil::after {
  content: '';
  position: absolute;
  top: 15rpx;
  left: 15rpx;
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

/* 齿轮 - 右上方 */
.gear {
  right: 80rpx;
  top: 150rpx;
  width: 70rpx;
  height: 70rpx;
}

/* 齿轮外圈 */
.gear::before {
  content: '';
  position: absolute;
  top: 5rpx;
  left: 5rpx;
  width: 60rpx;
  height: 60rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background-color: rgba(220, 220, 255, 0.1);
}

/* 齿轮中心 */
.gear::after {
  content: '';
  position: absolute;
  top: 25rpx;
  left: 25rpx;
  width: 20rpx;
  height: 20rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

/* 添加几个齿轮齿 */
.gear-teeth {
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 2rpx;
}

.gear-teeth:nth-child(1) {
  top: 0;
  left: 30rpx;
}

.gear-teeth:nth-child(2) {
  top: 60rpx;
  left: 30rpx;
}

.gear-teeth:nth-child(3) {
  top: 30rpx;
  left: 0;
}

.gear-teeth:nth-child(4) {
  top: 30rpx;
  left: 60rpx;
}

/* 增强几何图案可见度 */
.login-container::before {
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

.login-container::after {
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

/* 添加不规则形状渐变装饰 */
.login-container {
  &::before, &::after {
    pointer-events: none;
  }
}

/* 装饰元素1: 左上角不规则三角形 */
.login-card::before {
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
  animation: float 8s ease-in-out infinite;
}

/* 装饰元素2: 右侧不规则圆形 */
.login-card::after {
  content: '';
  position: absolute;
  bottom: -150rpx;
  right: -100rpx;
  width: 250rpx;
  height: 250rpx;
  background: linear-gradient(to left, rgba(147, 88, 247, 0.3), rgba(147, 88, 247, 0));
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  z-index: -1;
  animation: float 10s ease-in-out infinite reverse;
}

/* 装饰元素3: 右上角小点 */
.login-title::before {
  content: '';
  position: absolute;
  top: -60rpx;
  right: 40rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #23F0C7;
  border-radius: 50%;
  box-shadow: 0 0 20rpx rgba(35, 240, 199, 0.8);
}

/* 装饰元素4: 左侧波浪线 */
.login-title::after {
  content: '';
  position: absolute;
  left: -20rpx;
  top: 30%;
  width: 8rpx;
  height: 120rpx;
  background: linear-gradient(to bottom, #23F0C7, rgba(35, 240, 199, 0));
  border-radius: 8rpx;
}

.login-card {
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

/* 浮动动画 */
@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

.login-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  color: #333333;
  margin-bottom: 12rpx;
  position: relative;
}

.login-subtitle {
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

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666666;
}

.forgot-password {
  font-size: 26rpx;
  color: #5e35b1;
}

.login-button {
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

.login-button::after {
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

.login-button:active::after {
  transform: rotate(30deg) translate(10%, 10%);
}

.register-link {
  text-align: center;
  font-size: 26rpx;
  color: #666666;
  margin-top: 20rpx;
}

.register-text {
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