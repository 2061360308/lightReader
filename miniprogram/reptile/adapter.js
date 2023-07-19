/* 
构建一个适配器,在不同情况下使用不同方法调用代理云函数
*/

const cheerio = require('../miniprogram_npm/cheerio/index');

function requestUrl (url){
    wx.cloud.callFunction({
        // 云函数名称
        name: 'proxy',
        // 传给云函数的参数
        data: {
          "url": url
        },
        success:res=>{
            return cheerio.load(res);
        },
        fail: err=>{
          console.error(err)
          return err
        }
      })
}


module.exports = {
    requestUrl
};