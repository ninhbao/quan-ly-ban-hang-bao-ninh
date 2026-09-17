(function () {
  var root = document.getElementById('root');
  var reloadKey = 'bao-ninh-isolation-reloads';
  var reloadCount = 0;
  var canTrackReloads = true;
  try { reloadCount = Number(sessionStorage.getItem(reloadKey) || 0); sessionStorage.setItem(reloadKey, String(reloadCount)); } catch (_) { canTrackReloads = false; }
  function message(title, detail, retry) {
    root.textContent = '';
    var card = document.createElement('section');
    card.style.cssText = 'margin:auto;padding:24px;max-width:560px;font:16px/1.6 system-ui;color:#1e2b21;overflow-wrap:anywhere';
    var heading = document.createElement('h2'); heading.textContent = title;
    var text = document.createElement('p'); text.textContent = detail;
    var hint = document.createElement('p');
    hint.textContent = 'Trong ứng dụng Google: chọn menu ⋯ → Mở trong Safari hoặc Chrome. Dùng chế độ duyệt thường và cập nhật trình duyệt. Không xóa dữ liệu trang web để xử lý lỗi.';
    var link = document.createElement('p'); link.textContent = location.href.split('#')[0];
    card.append(heading, text, hint, link);
    if (retry) {
      var button = document.createElement('button'); button.textContent = 'Thử tải lại';
      button.style.cssText = 'background:#35683d;color:white;border:0;border-radius:10px;padding:14px;font-size:16px';
      button.onclick = function () { try { sessionStorage.removeItem(reloadKey); } catch (_) {} location.reload(); };
      card.append(button);
    }
    root.append(card);
  }
  window.coi = {
    coepCredentialless: function () { return false; },
    doReload: function () {
      if (!canTrackReloads || reloadCount >= 2) { message('Chưa mở được dữ liệu trên trình duyệt này', 'Trang không thể hoàn tất cấu hình lưu dữ liệu. Hãy mở link bằng Safari hoặc Chrome trực tiếp.', true); return; }
      reloadCount += 1;
      try { sessionStorage.setItem(reloadKey, String(reloadCount)); } catch (_) {}
      location.reload();
    },
    quiet: true
  };
  async function start() {
    if (!window.isSecureContext || !navigator.serviceWorker) {
      message('Cần mở bằng Safari hoặc Chrome', 'Trình duyệt hiện tại không hỗ trợ đầy đủ cơ chế lưu dữ liệu của ứng dụng. Chưa có dữ liệu nào bị xóa.', true); return;
    }
    if (!window.crossOriginIsolated) {
      root.textContent = 'Đang chuẩn bị lưu dữ liệu trên máy… Trang có thể tải lại tối đa hai lần.';
      // Existing Safari sessions may still be controlled by the old credentialless policy.
      if (navigator.serviceWorker.controller) setTimeout(function () { if (!window.crossOriginIsolated) window.coi.doReload(); }, 1000);
      setTimeout(function () { if (!window.crossOriginIsolated) message('Chưa hoàn tất tải ứng dụng', 'Trình duyệt chưa cho phép mở dữ liệu. Hãy thử tải lại hoặc mở link trong trình duyệt ngoài.', true); }, 15000);
      return;
    }
    if (typeof SharedArrayBuffer === 'undefined' || typeof WebAssembly === 'undefined' || !navigator.storage || !navigator.storage.getDirectory) {
      message('Trình duyệt chưa hỗ trợ lưu dữ liệu', 'Hãy cập nhật Safari hoặc Chrome và mở lại link bằng chế độ duyệt thường.', true); return;
    }
    try { await navigator.storage.getDirectory(); }
    catch (_) { message('Không truy cập được bộ nhớ trình duyệt', 'Hãy cho phép lưu dữ liệu trang web và dùng chế độ duyệt thường. Không xóa dữ liệu đang có.', true); return; }
    try { sessionStorage.removeItem(reloadKey); } catch (_) {}
    root.textContent = '';
    (window.salesAppScripts || []).forEach(function (src) {
      var script = document.createElement('script'); script.src = src; script.defer = true;
      script.onerror = function () { message('Không tải được ứng dụng', 'Kiểm tra kết nối mạng rồi thử tải lại. Dữ liệu trên máy chưa bị xóa.', true); };
      document.body.appendChild(script);
    });
  }
  start();
})();
