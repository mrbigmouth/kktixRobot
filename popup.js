chrome.tabs.getSelected(function(tab) {
  var Robot    = chrome.extension.getBackgroundPage().Robot
    , tabId    = tab.id
    , robot    = Robot[ tabId ]
    , $except  = $('#except')
    , $autoBuy = $('#autoBuy')
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
    $autoBuy.append('<p><label><span class="ticketName">票種：' + v.name + '</span>購買張數：<input type="number" class="number autoBuy" value="0" step="1" min="0" /></label></p>');
  });

  //進行中的機器人自動載入之前設定
  if (robot.status === 'processing') {
    $.each(robot.except, function(i, key) {
      $except.find('input.except').eq( key ).prop('checked', true);
    });
    form.wait.value = robot.wait + '';
    form.audio.value = robot.audio;
    $(form.audioLoop).prop('checked', robot.audioLoop);
    if (robot.auto.enable) {
      form.autoEnable.checked = true;
      form.text.value = robot.auto.text;
      $.each(robot.auto.buy || {}, function(key, v) {
        $autoBuy.find('input.autoBuy').eq( key ).val( v );
      });
    }
    else {
      form.autoEnable.checked = false;
    }

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
    var autoBuy   = []
      , except    = []
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

    if (form.autoEnable.checked) {
      $form.find('input.autoBuy').each(function(i) {
        autoBuy.push(parseInt(this.value, 10));
      });
      robot.auto = {'enable' : true, 'buy' : autoBuy, 'text' : form.text.value};
    }
    else {
      robot.auto = {'enable' : false};
    }

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
