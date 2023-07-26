// pages/horizontal/horizontal.js

let screenWidth = 0; // 页面宽度
let pageTotalNum = 0; // 页面总页数

let currentChapterUrl = null
let currentChapterTitle = null
let currentChapterContent = null

let currentNovelUrl = null
let currentNovelTitle = null
let currentNovelIndex = null // 这是在用户novel_list中的index
let currentNovelChapterList = null

let chapterDataCaches = [] // 章节数据缓存
let currentChapterIndex = 0 // 当前章节索引

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        sample_menu_visible: false, // 底部简单菜单面板显隐
        entire_menu_visible: false, // 底部全部菜单面板显隐
        status_bar_height: 0, // 标题栏高
        pageHeight: 0, // 页面高
        turnPageWidth: 0, // 翻页时一页需要偏移的宽度
        pageIndex: 1, // 当前页面索引
        hasTransition: true, // 是否有翻页动画
        read_config: { // 阅读配置
            background_color: "#f4ecd1", // 背景颜色
            dark: false, // 日间, 夜间模式
            font_size: 20, // 字号
            font_family: "", // 字体
            flip_mode: "scroll", // 阅读翻页模式
            line_height_rate: "1.5", // 行间距比率
        },
        currentBgColorIndex: 2, // 当前背景颜色索引
        // 可选背景色列表
        background_color_list: ["#e0e0e0",
            "#f5f1e8",
            "#f4ecd1",
            "#daf2da",
            "#dceaee",
            "#ffffff",
            "#faf9de",
            "#fff2e2",
            "#fde6e0",
            "#e3edcd",
            "#dce2f1",
            "#e9ebfe",
            "#eaeaef",
            "#ccffcc",
            "#c7decc",
            "#ebebe4"
        ],
        chapterContent: "", // 章节内容
        chapterTitle: "", // 章节名称
        novelTitle: "" // 当前小说书名
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let novel_url = options.url
        var self = this

        wx.showLoading({
            title: '加载中',
        })

        wx.getSystemInfoAsync({
            success(res) {
                screenWidth = res.screenWidth
                console.log("设备像素比", res.pixelRatio)
                let turnPageWidth = res.screenWidth
                let pageHeight = res.screenHeight - res.statusBarHeight

                self.setData({
                    status_bar_height: res.statusBarHeight,
                    pageHeight: pageHeight,
                    turnPageWidth: turnPageWidth,
                })

            }
        })

        // 遍历小说列表的到其具体信息
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

        // 请求获取小说章节列表
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

        // 请求当前阅读章节数据
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

                console.log("设置内容", chapterDataCaches)
                self.setData({
                    read_config: app.globalData.userData.read_config,
                    chapterContent: chapterDataCaches[currentChapterIndex].content,
                    chapterTitle: chapterDataCaches[currentChapterIndex].title,
                    novelTitle: currentNovelTitle
                }, () => {
                    self.computePageTotalNum()
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
    onOperateClicked: function (data) {
        /* 操作层事件处理回调 */

        let x = data.detail.x // 屏幕点击点的横坐标
        // 点击中间
        if (screenWidth * 0.3 < x & x < screenWidth * 0.7) {
            this.setData({
                sample_menu_visible: true
            })
        }
        // 点击左侧
        if (x < screenWidth * 0.3) {
            console.info("点击左侧")
            this.turnPage(-1)
        }
        // 点击右侧
        if (x > screenWidth * 0.7) {
            console.info("点击右侧")
            this.turnPage(1)
        }
    },
    onSampleMenuVisibleChange(e) {
        this.setData({
            sample_menu_visible: e.detail.visible,
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
        let self = this
        if (14 <= current & current <= 25) {
            let current_config = this.data.read_config
            current_config.font_size = current
            this.setData({
                    read_config: current_config
                },
                () => {
                    self.computePageTotalNum() // 更改字体后页面布局改变,重新计算页数
                }
            )
        }
    },
    onFontSizeIncrease() {
        let current = this.data.read_config.font_size + 1
        let self = this
        if (14 <= current & current <= 25) {
            let current_config = this.data.read_config
            current_config.font_size = current
            this.setData({
                    read_config: current_config
                },
                () => {
                    self.computePageTotalNum() // 更改字体后页面布局改变,重新计算页数
                }
            )
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
        app.updataReadConfig()
    },
    onSettingButtonClick() {
        this.setData({
            entire_menu_visible: true
        })
    },
    onEntireMenuVisibleChange(e) {
        this.setData({
            entire_menu_visible: e.detail.visible,
        });
    },
    onLineHeightChange(data) {
        let mode = data.target.dataset.mode
        let read_config_ = this.data.read_config
        if (mode === "center") {
            read_config_.line_height_rate = 1.5
        } else if (mode === "wide") {
            read_config_.line_height_rate = 2
        } else if (mode === "narrow") {
            read_config_.line_height_rate = 1
        }
        this.setData({
            read_config: read_config_
        }, () => {
            app.updataReadConfig() // 同步云端用户数据
        })
    },
    onDarkChange() {
        let read_config_ = this.data.read_config
        read_config_.dark = !read_config_.dark
        this.setData({
            read_config: read_config_
        }, () => {
            app.updataReadConfig() // 同步云端用户数据
        })
    },
    computePageTotalNum() {
        // 计算章节内容总页数
        wx.createSelectorQuery().select('#content').boundingClientRect(rect => {
            console.info(rect.width, screenWidth)
            pageTotalNum = Math.ceil(rect.width / screenWidth);
            console.log(pageTotalNum)
        }).exec()
    },
    turnPage(direction) {
        /* 
            翻页 
            direction: 方向, 正为下一页, 负为上一页
        */
        if (direction > 0) { // 下一页
            console.info("pageIndex:", this.data.pageIndex, "pageTotalNum:", pageTotalNum)
            if (this.data.pageIndex < pageTotalNum) { // 判断本章是否还有下一页
                console.info("翻到下一页")
                this.setData({ // 翻到下一页
                    pageIndex: this.data.pageIndex + 1
                })
            } else {
                console.info("切换到下一章")
                this.loadNextChapter()
            }

        } else if (direction < 0) {
            if (this.data.pageIndex > 1) { // 判断是否有上一页
                this.setData({ // 切换上一页
                    pageIndex: this.data.pageIndex - 1
                })
            } else {
                // 切换到上一章节
                console.info("切换到上一章")
                this.loadLastChapter()
            }
        }
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
    loadNextChapter() {
        // 判断下一章节的内容是否为空
        let nextChapterData = chapterDataCaches[currentChapterIndex + 1]

        if (nextChapterData.content !== null) {
            console.info("存在下一章缓存, 进行加载")

            let chapterContent = chapterDataCaches[currentChapterIndex + 1].content
            let chapterTitle = chapterDataCaches[currentChapterIndex + 1].title

            // 更新页面
            currentChapterIndex += 1

            /* 脑残逻辑
                1. 取消翻页动画
                2. 将页面平移到0页
                3. 恢复翻页动画
                4. 将页面从0翻到1
             目的:
                在更换章节时能像切换页面那样有流畅的翻页动画过渡效果
                实际效果很是炸裂, 应该找俩个容器更换来达到效果
            */

            // 先取消翻页动画再进行加载
            this.setData({
                hasTransition: false,
            }, () => {
                console.log(this.data.hasTransition)
                this.setData({
                    pageIndex: 0,
                    chapterContent: chapterContent,
                    chapterTitle: chapterTitle
                }, () => {
                    // 恢复翻页动画
                    this.setData({
                        hasTransition: true,
                    }, () => {
                        this.setData({
                            pageIndex: 1,
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        })
                    })
                })
            })

            // 重新计算总页数
            this.computePageTotalNum()

            // 尝试缓存下一章
            this.cacheNextChapter()


        } else if (nextChapterData.url !== null) {
            // 进行缓冲下一个章节
            console.info("缓冲下一个章节")
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

                    let chapterContent = chapterDataCaches[currentChapterIndex + 1].content
                    let chapterTitle = chapterDataCaches[currentChapterIndex + 1].title

                    // 更新页面
                    currentChapterIndex += 1

                    // 先取消翻页动画再进行加载
                    this.setData({
                        hasTransition: false,
                    }, () => {
                        console.log(this.data.hasTransition)
                        this.setData({
                            pageIndex: 0,
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        }, () => {
                            // 恢复翻页动画
                            this.setData({
                                hasTransition: true,
                            }, () => {
                                this.setData({
                                    pageIndex: 1,
                                    chapterContent: chapterContent,
                                    chapterTitle: chapterTitle
                                })
                            })
                        })
                    })

                    // 重新计算总页数
                    this.computePageTotalNum()

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
    loadLastChapter() {
        let nextChapterData = chapterDataCaches[currentChapterIndex - 1]

        if (nextChapterData.content !== null) {
            console.info("存在下一章缓存, 进行加载")

            let chapterContent = chapterDataCaches[currentChapterIndex - 1].content
            let chapterTitle = chapterDataCaches[currentChapterIndex - 1].title

            // 更新页面
            currentChapterIndex -= 1

            /* 脑残逻辑
                1. 取消翻页动画
                2. 将页面平移到0页
                3. 恢复翻页动画
                4. 将页面从0翻到1
             目的:
                在更换章节时能像切换页面那样有流畅的翻页动画过渡效果
                实际效果很是炸裂, 应该找俩个容器更换来达到效果
            */

            // 先取消翻页动画再进行加载
            this.setData({
                hasTransition: false,
            }, () => {
                this.setData({
                    chapterContent: chapterContent,
                    chapterTitle: chapterTitle
                }, () => {

                    // 计算页面数
                    this.computePageTotalNum()

                    // 恢复翻页动画
                    this.setData({
                        pageIndex: pageTotalNum + 1,  // 翻到章节中的最后一页的后一页
                    }, () => {
                        this.setData({
                            hasTransition: true,
                            pageIndex: pageTotalNum,
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        })
                    })
                })
            })


        } else if (nextChapterData.url !== null) {
            // 进行缓冲上一个章节
            console.info("缓冲上一个章节")
            wx.cloud.callFunction({
                // 云函数名称
                name: 'reptile',
                // 传给云函数的参数
                data: {
                    "type": "get_chapter_content",
                    "arg": chapterDataCaches[currentChapterIndex - 1].url
                },
                success: res => {
                    console.log("上一章节数据缓存成功", res)

                    chapterDataCaches[currentChapterIndex - 1] = {
                        url: chapterDataCaches[currentChapterIndex - 1].url,
                        content: res.result.chapterContent,
                        title: res.result.chapterTitle,
                    }

                    // 缓存区添加下一个
                    chapterDataCaches.push({
                        url: res.result.nextChapterUrl,
                        content: null,
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

                    console.info("缓存完毕, 进行加载")

                    let chapterContent = chapterDataCaches[currentChapterIndex - 1].content
                    let chapterTitle = chapterDataCaches[currentChapterIndex - 1].title

                    // 更新页面
                    currentChapterIndex -= 1

                    // 先取消翻页动画再进行加载
                    this.setData({
                        hasTransition: false,
                    }, () => {
                        console.log(this.data.hasTransition)
                        this.setData({
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        }, () => {
                            // 重新计算总页数
                            this.computePageTotalNum()

                            // 恢复翻页动画
                            this.setData({
                                hasTransition: true,
                            }, () => {
                                this.setData({
                                    pageIndex: pageTotalNum,
                                    chapterContent: chapterContent,
                                    chapterTitle: chapterTitle
                                })
                            })
                        })
                    })

                },
                fail: err => {
                    console.error(err)
                }
            })



        } else {
            console.info("啥也没有咋可能")
        }
    }
})