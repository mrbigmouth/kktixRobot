//取得目前tab的機器人資訊
chrome.runtime.sendMessage(
  {'type' : 'getRobot'}
, function(robot) {
    switch (robot.status) {
    //機器人尚未設置
    case 'unprepared' :
      //網頁載入後一秒才執行掃描
      setTimeout(
        function() {
          //獲取票種資訊
          var tickets = [];
          $('tr.name').each(function() {
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
        }
      //網頁載入後一秒才執行掃描
      , 1000);
      break;
    //機器人行動中
    case 'processing' :
      var stopFlag = false;
      //網頁載入後一秒才執行掃描
      setTimeout(
        function() {
          var $tickets = $('[id^="ticket"]');
          console.log('頁面中存在' + $tickets.length + '張票!');
          //檢測是否有可購買的票
          $.each(robot.except, function(k, ticketSort) {
            var $select =$tickets.eq(ticketSort).find('input[ng-if="purchasable"]')
              , wantBuy
              , autoBuy
              ;
            console.log('檢查第' + (ticketSort + 1) + '張票是否可購買...')

            //有票可買
            if ($select.length) {
              console.log('可購買!');
              if (stopFlag === false) {
                //撥放音效
                chrome.runtime.sendMessage({'type' : 'playAudio'});
                stopFlag = true;
              }
            }
            else {
              console.log('不可購買!');
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
            console.log('等待' + robot.wait + '秒後重載網頁!');
            //固定時間刷新頁面
            setTimeout(function() { if (stopFlag === false) { location.reload();} }, robot.wait * 1000);
          }
        }
        //網頁載入後二秒才執行掃描
        , 2000
      );
    }
  }
);
