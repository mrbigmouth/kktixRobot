$(function() {

if (location.href.substr(-4) !== '/new') {
//取得目前tab的機器人資訊
chrome.runtime.sendMessage(
  {'type' : 'getRobot'}
, function(robot) {
    switch (robot.status) {
    //機器人行動中
    case 'processing' :
      //停止機器人
      chrome.runtime.sendMessage({'type' : 'stopRobot'});
    }
  }
);

}

});