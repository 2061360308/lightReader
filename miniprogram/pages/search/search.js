// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searching: false,
    resultList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onSearch(data){
    let searchKey = data.detail.value
    this.setData({
      searching: true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'reptile',
      // 传给云函数的参数
      data: {
        "type": "get_novel_list",
        "arg": searchKey
      },
      success: res=>{
        let resultList = res.result
        this.setData({
          resultList: resultList,
          searching: false
        })
      },
      fail: err=>{
        console.error(err)
      }
    })
  },
  onSearchDetail(data){
    let url = data.target.dataset.url
    wx.navigateTo({
      url: '/pages/detail/detail?url='+url,
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