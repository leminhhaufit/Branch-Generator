// Lắng nghe sự kiện người dùng nhả chuột sau khi bôi đen (select text)
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  
  // Nếu có bôi đen chữ thì gửi dữ liệu đó sang cho Extension
  if (selectedText.length > 0) {
    chrome.runtime.sendMessage({
      type: "TEXT_SELECTED",
      text: selectedText
    }).catch(err => {
      // Bỏ qua lỗi nếu Extension chưa được mở sẵn
    });
  }
});
