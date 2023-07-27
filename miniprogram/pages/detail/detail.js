// pages/detail/detail.js

let bookInfo = null;

const app = getApp()
let userData = app.globalData.userData

let thisUrl = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    status_bar_height: 0,
    cover_url: "",
    title: "书籍名称",
    author: "本文作者",
    synopsis: "暂无简介",
    classifyName: "暂无类别",
    lastUpdateTime: " - - ",
    lastUpdateName: "暂无最新章节数据",
    added: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    thisUrl = options.url
    var self = this

    wx.showLoading({
      title: '加载中',
      mask: true,
    })

    wx.getSystemInfoAsync({
      success: (data)=> {
        self.setData({
          status_bar_height: data.statusBarHeight,
        })
      }
    })

    wx.cloud.callFunction({
      // 云函数名称
      name: 'reptile',
      // 传给云函数的参数
      data: {
        "type": "get_novel_intro",
        "arg": thisUrl
      },
      success: res=>{
        let result = res.result
        bookInfo = result
        this.setData({
          cover_url: result.bookCoverUrl,
          title: result.bookName,
          author: result.authorName,
          synopsis: result.bookIntro,
          classifyName: result.classifyName,
          lastUpdateTime: result.lastUpdateTime,
          lastUpdateName: result.lastUpdateName,
        })


        let novel_list = app.globalData.userData.novel_list
        
        // 循环遍历判断书籍是否已经在书架
        novel_list.forEach((item, index)=>{
          if(item.url === thisUrl){
            this.setData({
              added: true
            })
          }
        })

        wx.hideLoading()
      },
      fail: err=>{
        console.error(err)
      }
    })

  },
  onBackIconTap(){
    console.log("back")
    wx.navigateBack({
      delta:1
    })
  },

  onAddNovel(){
    if(thisUrl){
      app.globalData.userData.novel_list.unshift({
        "name": bookInfo.bookName,
        "url": thisUrl,
        "cover": bookInfo.bookCoverUrl,
        "progress":{
          "name": '未读',
          "url": bookInfo.firstChapterUrl
        },
        "last_update": bookInfo.lastUpdateTime
      })
      console.log(app.globalData.userData.novel_list)
      app.updateUserNovelList()  // 更新数据库信息
      this.setData({
        added: true,
      })
    }else{
      console.log("当前页面url无效")
    }
    
  },

  onToRead(){
    wx.reLaunch({
      url: '/pages/index/index'
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
})