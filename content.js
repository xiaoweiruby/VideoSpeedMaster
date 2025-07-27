// VideoSpeedMaster - Content Script
// Handles video speed control for different platforms

// Store current settings
let currentSettings = {
  speed: 1.0,
  enabled: true
};

// Load saved settings when content script is initialized
chrome.storage.sync.get(['speed', 'enabled'], function(result) {
  currentSettings.speed = result.speed || 1.0;
  currentSettings.enabled = result.enabled !== undefined ? result.enabled : true;
  
  // Apply settings to any existing videos
  applySpeedToVideos();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateSpeed') {
    currentSettings.speed = request.speed;
    currentSettings.enabled = request.enabled;
    
    const success = applySpeedToVideos();
    sendResponse({success: success});
    return true; // Keep the message channel open for async response
  }
});

// Function to find and apply speed to all videos on the page
function applySpeedToVideos() {
  // Get all video elements on the page
  const videos = document.querySelectorAll('video');
  let success = false;
  
  if (videos.length > 0) {
    videos.forEach(video => {
      if (currentSettings.enabled) {
        video.playbackRate = currentSettings.speed;
      } else {
        video.playbackRate = 1.0; // Reset to normal speed when disabled
      }
    });
    success = true;
  }
  
  // Handle platform-specific video players
  success = handlePlatformSpecificPlayers() || success;
  
  return success;
}

// Function to handle platform-specific video players
function handlePlatformSpecificPlayers() {
  let success = false;
  
  // YouTube
  if (window.location.hostname.includes('youtube.com')) {
    const ytPlayer = document.querySelector('.html5-video-player');
    if (ytPlayer) {
      success = true;
      // YouTube already uses the standard HTML5 video element
    }
  }
  
  // Bilibili
  if (window.location.hostname.includes('bilibili.com')) {
    const biliPlayer = document.querySelector('.bilibili-player-video');
    if (biliPlayer) {
      success = true;
      // Bilibili uses standard HTML5 video elements
    }
  }
  
  // Vimeo
  if (window.location.hostname.includes('vimeo.com')) {
    const vimeoPlayer = document.querySelector('.vp-video');
    if (vimeoPlayer) {
      success = true;
      // Vimeo uses standard HTML5 video elements
    }
  }
  
  // Netflix
  if (window.location.hostname.includes('netflix.com')) {
    const netflixPlayer = document.querySelector('.VideoContainer');
    if (netflixPlayer) {
      success = true;
      // Netflix video is still controlled via the standard HTML5 video element
    }
  }
  
  // Amazon Prime Video
  if (window.location.hostname.includes('amazon') && 
      (window.location.pathname.includes('video') || window.location.pathname.includes('tv'))) {
    const amazonPlayer = document.querySelector('.webPlayerContainer');
    if (amazonPlayer) {
      success = true;
      // Amazon uses standard HTML5 video elements
    }
  }
  
  // iQIYI
  if (window.location.hostname.includes('iqiyi.com')) {
    const iqiyiPlayer = document.querySelector('.iqp-player');
    if (iqiyiPlayer) {
      success = true;
      // iQIYI uses standard HTML5 video elements
    }
  }
  
  // Tencent Video
  if (window.location.hostname.includes('v.qq.com')) {
    const tencentPlayer = document.querySelector('.txp_video_container');
    if (tencentPlayer) {
      success = true;
      // Tencent Video uses standard HTML5 video elements
    }
  }
  
  return success;
}

// Observe for dynamically added videos (for single-page applications)
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // Check if any of the added nodes are videos or contain videos
      let hasNewVideos = false;
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeName === 'VIDEO' || 
            (node.querySelectorAll && node.querySelectorAll('video').length > 0)) {
          hasNewVideos = true;
        }
      });
      
      // If new videos were added, apply our speed settings
      if (hasNewVideos) {
        setTimeout(applySpeedToVideos, 500); // Small delay to ensure video is fully loaded
      }
    }
  });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Apply speed settings initially and periodically (for dynamic content)
applySpeedToVideos();
setInterval(applySpeedToVideos, 3000); // Check every 3 seconds for new videos 