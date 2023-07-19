wx.cloud.callFunction({
    // 云函数名称
    name: 'reptile',
    // 传给云函数的参数
    data: {
      "type": "get_chapter_content",
      "arg": currentChapterUrl
    },
    success:res=>{
      console.log("章节数据", res)
      currentChapterTitle = res.result.result.chapterTitle
      currentChapterContent = res.result.result.chapterContent
      nextChapterUrl = res.result.result.nextChapterUrl
      prevChapterUrl = res.result.result.prevChapterUrl
      
      console.log("设置内容")
      self.setData({
        read_config: app.globalData.userData.read_config,
        chapterContent: currentChapterContent,
        chapterTitle: currentChapterTitle,
        novelTitle: currentNovelTitle
      })
      // console.log(self.data.chapterContent)
    },
    fail: err=>{
      console.error(err)
    }
  })

  wx.cloud.callFunction({
    // 云函数名称
    name: 'proxy',
    // 传给云函数的参数
    data: {
      "url": "http://www.b520.cc/8_8187/"
    },
    success:res=>{
      console.log("是成功了吗^^^^^^^^^^^^^^^^^^^^^", res)
      // currentNovelChapterList = res.result.result
    },
    fail: err=>{
      console.log("出错来了:", err)
      console.error(err)
    }
  })