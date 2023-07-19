// pages/index.js

// const { refreshNodesWorldTransform } = require("XrFrame/kanata/lib/index")

let openId = ""
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const app = getApp()

Component({

  /**
   * 页面的初始数据
   */

  data: {
    avatarUrl: defaultAvatarUrl,
    changeName: false,
    nickname: '未登录',
    novel_list: []
  },

  options: {
    styleIsolation: 'shared'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  methods: {
    //0e1fjyFa1lzvFF0ZWMIa1lxcpF1fjyFF
    onLoad(options) {
      let self = this
      // 注册回调, 等后端传回用户数据后更新页面
      getApp().userInitCallBack=function(userData){
        self.setData({
          nickname: userData.nickName,
          avatarUrl: userData.avatarUrl,
          novel_list: userData.novel_list
        })

        console.info("index 数据初始化完毕", self.data)
        // console.log("self.data.nickname:",self.data)
      }

      if (app.globalData.userData !== null){
        console.log("当前用户信息变更为: ",app.globalData.userData)
        let userData = app.globalData.userData
        self.setData({
          nickname: userData.nickName,
          avatarUrl: userData.avatarUrl,
          novel_list: userData.novel_list
        })
      }

      // console.log("当前用户信息变更为: ",app.globalData.userData)
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail 
      this.setData({
        avatarUrl,
      })
    },
    onOpenBook(data){
      // console.log("data",data.detail.url)
      let novel_url = data.detail.url
      console.log(novel_url)
      wx.redirectTo({
        url: '/pages/read/read?url='+ novel_url
      })
    },
    onDelBook(data){
      console.log("删除",data.detail.url)
      let url = data.detail.url
      app.globalData.userData.novel_list.forEach(item => {
        if (item.url === url){
          app.globalData.userData.novel_list.splice(app.globalData.userData.novel_list.indexOf(item), 1);
        }
      });
      this.setData({
        novel_list: app.globalData.userData.novel_list
      })
      app.updataUserNovelList()
    },

    onAddNewBook(){
      wx.redirectTo({
        url: '/pages/search/search'
      })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
  },
})