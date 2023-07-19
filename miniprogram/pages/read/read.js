let screenWidth = null;

const app = getApp()

let currentChapterUrl = null
let currentChapterTitle = null
let currentChapterContent = null

let currentNovelUrl = null
let currentNovelTitle = null
let currentNovelIndex = null  // 这是在用户novel_list中的index
let currentNovelChapterList = null

let nextChapterUrls = []
let nextChapterTitles = []
let nextChapterContents = []

let prevChapterUrls = []
let prevChapterTitles = []
let prevChapterContents = []

// pages/read/read.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        visible: false, // 弹出面板显隐
        status_bar_height: 0, // 标题栏高
        read_config: { // 阅读配置
            background_color: "#f4ecd1", // 背景颜色
            dark: false, // 日间, 夜间模式
            font_size: 20, // 字号
            font_family: "", // 字体
            mode: "scroll" // 阅读翻页模式
        },
        currentBgColorIndex: 2,
        background_color_list: ["#e0e0e0", // 可选背景色列表
            "#f5f1e8",
            "#f4ecd1",
            "#daf2da",
            "#dceaee"
        ],
        chapterContent: "",
        chapterTitle: "",
        novelTitle: ""
    },

    operate_clicked: function (data) {
        let x = data.detail.x
        // console.log(screenWidth)
        if (screenWidth * 0.3 < x & x < screenWidth * 0.7) {
            // console.log(screenWidth * 0.3, x, screenWidth * 0.7)
            this.setData({
                visible: true
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let novel_url = options.url
        var self = this
        wx.getSystemInfoAsync({
            success: (data) => {
                screenWidth = data.screenWidth;
                self.setData({
                    status_bar_height: data.statusBarHeight,
                })
            }
        })

        wx.showLoading({
            title: '加载中',
        })
        console.info(app.globalData.userData)
        app.globalData.userData.novel_list.forEach((item, index) => {
            if (item.url === novel_url) {
                currentChapterUrl = item.progress.url
                currentChapterUrl = item.progress.url
                currentNovelTitle = item.name
                currentNovelIndex = index
            }
        })

        wx.cloud.callFunction({
            // 云函数名称
            name: 'reptile',
            // 传给云函数的参数
            data: {
                "type": "get_chapter_list",
                "arg": currentChapterUrl
            },
            success: res => {
                console.log("是成功了吗^^^^^^^^^^^^^^^^^^^^^", res)
                // currentNovelChapterList = res.result.result
            },
            fail: err => {
                console.log("出错来了:", err)
                console.error(err)
            }
        })

        wx.cloud.callFunction({
            // 云函数名称
            name: 'reptile',
            // 传给云函数的参数
            data: {
                "type": "get_chapter_content",
                "arg": currentChapterUrl
            },
            success: res => {
                console.log("章节数据", res)
                currentChapterTitle = res.result.chapterTitle
                currentChapterContent = res.result.chapterContent
                nextChapterUrls.push(res.result.nextChapterUrl)
                prevChapterUrls.push(res.result.prevChapterUrl)

                console.log("设置内容")
                self.setData({
                    read_config: app.globalData.userData.read_config,
                    chapterContent: currentChapterContent,
                    chapterTitle: currentChapterTitle,
                    novelTitle: currentNovelTitle
                })
                this.changeCurrentBgColor(this.data.read_config.background_color)
            },
            fail: err => {
                console.error(err)
            }
        })

        wx.hideLoading()

    },
    onVisibleChange(e) {
        this.setData({
            visible: e.detail.visible,
        });
    },
    onBackIconTap() {
        console.info("返回")
        wx.redirectTo({
            url: '/pages/index/index'
        })
    },
    onFontSizeDecrease() {
        let current = this.data.read_config.font_size - 1
        if (14 <= current & current <= 25) {
            let current_config = this.data.read_config
            current_config.font_size = current
            this.setData({
                read_config: current_config
            })
        }
    },
    onFontSizeIncrease() {
        let current = this.data.read_config.font_size + 1
        if (14 <= current & current <= 25) {
            let current_config = this.data.read_config
            current_config.font_size = current
            this.setData({
                read_config: current_config
            })
        }
    },
    onBackgroundColorChange(data) {
        console.log(data)
        let color = data.currentTarget.dataset.color
        this.changeCurrentBgColor(color)
    },

    changeCurrentBgColor(color){
        let index = this.data.background_color_list.indexOf(color);
        let current_config = this.data.read_config
        current_config.background_color = color
        this.setData({
            read_config: current_config,
            currentBgColorIndex: index
        })

        // 同步云端数据
        app.globalData.userData.read_config = this.data.read_config
        app.updataReadConfig()
    },

    cacheNextChapter(){
        // 检查是否给出下一章的链接
        if(nextChapterUrls[0] === []){
            // 尝试在currentNovelChapterList中查找下一项
            currentNovelChapterList.forEach((item, index)=>{
                if (item.chapterUrl === currentChapterUrl){
                    if(index < (currentNovelChapterList.length - 1)){
                        nextChapterUrls[0] = item.chapterUrl
                    }
                }
            })
        }

        // 再次筛查是否为null值
        if(nextChapterUrls[0] !== null){
            // 进行缓冲下一个章节
            wx.cloud.callFunction({
                // 云函数名称
                name: 'reptile',
                // 传给云函数的参数
                data: {
                    "type": "get_chapter_content",
                    "arg": nextChapterUrl
                },
                success: res => {
                    console.log("下一章节数据", res)
                    nextChapterTitles.push(res.result.chapterTitle)
                    nextChapterContents.push(res.result.chapterContent)
                    nextChapterUrls.push(res.result.nextChapterUrl)
                    prevChapterUrls.push(res.result.prevChapterUrl)
                },
                fail: err => {
                    console.error(err)
                }
            })
        }

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
        console.info("你打了夜阑的狗一巴掌，完了你，现在就摇人")
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})