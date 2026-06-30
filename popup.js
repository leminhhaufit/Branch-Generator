const translations = {
  vi: {
    detachButton: '↗ Cửa sổ lớn',
    languageTitle: 'Ngôn ngữ: Tiếng Việt. Bấm để đổi sang English',
    languageFlagClass: 'flag-vn',
    userLabel: 'User (không bắt buộc)',
    sprintLabel: 'Sprint (không bắt buộc)',
    errUser: 'Vui lòng nhập tên User!',
    errSprint: 'Vui lòng nhập mã Sprint!',
    featureSectionTitle: 'Nhánh Feature / Task US',
    clearFormButton: 'Xóa trắng ô nhập',
    usNumberLabel: 'Số US ID',
    usNumberPlaceholder: 'Click chuột phải để điền tự động',
    errUSNumber: 'Vui lòng nhập số US!',
    usTitleLabel: 'Tên US gốc',
    usTitlePlaceholder: 'Bôi đen chữ ngoài web + gửi qua chuột phải',
    errUSTitle: 'Vui lòng nhập tên US gốc!',
    generateButton: 'Tạo & Copy tên nhánh (Enter)',
    historySectionTitle: 'Lịch sử Commit gần đây (Max 10)',
    emptyHistory: 'Chưa có lịch sử commit gần đây.',
    branchHistorySectionTitle: 'Lịch sử Branch gần đây (Max 10)',
    emptyBranchHistory: 'Chưa có lịch sử branch gần đây.',
    environmentSectionTitle: 'Hệ thống môi trường',
    generateEnvButton: 'Tạo cấu trúc 3 nhánh PROD / QA',
    copyButton: 'Copy',
    successMessage: '✓ Đã sao chép thành công!'
  },
  en: {
    detachButton: '↗ Large window',
    languageTitle: 'Language: English. Click to switch to Tiếng Việt',
    languageFlagClass: 'flag-us',
    userLabel: 'User (optional)',
    sprintLabel: 'Sprint (optional)',
    errUser: 'Please enter the User name!',
    errSprint: 'Please enter the Sprint code!',
    featureSectionTitle: 'Feature / Task US Branch',
    clearFormButton: 'Clear inputs',
    usNumberLabel: 'US ID Number',
    usNumberPlaceholder: 'Right-click to fill automatically',
    errUSNumber: 'Please enter the US number!',
    usTitleLabel: 'Original US Title',
    usTitlePlaceholder: 'Select text on a web page + send via right-click',
    errUSTitle: 'Please enter the original US title!',
    generateButton: 'Create & Copy branch name (Enter)',
    historySectionTitle: 'Recent Commit History (Max 10)',
    emptyHistory: 'No recent commit history.',
    branchHistorySectionTitle: 'Recent Branch History (Max 10)',
    emptyBranchHistory: 'No recent branch history.',
    environmentSectionTitle: 'Environment system',
    generateEnvButton: 'Create 3 PROD / QA branch structures',
    copyButton: 'Copy',
    successMessage: '✓ Copied successfully!'
  }
};

let currentLanguage = 'vi';

document.addEventListener('DOMContentLoaded', () => {
  // Lấy User, Sprint và mảng lịch sử từ storage cục bộ
  chrome.storage.local.get(['savedUser', 'savedSprint', 'commitHistory', 'branchHistory', 'language'], (result) => {
    currentLanguage = translations[result.language] ? result.language : 'vi';
    applyLanguage(currentLanguage);

    if (result.savedUser) document.getElementById('txtUser').value = result.savedUser;
    if (result.savedSprint) document.getElementById('txtSprint').value = result.savedSprint;
    
    const history = result.commitHistory || [];
    renderHistory(history);
    renderBranchHistory(result.branchHistory || []);
    document.getElementById('txtUSNumber').focus();
  });

  if (window.location.search.includes('detached=true')) {
    document.getElementById('btnDetach').style.display = 'none';
    document.body.classList.add('detached-mode');
  }

  // Gắn sự kiện copy cho các nhánh môi trường
  document.querySelectorAll('.btn-copy-small').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetId = e.target.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).value;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => showToast());
      }
    });
  });

  // Tự động dọn thông báo lỗi đỏ khi Dev bắt đầu gõ ký tự
  const fields = ['txtUser', 'txtSprint', 'txtUSNumber', 'txtUSTitle'];
  fields.forEach(id => {
    document.getElementById(id).addEventListener('input', () => clearError(id));
  });

  document.getElementById('btnLanguage').addEventListener('click', () => {
    currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    chrome.storage.local.set({ language: currentLanguage });
    applyLanguage(currentLanguage);
    chrome.storage.local.get(['commitHistory', 'branchHistory'], (result) => {
      renderHistory(result.commitHistory || []);
      renderBranchHistory(result.branchHistory || []);
    });
  });
});

function applyLanguage(language) {
  const dictionary = translations[language] || translations.vi;
  const languageButton = document.getElementById('btnLanguage');

  if (languageButton) {
    languageButton.innerHTML = `<span class="flag-icon ${dictionary.languageFlagClass}" aria-hidden="true"></span>`;
    languageButton.setAttribute('aria-label', dictionary.languageTitle);
    languageButton.title = dictionary.languageTitle;
  }

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (dictionary[key]) element.textContent = dictionary[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (dictionary[key]) element.placeholder = dictionary[key];
  });
}

// Xử lý nút Xóa trắng ô nhập nhanh
document.getElementById('btnClearForm').addEventListener('click', () => {
  document.getElementById('txtUSNumber').value = '';
  document.getElementById('txtUSTitle').value = '';
  clearError('txtUSNumber');
  clearError('txtUSTitle');
  document.getElementById('txtUSNumber').focus();
});

// Mở rộng thành cửa sổ độc lập lớn
document.getElementById('btnDetach').addEventListener('click', () => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html?detached=true"),
    type: "popup",
    width: 460,
    height: 780
  });
  window.close();
});

// Hỗ trợ nhấn Enter kích hoạt lệnh nhanh
const inputFields = ['txtUser', 'txtSprint', 'txtUSNumber', 'txtUSTitle'];
inputFields.forEach(id => {
  document.getElementById(id).addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('btnGenerate').click();
    }
  });
});

function showError(fieldId) {
  const groupMap = { 'txtUser': 'groupUser', 'txtSprint': 'groupSprint', 'txtUSNumber': 'groupUSNumber', 'txtUSTitle': 'groupUSTitle' };
  const errMap = { 'txtUser': 'errUser', 'txtSprint': 'errSprint', 'txtUSNumber': 'errUSNumber', 'txtUSTitle': 'errUSTitle' };
  document.getElementById(groupMap[fieldId]).classList.add('has-error');
  document.getElementById(errMap[fieldId]).style.display = 'block';
}

function clearError(fieldId) {
  const groupMap = { 'txtUser': 'groupUser', 'txtSprint': 'groupSprint', 'txtUSNumber': 'groupUSNumber', 'txtUSTitle': 'groupUSTitle' };
  const errMap = { 'txtUser': 'errUser', 'txtSprint': 'errSprint', 'txtUSNumber': 'errUSNumber', 'txtUSTitle': 'errUSTitle' };
  if (document.getElementById(groupMap[fieldId])) {
    document.getElementById(groupMap[fieldId]).classList.remove('has-error');
    document.getElementById(errMap[fieldId]).style.display = 'none';
  }
}

// Xử lý render danh sách lịch sử và các hành động đi kèm
function renderHistory(history) {
  const container = document.getElementById('historyContainer');
  container.innerHTML = '';
  const dictionary = translations[currentLanguage] || translations.vi;

  if (history.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:8px; font-size:12px;">${dictionary.emptyHistory}</div>`;
    return;
  }

  history.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';
    const commitMessage = `#${item.number}: ${item.title}`;

    itemDiv.innerHTML = `
      <div class="history-content" title="${commitMessage}">${commitMessage}</div>
      <div class="history-actions">
        <button class="btn-hist-copy" data-text="${commitMessage}">${dictionary.copyButton}</button>
        <button class="btn-hist-del" data-index="${index}">✕</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  // Bắt sự kiện Copy tin nhắn Commit
  container.querySelectorAll('.btn-hist-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = e.target.getAttribute('data-text');
      navigator.clipboard.writeText(text).then(() => showToast());
    });
  });

  // Bắt sự kiện xóa dòng lịch sử tương ứng
  container.querySelectorAll('.btn-hist-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      chrome.storage.local.get(['commitHistory'], (result) => {
        let currentHistory = result.commitHistory || [];
        currentHistory.splice(idx, 1);
        chrome.storage.local.set({ 'commitHistory': currentHistory }, () => {
          renderHistory(currentHistory);
        });
      });
    });
  });
}

function renderBranchHistory(branchHistory) {
  const container = document.getElementById('branchHistoryContainer');
  container.innerHTML = '';
  const dictionary = translations[currentLanguage] || translations.vi;

  if (branchHistory.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:8px; font-size:12px;">${dictionary.emptyBranchHistory}</div>`;
    return;
  }

  branchHistory.forEach((branchName, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';

    itemDiv.innerHTML = `
      <div class="history-content" title="${branchName}">${branchName}</div>
      <div class="history-actions">
        <button class="btn-hist-copy" data-text="${branchName}">${dictionary.copyButton}</button>
        <button class="btn-hist-del" data-index="${index}">✕</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  container.querySelectorAll('.btn-hist-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = e.target.getAttribute('data-text');
      navigator.clipboard.writeText(text).then(() => showToast());
    });
  });

  container.querySelectorAll('.btn-hist-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      chrome.storage.local.get(['branchHistory'], (result) => {
        let currentBranchHistory = result.branchHistory || [];
        currentBranchHistory.splice(idx, 1);
        chrome.storage.local.set({ 'branchHistory': currentBranchHistory }, () => {
          renderBranchHistory(currentBranchHistory);
        });
      });
    });
  });
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function getMonthName(monthIndex) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[monthIndex];
}

function padZero(num) {
  return num < 10 ? '0' + num : num.toString();
}

// CHỨC NĂNG 2: MÔI TRƯỜNG
document.getElementById('btnGenerateEnv').addEventListener('click', () => {
  const sprint = document.getElementById('txtSprint').value.trim();
  const user = document.getElementById('txtUser').value.trim();
  
  let hasError = false;
  if (!sprint) { showError('txtSprint'); hasError = true; }
  if (!user) { showError('txtUser'); hasError = true; }
  if (hasError) return;
  
  chrome.storage.local.set({ 'savedUser': user, 'savedSprint': sprint });

  const now = new Date();
  const year = now.getFullYear();
  const monthName = getMonthName(now.getMonth());
  const day = now.getDate();
  const dayWithSuffix = day + getOrdinalSuffix(day);
  
  const dd = padZero(day);
  const mm = padZero(now.getMonth() + 1);
  const ddmm = `${dd}${mm}`;

  document.getElementById('txtProdBranch').value = `release/${year}/prod/${monthName}-${dayWithSuffix}`;
  document.getElementById('txtQaBranch').value = `release/${year}/qa/${sprint}`;
  document.getElementById('txtQaTempBranch').value = `release/${year}/qa/${sprint}-${ddmm}`;

  document.getElementById('envListContainer').style.display = 'block';
  document.getElementById('result').style.display = 'none';
});

// CHỨC NĂNG 1: TẠO NHÁNH US & LƯU LỊCH SỬ COMMIT
document.getElementById('btnGenerate').addEventListener('click', () => {
  const user = document.getElementById('txtUser').value.trim();
  const sprint = document.getElementById('txtSprint').value.trim();
  const usNumber = document.getElementById('txtUSNumber').value.trim();
  const usTitleRaw = document.getElementById('txtUSTitle').value.trim();

  let isFormValid = true;
  clearError('txtUser');
  clearError('txtSprint');
  if (!usNumber) { showError('txtUSNumber'); isFormValid = false; }
  if (!usTitleRaw) { showError('txtUSTitle'); isFormValid = false; }

  if (!isFormValid) return;

  // Lọc định dạng chuỗi Git Branch
  let cleanTitle = usTitleRaw.replace(/^\[[^\]]*\]\s*/g, '');
  cleanTitle = cleanTitle.replace(/['"]/g, '');
  cleanTitle = cleanTitle.replace(/\s+/g, '-');
  cleanTitle = cleanTitle.replace(/^-+|-+$/g, '');

  const branchName = [user, sprint, usNumber, cleanTitle].filter(Boolean).join('/');

  // Xử lý lưu mảng lịch sử Commit và Branch cục bộ (tối đa 10 mục)
  chrome.storage.local.get(['commitHistory', 'branchHistory'], (result) => {
    let history = result.commitHistory || [];
    let branchHistory = result.branchHistory || [];

    history.unshift({ number: usNumber, title: usTitleRaw });
    branchHistory.unshift(branchName);

    if (history.length > 10) history = history.slice(0, 10);
    if (branchHistory.length > 10) branchHistory = branchHistory.slice(0, 10);
    
    chrome.storage.local.set({ 
      'savedUser': user, 
      'savedSprint': sprint,
      'commitHistory': history,
      'branchHistory': branchHistory
    }, () => {
      renderHistory(history);
      renderBranchHistory(branchHistory);
    });
  });

  document.getElementById('envListContainer').style.display = 'none';
  const resultDiv = document.getElementById('result');
  resultDiv.innerText = branchName;
  resultDiv.style.display = 'block';

  navigator.clipboard.writeText(branchName).then(() => showToast());

  // Reset 2 field cuối và focus về ô US Number
  document.getElementById('txtUSNumber').value = '';
  document.getElementById('txtUSTitle').value = '';
  document.getElementById('txtUSNumber').focus();
});

function showToast() {
  const successMsg = document.getElementById('successMessage');
  successMsg.style.display = 'block';
  setTimeout(() => { successMsg.style.display = 'none'; }, 2200);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "US_NUMBER_SELECTED") {
    const txtUSNumber = document.getElementById('txtUSNumber');
    txtUSNumber.value = message.text.trim();
    clearError('txtUSNumber');
    document.getElementById('txtUSTitle').focus();
  }
  if (message.type === "TEXT_SELECTED") {
    const txtUSTitle = document.getElementById('txtUSTitle');
    txtUSTitle.value = message.text;
    clearError('txtUSTitle');
    txtUSTitle.focus();
  }
});