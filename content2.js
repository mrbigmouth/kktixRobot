//取得目前tab的機器人資訊
chrome.runtime.sendMessage(
  {'type' : 'getRobot'}
, function(robot) {
    switch (robot.status) {
    //機器人尚未設置
    case 'unprepared' :
      //獲取票種資訊
      var tickets = [];
      $('tr[id]').each(function() {
        var $this = $(this)
          , data  = {}
          , period
          ;

        data.name = $this.find('td:first').text().replace(/^\s+|\s+$/gm,'');

        tickets.push(data);
      });

      //插入/更新票種資訊
      chrome.runtime.sendMessage(
        {'type'    : 'ticketInfo'
        ,'title'   : $('h2.registration-event').text().replace(/^\s+|\s+$/gm,'')
        ,'tickets' : tickets
        }
      );
      break;

    //機器人行動中
    case 'processing' :
      var stopFlag = false;
      //檢測是否有可購買的票
      $.each(robot.except, function(k, ticketSort) {
        var $select = $('tbody[ng-controller="TicketCtl"]:eq(' + ticketSort + ') select[type="number"]')
          , wantBuy
          , autoBuy
          ;

        //有票可買
        if ($select.length) {
          if (stopFlag === false) {
            //撥放音效
            chrome.runtime.sendMessage({'type' : 'playAudio'});
            stopFlag = true;
          }
        }
      });

      if (stopFlag) {
        //自動購票
        if (robot.auto.enable) {
          var injectJS = '(' +
            function(buy) {
              var $ticket = $('tr[id]');
              $ticket.each(function(ticketSort) {
                var wantBuy = buy[ticketSort]
                  , finalBuy
                  ;
                if (wantBuy > 0) {
                  var $select = $(this).find('select[type="number"]');
                  if ($select.length > 0) {
                    $select.find('option').each(function() {
                      var canBuy = parseInt(this.value, 10);
                      if (canBuy <= wantBuy) {
                        finalBuy = canBuy;
                        return true;
                      }
                      else {
                        finalBuy = wantBuy;
                        return false;
                      }
                    });
                    $select.val(finalBuy).trigger('change');
                  }
                }
              });
              //勾選同意條款
              $('#person_agree_terms').trigger('click');
              //送出購買要求
              $('button.btn.btn-primary').trigger('click');
            }
            + ')(' + JSON.stringify(robot.auto.buy) + ');';
          var script = document.createElement('script');
          script.textContent = injectJS;
          document.head.appendChild(script);
          script.parentNode.removeChild(script);
        }
      }
      else {
        //固定時間刷新頁面
        setTimeout(function() { if (stopFlag === false) { location.reload();} }, robot.wait * 1000);
      }
    }
  }
);
