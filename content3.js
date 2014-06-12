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
      //自動購票
      if (robot.auto.enable) {
        var injectJS = '(' +
          function(text) {
            $('input[type="text"],textarea').each(function() {
              var $this = $(this);
              if ($this.val() === '') {
                $this.val(text).trigger('change');
              }
            });
            $('input').trigger('click').trigger('change');
            $('a.btn-primary').trigger('click');
          }
          + ')(' + JSON.stringify(robot.auto.text) + ');'
        var script = document.createElement('script');
        script.textContent = injectJS;
        document.head.appendChild(script);
        script.parentNode.removeChild(script);
      }
    }
  }
);

}

});