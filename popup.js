chrome.tabs.getSelected(function(tab) {
  var Robot    = chrome.extension.getBackgroundPage().Robot
    , tabId    = tab.id
    , robot    = Robot[ tabId ]
    , $except  = $('#except')
    , $form    = $('#setting')
    , form     = $form[0]
    ;

  if (robot.status === 'unprepared') {
    location.reload();
    return false;
  }

  //設定活動名稱
  $('h4 span').text(robot.title);

  //設定票種
  $.each(robot.tickets, function(key, v) {
    $except.append('<p><label><span class="ticketName"><input type="checkbox" class="except" />等待票種：' + v.name + '</span></label></p>');
  });

  //進行中的機器人自動載入之前設定
  if (robot.status === 'processing') {
    $.each(robot.except, function(i, key) {
      $except.find('input.except').eq( key ).prop('checked', true);
    });
    form.wait.value = robot.wait + '';
    form.audio.value = robot.audio;
    $(form.audioLoop).prop('checked', robot.audioLoop);
  }

  //檢查狀態、修改功能是否可啟動
  if (robot.status === 'processing') {
    $form.find('input.submit').prop('disabled', true);
  }
  else {
    $form.find('input.cancel').prop('disabled', true);
  }

  //啟動機器人
  $form.on('submit', function() {
    //檢查各票種購買張數
    var except    = []
      ;

    if ($form.find('input.except:checked').length < 1) {
      alert('請選擇等待票種!');
      return false;
    }
    $form.find('input.except').each(function(i) {
      if (this.checked) {
        except.push(i);
      }
    });

    robot.wait = parseInt(form.wait.value, 10);
    robot.except = except;
    robot.audio = form.audio.value;
    robot.audioLoop = form.audioLoop.checked;

    robot.status = 'processing';
    chrome.tabs.reload(tabId);
    window.close();
  });

  //停止機器人
  $('#setting input.cancel').on('click', function() {
    robot.status = 'prepared';
    chrome.runtime.sendMessage({'type' : 'stopRobot', 'tab' : tabId}, function() {
      chrome.tabs.reload(tabId);
      window.close();
    });
  });
});