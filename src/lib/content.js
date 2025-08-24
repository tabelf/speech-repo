// 检查是否在Chrome扩展环境中
if (chrome?.runtime) {
  // 监听 shadcn 的 select 组件往宿主页面插入 style 标签
  const observer = new MutationObserver(() => {
    document.querySelectorAll('style').forEach(styleEl => {
      if (styleEl.textContent?.includes('.with-scroll-bars-hidden')) {
        styleEl.remove();
      }
    });
  });
  observer.observe(document.head, { childList: true });

  const container = document.createElement('div');
  container.id = 'speech-extension-container';
  document.body.appendChild(container);

  // 创建 shadow root
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // 创建根容器
  const root = document.createElement('div');
  root.id = 'speech-extension-root';
  shadowRoot.appendChild(root);

    // shadcn UI Portal mount.
  const modalHost = document.createElement('div');
  modalHost.id = 'speech-extension-modal-host';
  shadowRoot.appendChild(modalHost);

  // 引入 CSS（可选）
  fetch(chrome.runtime.getURL('assets/style.css'))
    .then((response) => response.text())
    .then((cssText) => {
      // 替换你想要移除的内容
      const modifiedCss = cssText.replace('((-webkit-hyphens:none)) and', '');
      
      // 创建 style 标签
      const styleEl = document.createElement('style');
      styleEl.textContent = modifiedCss;

      // 插入到 shadow root 中
      shadowRoot.appendChild(styleEl);
    });

  const el = document.createElement('div');
  el.id = 'speech-extension-logo';
  el.dataset.iconUrl = chrome.runtime.getURL('speech.png');
  shadowRoot.appendChild(el);  

  // 注入 React 应用的 JS 脚本
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('assets/main.js'); // 你需要替换成真实文件名
  script.type = 'module';
  // 等待脚本加载完成
  script.onload = function () {
    // 通知应用已经准备好挂载
    const event = new CustomEvent('speechExtensionReady');
    window.dispatchEvent(event);
  };
  shadowRoot.appendChild(script);

  window.addEventListener('speechToggleSidebar', (e) => {
    const { open } = e.detail;
    const container = document.getElementById('speech-extension-container');
    const shadowRoot = container?.shadowRoot;
    const root = shadowRoot?.getElementById('speech-extension-root');
    if (open) {
      console.log('speechToggleSidebar open!')
      document.body.style.marginRight = '410px'; // 或 paddingRight，根据你布局需要
      document.body.style.transition = 'margin 0.3s ease';

      if (root) {
        root.style.position = 'fixed';
        root.style.top = '0';
        root.style.right = '0';
        root.style.width = '410px';
        root.style.height = '100vh';
        root.style.zIndex = '9999';
        root.style.backgroundColor = 'white'; // 可选：默认背景
        root.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
      }
    } else {
      console.log('speechToggleSidebar close!')
      document.body.style.marginRight = '0px';
      if (root) {
        root.removeAttribute('style');
      }
    }
  });
} else {
  console.warn('Not running in Chrome extension environment. This app requires Chrome extension to work properly.');
}

window.addEventListener('db_message', (event) => {
  const { requestId, action, data } = event.detail;

  if (!chrome?.runtime) {
    const responseEvent = new CustomEvent('db_response', {
      detail: { responseId: requestId, error: 'Not in Chrome extension environment' }
    });
    window.dispatchEvent(responseEvent);
    return;
  }

  chrome.runtime.sendMessage({ action, data }, (response) => {
    const responseEvent = new CustomEvent('db_response', {
      detail: { responseId: requestId, responseData: response?.data, error: response?.error }
    });
    window.dispatchEvent(responseEvent);
  });
})