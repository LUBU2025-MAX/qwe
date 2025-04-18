/**
 * 将Markdown文本渲染为HTML
 * @param {string} text - Markdown格式文本
 * @returns {string} 渲染后的HTML
 */
export function renderMarkdown(text) {
  // 简单的markdown渲染实现
  // 这里可以使用更复杂的markdown库，但为简单起见，我们只实现基础功能
  if (!text) return '';
  
  // 替换标题
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 替换粗体和斜体
  text = text.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  text = text.replace(/\*(.*)\*/gim, '<em>$1</em>');
  
  // 替换链接
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
  
  // 替换列表
  text = text.replace(/^\s*\* (.*$)/gim, '<li>$1</li>');
  
  // 替换段落
  text = text.replace(/^\s*(.+?)$/gim, '<p>$1</p>');
  
  // 清理空标签
  text = text.replace(/<p><\/p>/gim, '');
  
  return text;
} 