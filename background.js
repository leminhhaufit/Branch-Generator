// Biến dùng để theo dõi ID của cửa sổ lớn extension (tránh mở trùng nhiều cửa sổ)
let extensionWindowId = null; 

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendUSNumber",
    title: "Gửi số này vào -> Số US",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "sendUSTitle",
    title: "Gửi chữ này vào -> Tên US gốc",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const msgType = info.menuItemId === "sendUSNumber" ? "US_NUMBER_SELECTED" : "TEXT_SELECTED";
  const selectedText = info.selectionText;

  // Kiểm tra xem cửa sổ lớn extension hiện tại có đang mở và hợp lệ không
  if (extensionWindowId !== null) {
    chrome.windows.get(extensionWindowId, (win) => {
      if (chrome.runtime.lastError || !win) {
        // Nếu cửa sổ đã bị đóng trước đó, tiến hành mở cửa sổ mới
        createNewWindowAndSendData(msgType, selectedText);
      } else {
        // Nếu cửa sổ đang mở sẵn, chỉ cần gửi dữ liệu qua và đưa cửa sổ lên trên cùng (focus)
        chrome.windows.update(extensionWindowId, { focused: true });
        sendDataToExtension(msgType, selectedText);
      }
    });
  } else {
    // Nếu chưa từng mở cửa sổ nào, tiến hành mở mới lập tức
    createNewWindowAndSendData(msgType, selectedText);
  }
});

// Hàm hỗ trợ mở cửa sổ rời mới và truyền dữ liệu ngầm sau khi cửa sổ lên hình
function createNewWindowAndSendData(msgType, text) {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html?detached=true"),
    type: "popup",
    width: 460,
    height: 780
  }, (window) => {
    extensionWindowId = window.id; // Ghi nhớ ID cửa sổ mới tạo
    
    // Đợi một khoảng thời gian ngắn (300ms) để giao diện popup kịp load hoàn chỉnh rồi mới gửi data
    setTimeout(() => {
      sendDataToExtension(msgType, text);
    }, 300);
  });
}

// Hàm hỗ trợ phát tín hiệu truyền chuỗi text bôi đen sang cho file popup.js
function sendDataToExtension(msgType, text) {
  chrome.runtime.sendMessage({
    type: msgType,
    text: text
  }).catch(err => {
    console.log("Đang đồng bộ hóa dữ liệu...");
  });
}
