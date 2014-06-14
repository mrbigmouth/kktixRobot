var Robot = {};
var $Audio = {};

//接受訊息時
chrome.runtime.onMessage.addListener(
  function(msg, sender, respond) {
    var tabId = sender.tab ? sender.tab.id : msg.tab
      , robot
      ;

    //顯示機器人設定button
    chrome.pageAction.show(tabId);

    //若該tab尚未創建機器人資訊，則創建
    if (Robot[ tabId ] === undefined) {
      Robot[ tabId ] = 
          {'status' : 'unprepared'
          ,'audio'  : 'http://taira-komori.jpn.org/sound_os/arms01/explosion2.mp3'
          ,'auto'   :
              {'enable' : false
              ,'buy'    : []
              ,'text'   : '搶票中，之後修改'
              }
          , 'except' : []
          };
    }

    //內部用快捷變數
    robot = Robot[ tabId ];
    //根據msg type執行程式/回傳結果
    switch (msg.type) {
    //獲取票種資訊
    case 'ticketInfo':
      //更新/插入資訊
      robot.title = msg.title;
      robot.tickets = msg.tickets;
      robot.status = 'prepared';
      respond(true);
      break;

    //取得機器人資訊
    case 'getRobot' :
      respond(robot);
      break;

    //撥放音效
    case 'playAudio' :
      var $audio = $($.parseHTML('<audio' + (robot.audioLoop ? ' loop' : '') + '><source src="' + robot.audio + '"></audio>'));
      $audio[0].play();
      if ($Audio[ tabId ]) {
        $Audio[ tabId ][0].pause();
        delete $Audio[ tabId ];
      }
      $Audio[ tabId ] = $audio;
      respond(true);
      break;

    //停止機器人
    case 'stopRobot' :
      if ($Audio[ tabId ]) {
        $Audio[ tabId ][0].pause();
        delete $Audio[ tabId ];
      }
      robot.status = 'prepared';
      respond(true);
      break;
    }
  }
);

//關閉tab時
chrome.tabs.onRemoved.addListener(function(tabId) {
  var robot = Robot[ tabId ];
  if (robot !== undefined) {
    if ($Audio[ tabId ]) {
      $Audio[ tabId ][0].pause();
      delete $Audio[ tabId ];
    }
    delete Robot[ tabId ];
  }
});