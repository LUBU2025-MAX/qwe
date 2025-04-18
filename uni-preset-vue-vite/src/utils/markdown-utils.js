/**
 * 简单的Markdown渲染工具
 * 将Markdown文本转换为HTML
 */

/**
 * 将Markdown文本转换为HTML
 * @param {string} text Markdown文本
 * @returns {string} HTML字符串
 */
export function renderMarkdown(text) {
  if (!text) return '';
  
  // 基本的Markdown语法转换
  let html = text
    // 转义HTML特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // 标题
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // 链接
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    
    // 列表
    .replace(/^\* (.*?)$/gm, '<li>$1</li>')
    .replace(/^\- (.*?)$/gm, '<li>$1</li>')
    .replace(/^\+ (.*?)$/gm, '<li>$1</li>')
    
    // 段落和换行
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // 确保整个内容被包裹在段落中
  html = '<p>' + html + '</p>';
  
  // 替换掉多余的段落标签
  html = html.replace(/<p><\/p>/g, '');
  
  return html;
}

/**
 * 创建节点数组，用于rich-text组件
 * @param {string} htmlString HTML字符串
 * @returns {Array} 节点数组
 */
export function createNodesFromHTML(htmlString) {
  return [{
    name: 'div',
    attrs: {
      class: 'markdown-content'
    },
    children: [{
      type: 'node',
      name: 'div',
      attrs: { style: 'word-break: break-word;' },
      children: [{ type: 'text', text: htmlString }]
    }]
  }];
} 