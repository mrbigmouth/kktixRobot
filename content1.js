//取得目前tab的機器人資訊
chrome.runtime.sendMessage(
  {'type' : 'getRobot'}
, function(robot) {
    switch (robot.status) {
    //機器人尚未設置
    case 'unprepared' :
      //獲取票種資訊
      var tickets = [];
      $('div.tickets table tbody tr').each(function() {
        var $this = $(this)
          , data  = {}
          , period
          ;

        data.name = $this.find('td.name').text().replace(/^\s+|\s+$/gm,'');
        period = $this.find('td.period').text().match(/(\d+\/\d+\/\d+ \d+\:\d+)/g);
        if (period.length > 1) {
          data.start = Date.parse(period[0]);
          data.end = Date.parse(period[1]);
        }
        else {
          data.end = Date.parse(period[0]);
        }

        tickets.push(data);
      });
      //插入/更新票種資訊
      chrome.runtime.sendMessage(
        {'type'    : 'ticketInfo'
        ,'title'   : $('div.header-title').text().replace(/^\s+|\s+$/gm,'')
        ,'tickets' : tickets
        }
      );
      break;


    //機器人行動中
    case 'processing' :
      //分析url
      var url = location.href.match(/.kktix.cc\/events\/([a-zA-Z0-9_\-]+)/);
      if (url) {
        url = url[1];
        url = 'https://kktix.com/events/' + url + '/registrations/new';
        //進入售票頁面
        location.href = url;
      }
      break;
    }
  }
);