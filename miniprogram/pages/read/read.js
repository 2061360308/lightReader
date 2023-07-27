let screenWidth = null;

const app = getApp()
const query = wx.createSelectorQuery()

let currentChapterUrl = null
let currentChapterTitle = null
let currentChapterContent = null

let currentNovelUrl = null
let currentNovelTitle = null
let currentNovelIndex = null // 这是在用户novel_list中的index
let currentNovelChapterList = null

let chapterDataCaches = [] // 章节数据缓存
let currentChapterIndex = 0 // 当前章节索引
let scrollTop = 0  // 距顶距离

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
        frontChapterContent: "",
        frontChapterTitle: "",
        afterChapterContent: "",
        afterChapterTitle: "",
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
                
                chapterDataCaches.push({
                    url: item.progress.url,
                    title: null,
                    content: null,
                })
                currentNovelTitle = item.name
                currentNovelIndex = index
                currentNovelUrl = item.url
            }
        })

        console.log(currentNovelUrl)

        wx.cloud.callFunction({
            // 云函数名称
            name: 'reptile',
            // 传给云函数的参数
            data: {
                "type": "get_chapter_list",
                "arg": currentNovelUrl
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
                "arg": chapterDataCaches[currentChapterIndex].url
            },
            success: res => {
                console.log("章节数据", res)
                // currentChapterTitle = res.result.chapterTitle
                // currentChapterContent = res.result.chapterContent
                // nextChapterUrls.push(res.result.nextChapterUrl)
                // prevChapterUrls.push(res.result.prevChapterUrl)

                chapterDataCaches[currentChapterIndex].title = res.result.chapterTitle
                chapterDataCaches[currentChapterIndex].content = res.result.chapterContent

                // 缓存区添加下一个
                console.log(chapterDataCaches)
                chapterDataCaches.push({
                    content: null,
                    url: res.result.nextChapterUrl,
                    title: null
                })

                // 缓存区添加上一个
                chapterDataCaches.unshift({
                    content: null,
                    url: res.result.prevChapterUrl,
                    title: null
                })

                // 前面加一, 当前index需要递增
                currentChapterIndex += 1

                console.log(chapterDataCaches)

                console.log("设置内容",chapterDataCaches)
                self.setData({
                    read_config: app.globalData.userData.read_config,
                    afterChapterContent: "hello",
                    afterChapterTitle: "hello",
                    afterChapterContent: chapterDataCaches[currentChapterIndex].content,
                    afterChapterTitle: chapterDataCaches[currentChapterIndex].title,
                    novelTitle: currentNovelTitle
                })
                this.changeCurrentBgColor(this.data.read_config.background_color)

                wx.hideLoading()

                // 缓存下一章
                this.cacheNextChapter()
            },
            fail: err => {
                console.error(err)
            }
        })

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

    changeCurrentBgColor(color) {
        let index = this.data.background_color_list.indexOf(color);
        let current_config = this.data.read_config
        current_config.background_color = color
        this.setData({
            read_config: current_config,
            currentBgColorIndex: index
        })

        // 同步云端数据
        app.globalData.userData.read_config = this.data.read_config
        app.updateReadConfig()
    },

    cacheNextChapter() {
        // 检查是否给出下一章的链接
        let nextChapterData = chapterDataCaches[currentChapterIndex + 1]
        console.info("准备缓存下一章", nextChapterData)

        if (nextChapterData.url === null) {
            console.info("尝试在currentNovelChapterList中查找下一项")
            // 尝试在currentNovelChapterList中查找下一项
            currentNovelChapterList.forEach((item, index) => {
                if (item.chapterUrl === currentChapterUrl) {
                    if (index < (currentNovelChapterList.length - 1)) {
                        chapterDataCaches[currentChapterIndex + 1].url = item.chapterUrl
                    }
                }
            })
        }

        nextChapterData = chapterDataCaches[currentChapterIndex + 1]

        // 再次筛查是否为null值
        if (nextChapterData.url !== null) {
            // 进行缓冲下一个章节
            console.info("进行缓冲下一个章节")
            wx.cloud.callFunction({
                // 云函数名称
                name: 'reptile',
                // 传给云函数的参数
                data: {
                    "type": "get_chapter_content",
                    "arg": chapterDataCaches[currentChapterIndex + 1].url
                },
                success: res => {
                    console.log("下一章节数据缓存成功", res)

                    chapterDataCaches[currentChapterIndex + 1] = {
                        url: chapterDataCaches[currentChapterIndex + 1].url,
                        content: res.result.chapterContent,
                        title: res.result.chapterTitle,
                    }

                    chapterDataCaches.push({
                        url: res.result.nextChapterUrl,
                        content: null,
                        title: null
                    })
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

    onPageScroll: function (e) {
        scrollTop = e.scrollTop
        console.log('距顶距离',e.scrollTop)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        console.info("你打了夜阑的狗一巴掌，完了你，现在就摇人")
        // 判断下一章节的内容是否为空
        let nextChapterData = chapterDataCaches[currentChapterIndex + 1]

        if (nextChapterData.content !== null) {
            console.info("存在下一章缓存, 进行加载")

            let _afterChapterContent = chapterDataCaches[currentChapterIndex + 1].content
            let _afterChapterTitle = chapterDataCaches[currentChapterIndex + 1].title

            let _frontChapterContent = chapterDataCaches[currentChapterIndex].content
            let _frontChapterTitle = chapterDataCaches[currentChapterIndex].title

            currentChapterIndex += 1

            let _scrollTop = scrollTop
            // console.log("aaa",scrollTop, _scrollTop)
            // 完成数据迭代, 更新页面

            console.log("换页前", _scrollTop, scrollTop, _scrollTop - scrollTop)

            this.setData({
                frontChapterContent: _frontChapterContent,
                frontChapterTitle: _frontChapterTitle,
                
                afterChapterContent: "",
                afterChapterTitle: "",
            })

            // 进行滚动
            wx.pageScrollTo({
                scrollTop: 99999,
                duration: 0,
                // offsetTop: -999999999,
                success:()=>{
                    // console.info("滚动成功", rect.top)
                    // console.log("aaab",scrollTop, _scrollTop)
                    console.log("滚动成功",scrollTop)
                    this.setData({
                        afterChapterContent: _afterChapterContent,
                        afterChapterTitle: _afterChapterTitle,
                    })
                },
                fail:()=>{
                    // console.info("滚动失败", rect.top)
                    // console.log("aaab",scrollTop, _scrollTop)
                }
            })

            // wx.createSelectorQuery().select('#afterChapter').boundingClientRect(rect => {
            //     // rect.id      // 节点的ID
            //     // rect.dataset // 节点的dataset
            //     // rect.left    // 节点的左边界坐标
            //     // rect.right   // 节点的右边界坐标
            //     // rect.top     // 节点的上边界坐标
            //     // rect.bottom  // 节点的下边界坐标
            //     // rect.width   // 节点的宽度
            //     // rect.height  // 节点的高度
            //     console.log("查询完毕准备滚动", rect)
            //     wx.pageScrollTo({
            //         scrollTop: rect.height,
            //         duration: 0,
            //         offsetTop: -rect.height,
            //         success:()=>{
            //             console.info("滚动成功", rect.top)
            //             console.log("aaab",scrollTop, _scrollTop)
            //         },
            //         fail:()=>{
            //             console.info("滚动失败", rect.top)
            //         }
            //     })
            // }).exec()

            // 尝试缓存下一章
            this.cacheNextChapter()


        } else if (nextChapterData.url !== null) {
            // 进行缓冲下一个章节
            console.info("进行缓冲下一个章节")
            wx.cloud.callFunction({
                // 云函数名称
                name: 'reptile',
                // 传给云函数的参数
                data: {
                    "type": "get_chapter_content",
                    "arg": chapterDataCaches[currentChapterIndex + 1].url
                },
                success: res => {
                    console.log("下一章节数据缓存成功", res)

                    chapterDataCaches[currentChapterIndex + 1] = {
                        url: chapterDataCaches[currentChapterIndex + 1].url,
                        content: res.result.chapterContent,
                        title: res.result.chapterTitle,
                    }

                    chapterDataCaches.push({
                        url: res.result.nextChapterUrl,
                        content: null,
                        title: null
                    })

                    console.info("缓存完毕, 进行加载")

                    let _afterChapterContent = chapterDataCaches[currentChapterIndex + 1].content
                    let _afterChapterTitle = chapterDataCaches[currentChapterIndex + 1].title

                    let _currentChapterContent = chapterDataCaches[currentChapterIndex].content
                    let _currentChapterTitle = chapterDataCaches[currentChapterIndex].title

                    currentChapterIndex += 1


                    // 完成数据迭代, 更新页面
                    this.setData({
                        afterChapterContent: _afterChapterContent,
                        afterChapterTitle: _afterChapterTitle,
                        currentChapterContent: _currentChapterContent,
                        currentChapterTitle: _currentChapterTitle
                    })

                    // 进行滚动

                    query.select('#afterChapter').boundingClientRect(rect => {
                        // rect.id      // 节点的ID
                        // rect.dataset // 节点的dataset
                        // rect.left    // 节点的左边界坐标
                        // rect.right   // 节点的右边界坐标
                        // rect.top     // 节点的上边界坐标
                        // rect.bottom  // 节点的下边界坐标
                        // rect.width   // 节点的宽度
                        // rect.height  // 节点的高度
                        wx.pageScrollTo({
                            scrollTop: rect.top,
                            duration: 0,
                            offsetTop: -150,
                        })
                    }).exec()

                    // 尝试缓存下一章
                    this.cacheNextChapter()

                },
                fail: err => {
                    console.error(err)
                }
            })



        } else {
            console.info("啥也没有咋可能")
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})