document.addEventListener('DOMContentLoaded', function() {
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const enableControl = document.getElementById('enableControl');
  const statusMessage = document.getElementById('statusMessage');
  const presetButtons = document.querySelectorAll('.preset-btn');
  
  // Load saved settings
  chrome.storage.sync.get(['speed', 'enabled'], function(result) {
    const savedSpeed = result.speed || 1.0;
    const isEnabled = result.enabled !== undefined ? result.enabled : true;
    
    speedSlider.value = savedSpeed;
    speedValue.textContent = savedSpeed.toFixed(1);
    enableControl.checked = isEnabled;
    
    updateStatus();
  });
  
  // Update speed when slider changes
  speedSlider.addEventListener('input', function() {
    const speed = parseFloat(this.value);
    speedValue.textContent = speed.toFixed(1);
    saveSettings();
    updateVideoSpeed();
  });
  
  // Toggle enable/disable
  enableControl.addEventListener('change', function() {
    saveSettings();
    updateStatus();
    updateVideoSpeed();
  });
  
  // Preset speed buttons
  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const speed = parseFloat(this.getAttribute('data-speed'));
      speedSlider.value = speed;
      speedValue.textContent = speed.toFixed(1);
      saveSettings();
      updateVideoSpeed();
    });
  });
  
  // Save current settings
  function saveSettings() {
    const speed = parseFloat(speedSlider.value);
    const enabled = enableControl.checked;
    
    chrome.storage.sync.set({
      'speed': speed,
      'enabled': enabled
    });
  }
  
  // Update status message
  function updateStatus() {
    if (enableControl.checked) {
      statusMessage.textContent = '已启用 - 速度: ' + speedValue.textContent + 'x';
    } else {
      statusMessage.textContent = '已禁用 - 点击开关启用';
    }
  }
  
  // Send message to content script to update video speed
  function updateVideoSpeed() {
    const speed = parseFloat(speedSlider.value);
    const enabled = enableControl.checked;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateSpeed',
        speed: speed,
        enabled: enabled
      }, function(response) {
        if (response && response.success) {
          updateStatus();
        } else {
          statusMessage.textContent = '无法找到视频或页面未加载完成';
        }
      });
    });
  }
}); 