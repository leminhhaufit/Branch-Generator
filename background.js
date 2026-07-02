// Biến dùng để theo dõi ID của cửa sổ lớn extension (tránh mở trùng nhiều cửa sổ)
let extensionWindowId = null; 

const contextMenuTranslations = {
  vi: {
    sendUSNumber: 'Gửi số này vào -> Số US',
    sendUSTitle: 'Gửi chữ này vào -> Tên US gốc'
  },
  en: {
    sendUSNumber: 'Send this number to -> US Number',
    sendUSTitle: 'Send this text to -> Original US Title'
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['language'], (result) => {
    createContextMenus(result.language || 'vi');
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['language'], (result) => {
    updateContextMenuLanguage(result.language || 'vi');
  });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.language) {
    updateContextMenuLanguage(changes.language.newValue || 'vi');
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'LANGUAGE_CHANGED') {
    updateContextMenuLanguage(message.language || 'vi');
  }
});

function createContextMenus(language) {
  const titles = contextMenuTranslations[language] || contextMenuTranslations.vi;

  chrome.contextMenus.create({
    id: "sendUSNumber",
    title: titles.sendUSNumber,
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "sendUSTitle",
    title: titles.sendUSTitle,
    contexts: ["selection"]
  });
}

function updateContextMenuLanguage(language) {
  const titles = contextMenuTranslations[language] || contextMenuTranslations.vi;

  chrome.contextMenus.update('sendUSNumber', { title: titles.sendUSNumber }, () => {
    const shouldRecreateMenus = Boolean(chrome.runtime.lastError);

    chrome.contextMenus.update('sendUSTitle', { title: titles.sendUSTitle }, () => {
      if (shouldRecreateMenus || chrome.runtime.lastError) {
        chrome.contextMenus.removeAll(() => createContextMenus(language));
      }
    });
  });
}

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
