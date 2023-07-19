// app.js
App({
  onLaunch:function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-5gn2xxba0286dda1',
        // traceUser: true,
      });

      wx.cloud.callFunction({
        // 云函数名称
        name: 'user',
        // 传给云函数的参数
        data: {
          type: "queryUser"
        },
        success:res=>{
          // console.log("拿到的数据", res.result)
          // 莫名其妙会变成数组, 干脆这里判断一下
          if(res.result instanceof Array){
            this.globalData.userData = res.result[0]
          }else{
            this.globalData.userData = res.result
          }

          
          console.info("后端数据加载完毕",this.globalData.userData)
          this.userInitCallBack(this.globalData.userData);
          console.info("用户身份初始化完毕", this.globalData.userData)
        },
        fail: err=>{
          console.error(err)
        }
      })
    }

    this.globalData = {
      userData: null
    };
  },

  updataUserNovelList(){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'user',
      // 传给云函数的参数
      data: {
        type: "update",
        "arg": {
          "novel_list": this.globalData.userData.novel_list
        }
      },
      success:res=>{
        return res
      },
      fail: err=>{
        console.error(err)
      }
    })
  },
  updataUserName(){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'user',
      // 传给云函数的参数
      data: {
        type: "update",
        "arg": {
          "nickName": this.globalData.userData.nickName
        }
      },
      success:res=>{
        return res
      },
      fail: err=>{
        console.error(err)
      }
    })
  },
  updataReadConfig(){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'user',
      // 传给云函数的参数
      data: {
        type: "update",
        "arg": {
          "read_config": this.globalData.userData.read_config
        }
      },
      success:res=>{
        return res
      },
      fail: err=>{
        console.error(err)
      }
    })
  }
});
