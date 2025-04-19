<template>
    <view class="chat-container">
      <!-- 添加钢铁厂元素装饰 -->
      <view class="factory-element data-flow"></view>
      <view class="factory-element control-panel"></view>
      
      <!-- 历史记录侧边抽屉 -->
      <view class="history-drawer" :class="{ 'history-drawer-show': showHistoryDrawer }">
        <view class="history-drawer-header">
          <text class="history-drawer-title">历史记录</text>
          <view class="history-drawer-close" @tap="hideHistory">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <scroll-view class="history-list" scroll-y="true">
          <view 
            class="history-item" 
            v-for="(item, index) in historyList" 
            :key="index"
            @tap="loadChatHistory(item)"
          >
            <view class="history-item-content">
              <text class="history-item-title">{{ item.title }}</text>
              <text class="history-item-time">{{ item.time }}</text>
            </view>
            <view class="history-item-arrow">›</view>
          </view>
          
          <view class="empty-history" v-if="historyList.length === 0">
            <text class="empty-history-text">暂无历史记录</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 遮罩层 -->
      <view 
        class="drawer-mask" 
        v-if="showHistoryDrawer" 
        @tap="hideHistory"
      ></view>
      
      <!-- 顶部导航 -->
      <view class="chat-header">
        <view class="header-left" @tap="showHistory">
          <text class="header-text">历史记录</text>
        </view>
        <view class="header-title">新对话</view>
        <view class="header-right" @tap="startNewChat">
          <text class="header-text">新对话</text>
        </view>
      </view>
      
      <!-- 聊天内容区域 -->
      <scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop">
        <view class="chat-card">
          <view class="message ai-message">
            <view class="message-avatar">AI</view>
            <view class="message-content">
              <view class="message-text">我可以帮你搜索、怀疑、写作，请把你的任务交给我吧~</view>
            </view>
          </view>
          
          <view 
            class="message" 
            v-for="(msg, index) in chatHistory" 
            :key="index"
            :class="msg.type === 'user' ? 'user-message' : 'ai-message'"
          >
            <view class="message-avatar" v-if="msg.type === 'ai'">AI</view>
            <view class="message-content">
              <view class="message-text">{{ msg.content }}</view>
            </view>
            <view class="message-avatar" v-if="msg.type === 'user'">我</view>
          </view>
          
          <view class="message ai-message" v-if="isTyping">
            <view class="message-avatar">AI</view>
            <view class="message-content">
              <view class="message-text typing-indicator">
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 底部输入区域 -->
      <view class="chat-input-area">
        <view class="input-wrapper">
          <input 
            class="chat-input" 
            type="text" 
            v-model="inputMessage" 
            placeholder="发送消息" 
            confirm-type="send"
            @confirm="sendMessage"
          />
          <view class="send-button" @tap="sendMessage">
            <text class="send-text">发送</text>
          </view>
        </view>
        
        <!-- 添加功能按钮区域 -->
        <view class="function-buttons">
          <view class="function-button" @tap="showTraceability">
            <text class="function-text">一键追溯</text>
          </view>
          <view class="function-button" @tap="showKnowledgeBase">
            <text class="function-text">知识库系统</text>
          </view>
          <view class="function-button" @tap="testStreamingResponse">
            <text class="function-text">测试流式响应</text>
          </view>
          <view class="function-button" @tap="toggleApiUrl">
            <text class="function-text">{{ useNgrok.value ? '使用本地' : '使用穿透' }}</text>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  
  /**
   * @description 聊天历史记录
   * @type {Ref<Array>}
   */
  const chatHistory = ref([]);
  
  /**
   * @description 历史记录列表
   * @type {Ref<Array>}
   */
  const historyList = ref([]);
  
  /**
   * @description 输入消息
   * @type {Ref<string>}
   */
  const inputMessage = ref('');
  
  /**
   * @description 是否正在输入
   * @type {Ref<boolean>}
   */
  const isTyping = ref(false);
  
  /**
   * @description 滚动位置
   * @type {Ref<number>}
   */
  const scrollTop = ref(0);
  
  /**
   * @description 是否显示历史记录抽屉
   * @type {Ref<boolean>}
   */
  const showHistoryDrawer = ref(false);
  
  /**
   * @description 当前对话标题
   * @type {Ref<string>}
   */
  const currentChatTitle = ref('新对话');
  
  /**
   * @description 当前对话ID，用于标识当前正在编辑的对话
   * @type {Ref<number|null>}
   */
  const currentChatId = ref(null);
  
  /**
   * @description 是否是新对话
   * @type {Ref<boolean>}
   */
  const isNewChat = ref(true);
  
  /**
   * @description 用户ID，用于Dify API
   * @type {Ref<string>}
   */
  const userId = ref('user_' + Math.random().toString(36).substring(2, 10));
  
  /**
   * @description 当前会话ID，用于Dify API
   * @type {Ref<string|null>}
   */
  const conversationId = ref(null);
  
  /**
   * @description Dify API地址 - 本地地址
   * @type {string}
   */
  const LOCAL_API_URL = 'http://192.168.87.66:8000/api/dify/ask';
  
  /**
   * @description Dify API地址 - 内网穿透地址
   * @type {string}
   */
  const NGROK_API_URL = 'https://5905-120-196-49-86.ngrok-free.app /api/dify/ask';
  
  /**
   * @description 是否使用内网穿透地址
   * @type {Ref<boolean>}
   */
  const useNgrok = ref(true);
  
  /**
   * @description 当前使用的API地址
   * @type {ComputedRef<string>}
   */
  const DIFY_API_URL = computed(() => useNgrok.value ? NGROK_API_URL : LOCAL_API_URL);
  
  /**
   * @description 基础API地址(不含路径) - 用于测试连接
   * @type {ComputedRef<string>}
   */
  const BASE_API_URL = computed(() => {
    if (useNgrok.value) {
      return 'https://2c13-120-234-171-125.ngrok-free.app';
    } else {
      return 'http://192.168.87.66:8000';
    }
  });
  
  /**
   * @description 调试模式
   * @type {boolean}
   */
  const DEBUG = true;
  
  /**
   * @description 调试日志
   * @param {...any} args 日志参数
   */
  const debugLog = (...args) => {
    if (DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  };
  
  /**
   * @description 当前前端地址
   * @type {string}
   */
  const FRONTEND_URL = window.location.origin;
  
  /**
   * @description 切换API地址
   */
  const toggleApiUrl = () => {
    useNgrok.value = !useNgrok.value;
    uni.showToast({
      title: `已切换到${useNgrok.value ? '内网穿透' : '本地'}地址`,
      icon: 'none'
    });
    debugLog('当前API地址:', DIFY_API_URL.value);
  };
  
  /**
   * @description 发送消息到Dify API
   * @param {string} message 用户消息
   */
  const sendToDify = async (message) => {
    try {
      debugLog('开始发送消息到Dify API:', message);
      debugLog('前端地址:', FRONTEND_URL);
      debugLog('API地址:', DIFY_API_URL.value);
      
      // 显示AI正在输入状态
      isTyping.value = true;
      
      // 准备请求数据
      const requestData = {
        query: message,
        user_id: userId.value,
        conversation_id: conversationId.value
      };
      
      debugLog('请求数据:', requestData);
      
      // 创建XMLHttpRequest以处理SSE流式响应
      const xhr = new XMLHttpRequest();
      xhr.open('POST', DIFY_API_URL.value, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Origin', FRONTEND_URL);
      
      // 设置更长的超时时间
      xhr.timeout = 300000; // 60秒
      
      // 设置响应类型为text，因为要手动解析SSE
      xhr.responseType = 'text';
      
      // 创建变量以存储已处理的响应文本和累积的未处理文本
      let processedText = '';
      let buffer = '';
      
      // 创建临时显示的消息，最终会用实际响应替换
      let aiMessageIndex = chatHistory.value.length;
      chatHistory.value.push({
        type: 'ai',
        content: '正在思考...'
      });
      
      // 添加超时处理
      xhr.ontimeout = function() {
        debugLog('请求超时');
        chatHistory.value[aiMessageIndex].content = '请求超时，服务器响应时间过长。';
        isTyping.value = false;
      };
      
      // 设置onprogress以处理流式响应
      xhr.onprogress = function() {
        try {
          // 获取新响应文本，从上次处理的位置开始
          const newText = xhr.responseText.substring(processedText.length);
          processedText = xhr.responseText;
          
          debugLog('收到新数据:', newText);
          
          if (newText) {
            // 添加新文本到缓冲区
            buffer += newText;
            
            // 处理缓冲区中完整的SSE事件（以\n\n结尾）
            let eventEnd = buffer.indexOf('\n\n');
            while (eventEnd > -1) {
              const eventText = buffer.substring(0, eventEnd);
              buffer = buffer.substring(eventEnd + 2);
              
              debugLog('处理SSE事件:', eventText);
              
              // 处理单个SSE事件
              if (eventText.startsWith('data:')) {
                try {
                  // 解析JSON数据
                  const jsonStr = eventText.substring(5).trim();
                  const data = JSON.parse(jsonStr);
                  
                  debugLog('解析SSE数据:', data);
                  
                  // 处理不同类型的事件
                  if (data.message_text !== undefined) {
                    // 追加新内容到现有内容
                    chatHistory.value[aiMessageIndex].content += data.message_text;
                    scrollToBottom();
                  } else if (data.event === 'end' && data.conversation_id) {
                    // 保存conversation_id供下次使用
                    conversationId.value = data.conversation_id;
                    debugLog('对话ID已更新:', conversationId.value);
                    
                    // 隐藏输入指示器
                    isTyping.value = false;
                  } else if (data.event === 'error') {
                    // 显示错误消息
                    chatHistory.value[aiMessageIndex].content = `出错了: ${data.message || '未知错误'}`;
                    isTyping.value = false;
                  }
                } catch (e) {
                  debugLog('解析SSE事件出错:', e, eventText);
                }
              }
              
              // 查找下一个完整事件
              eventEnd = buffer.indexOf('\n\n');
            }
          }
        } catch (e) {
          debugLog('处理进度更新出错:', e);
        }
      };
      
      // 处理完成的响应
      xhr.onload = function() {
        debugLog('XHR完成，状态:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          debugLog('请求完成，状态码:', xhr.status);
          debugLog('最终响应:', xhr.responseText);
          
          // 确保typing指示器关闭
          isTyping.value = false;
          
          // 如果消息仍然显示"正在思考"，则可能没有收到任何内容
          if (chatHistory.value[aiMessageIndex].content === '正在思考...') {
            // 尝试从完整响应中解析最后一条消息
            try {
              const lines = xhr.responseText.split('\n\n');
              let lastMessage = '';
              
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  try {
                    const data = JSON.parse(line.substring(5).trim());
                    if (data.message_text) {
                      lastMessage = data.message_text;
                    }
                  } catch (e) { /* 忽略解析错误 */ }
                }
              }
              
              if (lastMessage) {
                chatHistory.value[aiMessageIndex].content = lastMessage;
              } else {
                chatHistory.value[aiMessageIndex].content = '我已经接收到您的消息，但没有获得有效回复。可能是连接问题。';
              }
            } catch (e) {
              chatHistory.value[aiMessageIndex].content = '我已经接收到您的消息，但没有获得有效回复。可能是连接问题。';
              debugLog('解析完整响应出错:', e);
            }
          }
          
          // 更新历史记录
          updateChatHistory();
        } else {
          debugLog('请求出错，状态码:', xhr.status);
          chatHistory.value[aiMessageIndex].content = `服务器返回错误: ${xhr.status}`;
          isTyping.value = false;
        }
      };
      
      // 处理网络错误
      xhr.onerror = function(e) {
        debugLog('请求网络错误:', e);
        chatHistory.value[aiMessageIndex].content = `网络错误：无法连接到服务器。可能原因：
1. 服务器未运行或地址错误
2. 网络连接问题：检查两台设备是否在同一网络并可互相访问
3. CORS错误：后端需要在配置中添加 ${FRONTEND_URL}`;
        isTyping.value = false;
      };
      
      // 调试：专门处理CORS相关错误
      xhr.addEventListener('error', function(event) {
        debugLog('XHR错误事件:', event);
        console.error('XHR错误事件详情:', event);
      });
      
      // 发送请求
      debugLog('发送XHR请求...');
      xhr.send(JSON.stringify(requestData));
      
      // 返回一个空Promise以保持函数签名一致
      return Promise.resolve();
    } catch (error) {
      debugLog('发送消息到Dify API时出错:', error);
      console.error('发送消息到Dify API时出错:', error);
      
      // 添加错误消息
      chatHistory.value.push({
        type: 'ai',
        content: `抱歉，连接服务器时出现问题: ${error.message}`
      });
      
      // 设置为非输入状态
      isTyping.value = false;
      
      // 滚动到底部
      scrollToBottom();
      
      return Promise.reject(error);
    }
  };
  
  /**
   * @description 发送消息
   */
  const sendMessage = () => {
    if (!inputMessage.value.trim()) return;
    
    // 添加用户消息到聊天历史
    chatHistory.value.push({
      type: 'user',
      content: inputMessage.value
    });
    
    // 清空输入框
    const message = inputMessage.value;
    inputMessage.value = '';
    
    // 滚动到底部
    scrollToBottom();
    
    // 显示AI正在输入状态
    isTyping.value = true;
    
    // 发送消息到Dify API
    sendToDify(message);
  };
  
  /**
   * @description 更新当前聊天历史记录
   */
  const updateChatHistory = () => {
    // 查找当前对话在历史列表中的索引
    const index = historyList.value.findIndex(item => item.id === currentChatId.value);
    
    if (index !== -1) {
      // 更新消息内容
      historyList.value[index].messages = [...chatHistory.value];
      
      // 更新时间
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      historyList.value[index].time = timeStr;
      
      // 如果是第一次对话，可能需要更新标题
      if (historyList.value[index].title === '新对话' && chatHistory.value.length > 0 && chatHistory.value[0].type === 'user') {
        // 使用第一条用户消息作为标题（截取前15个字符）
        let title = chatHistory.value[0].content.substring(0, 15);
        if (chatHistory.value[0].content.length > 15) {
          title += '...';
        }
        historyList.value[index].title = title;
        currentChatTitle.value = title;
        
        // 更新页面标题
        const titleElement = document.querySelector('.header-title');
        if (titleElement) {
          titleElement.textContent = title;
        }
      }
      
      console.log('对话已自动更新');
    }
  };
  
  /**
   * @description 滚动到底部
   */
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollTop.value = 9999;
    }, 100);
  };
  
  /**
   * @description 显示历史记录
   */
  const showHistory = () => {
    showHistoryDrawer.value = true;
  };
  
  /**
   * @description 隐藏历史记录
   */
  const hideHistory = () => {
    showHistoryDrawer.value = false;
  };
  
  /**
   * @description 开始新对话
   */
  const startNewChat = () => {
    // 如果当前有聊天内容，且是新对话，则保存
    if (chatHistory.value.length > 0 && isNewChat.value) {
      // 生成对话标题
      let title = '新对话';
      if (chatHistory.value.length > 0 && chatHistory.value[0].type === 'user') {
        // 使用第一条用户消息作为标题（截取前15个字符）
        title = chatHistory.value[0].content.substring(0, 15);
        if (chatHistory.value[0].content.length > 15) {
          title += '...';
        }
      }
      
      // 获取当前时间
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // 创建新的历史记录
      const newHistory = {
        id: historyList.value.length > 0 ? Math.max(...historyList.value.map(h => h.id)) + 1 : 1,
        title: title,
        time: timeStr,
        messages: [...chatHistory.value]
      };
      
      // 添加到历史记录列表
      historyList.value.unshift(newHistory);
      
      // 显示保存成功提示
      uni.showToast({
        title: '对话已保存',
        icon: 'success',
        duration: 1500
      });
    }
    
    // 清空当前聊天
    chatHistory.value = [];
    
    // 重置标题和ID
    currentChatTitle.value = '新对话';
    currentChatId.value = null;
    isNewChat.value = true;
    
    // 更新页面标题
    const titleElement = document.querySelector('.header-title');
    if (titleElement) {
      titleElement.textContent = '新对话';
    }
  };
  
  /**
   * @description 加载历史聊天记录
   * @param {Object} history 历史记录对象
   */
  const loadChatHistory = (history) => {
    // 如果当前有聊天内容，且是新对话，先保存
    if (chatHistory.value.length > 0 && isNewChat.value) {
      startNewChat();
    }
    
    // 加载历史聊天记录
    chatHistory.value = [...history.messages];
    
    // 更新当前对话信息
    currentChatTitle.value = history.title;
    currentChatId.value = history.id;
    isNewChat.value = false;
    
    // 更新页面标题
    const titleElement = document.querySelector('.header-title');
    if (titleElement) {
      titleElement.textContent = history.title;
    }
    
    // 隐藏抽屉
    hideHistory();
    
    // 显示提示
    uni.showToast({
      title: '已加载历史对话',
      icon: 'none'
    });
  };
  
  /**
   * @description 显示一键追溯
   */
  const showTraceability = () => {
    uni.navigateTo({
      url: '/pages/product-trace/product-trace'
    });
  };
  
  /**
   * @description 显示知识库系统
   */
  const showKnowledgeBase = () => {
    uni.navigateTo({
      url: '/pages/knowledge-base/knowledge-base'
    });
  };
  
  /**
   * @description 测试流式响应
   */
  const testStreamingResponse = () => {
    // 添加用户消息
    chatHistory.value.push({
      type: 'user',
      content: '测试流式响应'
    });
    
    // 添加AI消息占位符
    let aiMessageIndex = chatHistory.value.length;
    chatHistory.value.push({
      type: 'ai',
      content: '正在思考...'
    });
    
    // 显示输入状态
    isTyping.value = true;
    
    // 创建XHR请求
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${BASE_API_URL.value}/api/test-stream`, true);
    xhr.setRequestHeader('Origin', FRONTEND_URL);
    xhr.responseType = 'text';
    
    // 处理变量
    let processedText = '';
    let buffer = '';
    
    // 处理流式响应
    xhr.onprogress = function() {
      try {
        // 获取新响应
        const newText = xhr.responseText.substring(processedText.length);
        processedText = xhr.responseText;
        
        debugLog('测试流 - 收到新数据:', newText);
        
        if (newText) {
          // 处理SSE事件
          buffer += newText;
          
          // 处理完整事件
          let eventEnd = buffer.indexOf('\n\n');
          while (eventEnd > -1) {
            const eventText = buffer.substring(0, eventEnd);
            buffer = buffer.substring(eventEnd + 2);
            
            debugLog('测试流 - 处理事件:', eventText);
            
            if (eventText.startsWith('data:')) {
              try {
                const jsonStr = eventText.substring(5).trim();
                const data = JSON.parse(jsonStr);
                
                debugLog('测试流 - 解析数据:', data);
                
                if (data.message_text !== undefined) {
                  // 关键修改：追加内容而不是替换
                  if (chatHistory.value[aiMessageIndex].content === '正在思考...') {
                    chatHistory.value[aiMessageIndex].content = data.message_text;
                  } else {
                    chatHistory.value[aiMessageIndex].content += data.message_text;
                  }
                  scrollToBottom();
                } else if (data.event === 'end') {
                  isTyping.value = false;
                  debugLog('测试流 - 结束');
                }
              } catch (e) {
                debugLog('测试流 - 解析错误:', e);
              }
            }
            
            eventEnd = buffer.indexOf('\n\n');
          }
        }
      } catch (e) {
        debugLog('测试流 - 处理错误:', e);
      }
    };
    
    xhr.onerror = function(e) {
      debugLog('测试流 - 网络错误:', e);
      chatHistory.value[aiMessageIndex].content = '测试流式响应失败: 网络错误';
      isTyping.value = false;
    };
    
    xhr.send();
  };
  
  // 测试连接
  onMounted(async () => {
    try {
      debugLog('测试连接到Dify API...');
      
      // 使用简单的GET请求测试连接
      const xhr = new XMLHttpRequest();
      xhr.open('GET', BASE_API_URL.value, true);
      xhr.setRequestHeader('Origin', FRONTEND_URL);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            debugLog('连接测试结果:', data);
            if (data.message) {
              console.log('Dify API 连接成功:', data.message);
              
              // 显示成功消息
              chatHistory.value.push({
                type: 'ai',
                content: `成功连接到服务器！服务器返回: ${data.message}`
              });
            }
          } catch (e) {
            debugLog('解析响应出错:', e);
            chatHistory.value.push({
              type: 'ai',
              content: '服务器返回了响应，但格式不正确。'
            });
          }
        } else {
          debugLog('连接测试失败，状态码:', xhr.status);
          console.error('连接测试失败，状态码:', xhr.status);
          
          chatHistory.value.push({
            type: 'ai',
            content: `服务器连接失败，状态码: ${xhr.status}`
          });
        }
      };
      
      xhr.onerror = function(e) {
        debugLog('连接测试网络错误:', e);
        console.error('连接测试网络错误:', e);
        
        // 显示错误消息
        chatHistory.value.push({
          type: 'ai',
          content: '无法连接到服务器。请确保服务器正在运行，并且后端已配置允许来自 ' + FRONTEND_URL + ' 的请求。'
        });
      };
      
      xhr.send();
    } catch (error) {
      debugLog('连接测试失败:', error);
      console.error('无法连接到Dify API:', error);
    }
  });
  </script>
  
  <style lang="scss">
  page {
    background: linear-gradient(135deg, #4776E6, #8E54E9);
  }
  
  .chat-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #4776E6, #8E54E9);
    position: relative;
    overflow: hidden;
  }
  
  /* 几何图案装饰 */
  .chat-container::before {
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
    pointer-events: none;
  }
  
  .chat-container::after {
    content: '';
    position: absolute;
    bottom: -5%;
    right: -5%;
    width: 60%;
    height: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 3px, transparent 4px);
    background-size: 30rpx 30rpx;
    z-index: 1;
    pointer-events: none;
  }
  
  /* 工厂元素 */
  .factory-element {
    position: absolute;
    z-index: 5;
    pointer-events: none;
  }
  
  /* 数据流 - 左侧 */
  .data-flow {
    left: 40rpx;
    top: 200rpx;
    width: 100rpx;
    height: 200rpx;
  }
  
  .data-flow::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4rpx;
    height: 200rpx;
    background-color: rgba(255, 255, 255, 0.6);
  }
  
  .data-flow::after {
    content: '';
    position: absolute;
    top: 20rpx;
    left: 4rpx;
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    background-color: #23F0C7;
    box-shadow: 
      0 40rpx 0 0 rgba(255, 255, 255, 0.9),
      0 80rpx 0 0 #23F0C7,
      0 120rpx 0 0 rgba(255, 255, 255, 0.9),
      0 160rpx 0 0 #23F0C7;
    animation: dataFlow 4s infinite linear;
  }
  
  @keyframes dataFlow {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: translateY(40rpx);
      opacity: 0;
    }
  }
  
  /* 控制面板 - 右侧 */
  .control-panel {
    right: 60rpx;
    bottom: 300rpx;
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
  
  /* 修改顶部导航样式 */
  .chat-header {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
    position: relative;
    z-index: 10;
  }
  
  .header-left, .header-right {
    padding: 0 20rpx;
    height: 60rpx;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-size: 34rpx;
    font-weight: bold;
  }
  
  /* 聊天内容区域 */
  .chat-content {
    flex: 1;
    padding: 20rpx;
    position: relative;
    z-index: 2;
  }
  
  .chat-card {
    padding: 20rpx;
    border-radius: 20rpx;
    background-color: rgba(0, 0, 0, 0.5);
    min-height: 70vh;
  }
  
  .message {
    display: flex;
    margin-bottom: 30rpx;
    position: relative;
  }
  
  .ai-message {
    justify-content: flex-start;
  }
  
  .user-message {
    justify-content: flex-end;
  }
  
  .message-avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    background-color: #23F0C7;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .user-message .message-avatar {
    background: linear-gradient(to right, #5e35b1, #8E54E9);
    color: #fff;
  }
  
  .message-content {
    max-width: 70%;
    margin: 0 20rpx;
  }
  
  .message-text {
    padding: 20rpx;
    border-radius: 20rpx;
    font-size: 28rpx;
    line-height: 1.5;
    position: relative;
    color: #fff;
  }
  
  .ai-message .message-text {
    background-color: #333;
    border-top-left-radius: 0;
  }
  
  .user-message .message-text {
    background: linear-gradient(to right, #5e35b1, #8E54E9);
    border-top-right-radius: 0;
  }
  
  /* 底部输入区域 */
  .chat-input-area {
    padding: 20rpx 30rpx 40rpx;
    background-color: rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 10;
  }
  
  .input-wrapper {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 40rpx;
    padding: 10rpx 20rpx;
    margin-bottom: 15rpx;
  }
  
  .chat-input {
    flex: 1;
    height: 70rpx;
    background-color: transparent;
    border: none;
    color: #fff;
    font-size: 28rpx;
    padding: 0 20rpx;
  }
  
  .send-button {
    width: 120rpx;
    height: 60rpx;
    border-radius: 30rpx;
    background: linear-gradient(to right, #5e35b1, #8E54E9);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .send-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
  }
  
  /* 添加打字指示器样式 */
  .typing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40rpx;
    min-width: 80rpx;
  }
  
  .typing-dot {
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    background-color: #fff;
    margin: 0 5rpx;
    animation: typingAnimation 1.4s infinite ease-in-out;
  }
  
  .typing-dot:nth-child(1) {
    animation-delay: 0s;
  }
  
  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typingAnimation {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.6;
    }
    30% {
      transform: translateY(-10rpx);
      opacity: 1;
    }
  }
  
  /* 添加功能按钮样式 */
  .function-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 20rpx;
  }
  
  .function-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 30rpx;
    padding: 10rpx 30rpx;
    transition: all 0.3s;
    min-width: 180rpx;
  }
  
  .function-button:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .function-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
  }
  
  /* 历史记录抽屉 */
  .history-drawer {
    position: fixed;
    top: 0;
    left: -80%;
    width: 80%;
    height: 100%;
    background-color: #fff;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
  }
  
  .history-drawer-show {
    left: 0;
  }
  
  .history-drawer-header {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    background: linear-gradient(135deg, #4776E6, #8E54E9);
  }
  
  .history-drawer-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #fff;
  }
  
  .history-drawer-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-icon {
    font-size: 48rpx;
    color: #fff;
  }
  
  .history-list {
    height: calc(100% - 100rpx);
  }
  
  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .history-item-content {
    flex: 1;
  }
  
  .history-item-title {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
  }
  
  .history-item-time {
    font-size: 24rpx;
    color: #999;
  }
  
  .history-item-arrow {
    font-size: 40rpx;
    color: #999;
  }
  
  .empty-history {
    padding: 100rpx 0;
    text-align: center;
  }
  
  .empty-history-text {
    font-size: 28rpx;
    color: #999;
  }
  
  /* 遮罩层 */
  .drawer-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  </style>