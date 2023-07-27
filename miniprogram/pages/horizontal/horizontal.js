// pages/horizontal/horizontal.js

let screenWidth = 0; // 页面宽度
let pageTotalNum = 0; // 页面总页数

let currentChapterUrl = null
let currentChapterTitle = null
let currentChapterContent = null

let currentNovelUrl = null
let currentNovelTitle = null
let currentNovelIndex = null // 这是在用户novel_list中的index
let currentNovelChapterList = []

let chapterDataCaches = [] // 章节数据缓存
let currentChapterIndex = 0 // 当前章节索引

let slipFlag = false // 滑动事件限制标识
//记录触摸点的坐标信息
let startPoint = 0 // 开始触摸的点

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        sample_menu_visible: false, // 底部简单菜单面板显隐
        entire_menu_visible: false, // 底部全部菜单面板显隐
        catalog_visible: false, // 左侧目录面板显隐
        status_bar_height: 0, // 标题栏高
        pageHeight: 0, // 页面高
        turnPageWidth: 0, // 翻页时一页需要偏移的宽度
        pageIndex: 1, // 当前页面索引
        pageTotalNum: 1, // 总页数
        hasTransition: true, // 是否有翻页动画
        read_config: { // 阅读配置
            background_color: "#f4ecd1", // 背景颜色
            dark: false, // 日间, 夜间模式
            font_size: 20, // 字号
            font_family: "", // 字体
            flip_mode: "scroll", // 阅读翻页模式
            line_height_rate: "1.5", // 行间距比率
            catalog_reverse_order: false, // 目录倒序
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
        currentNovelChapterList: [], // 当前小说章节列表
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
                console.info("设备像素比", res.pixelRatio)
                let turnPageWidth = res.screenWidth
                let pageHeight = res.screenHeight - res.statusBarHeight - 30

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
                currentNovelChapterList = res.result

                self.setData({
                    currentNovelChapterList: currentNovelChapterList
                })
                console.info("currentNovelChapterList", currentNovelChapterList)
            },
            fail: err => {
                console.error("出错来了:", err)
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
                console.info("章节数据", res)

                chapterDataCaches[currentChapterIndex].title = res.result.chapterTitle.trim()
                chapterDataCaches[currentChapterIndex].content = res.result.chapterContent

                // 缓存区添加下一个

                // 校验下一章链接
                let nextUrl = res.result.nextChapterUrl
                if (nextUrl === null) {
                    nextUrl = this.completeNextUrl(chapterDataCaches[currentChapterIndex].url)
                }

                chapterDataCaches.push({
                    content: null,
                    url: nextUrl,
                    title: null
                })

                // 缓存区添加上一个

                // 校验上一章链接
                let lastUrl = res.result.prevChapterUrl
                if (lastUrl === null) {
                    lastUrl = this.completeLastUrl(chapterDataCaches[currentChapterIndex].url)
                }

                chapterDataCaches.unshift({
                    content: null,
                    url: lastUrl,
                    title: null
                })

                // 前面加一, 当前index需要递增
                currentChapterIndex += 1


                console.info("设置内容", chapterDataCaches)
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
    onOperateClicked(data) {
        /* 操作层事件处理回调 */

        // 触发点击事件, 取消滑动事件
        slipFlag = false

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
    onOperateTouchStart(e) {
        //开启滑动事件
        slipFlag = true
        //记录触摸点的坐标信息
        startPoint = e.touches[0]
    },
    onOperateTouchMove(e) {
        // ----------------监听手势左右滑事件----------------
        if (((startPoint.clientX - e.touches[e.touches.length - 1].clientX) > 80) && slipFlag) {
            console.info("左滑事件");
            slipFlag = false
            this.turnPage(1) // 下一页
            return
        } else if (((startPoint.clientX - e.touches[e.touches.length - 1].clientX) < -80) && slipFlag) {
            console.info("右滑事件");
            slipFlag = false
            this.turnPage(-1) // 上一页
            return
        }
        // ----------------监听手势左右滑事件end----------------
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
            app.updateReadConfig() // 同步云端用户数据
        })
    },
    onDarkChange() {
        let read_config_ = this.data.read_config
        read_config_.dark = !read_config_.dark
        this.setData({
            read_config: read_config_
        }, () => {
            app.updateReadConfig() // 同步云端用户数据
        })
    },
    onTurnLastChapter() {
        this.loadLastChapter(false)
    },
    onTurnNextChapter() {
        this.loadNextChapter()
    },
    onCatalogShow() {
        this.setData({
            catalog_visible: true,
            sample_menu_visible: false
        }, () => {
            // 滚动到当前章节
            wx.createSelectorQuery().select('#currentChapter').boundingClientRect(rect => {
                // rect.id      // 节点的ID 
                // rect.dataset // 节点的dataset 
                // rect.left    // 节点的左边界坐标 
                // rect.right   // 节点的右边界坐标 
                // rect.top     // 节点的上边界坐标 
                // rect.bottom  // 节点的下边界坐标 
                // rect.width   // 节点的宽度 
                // rect.height  // 节点的高度 
                console.log("查询完毕准备滚动", rect)
                wx.pageScrollTo({
                    // selector: "#currentChapter",
                    scrollTop: rect.top,
                    duration: 300,
                    success: () => {
                        console.info("滚动成功", rect.top)
                    },
                    fail: () => {
                        console.info("滚动失败", rect.top)
                    }
                })
            }).exec()
            // wx.pageScrollTo({
            //     selector: "#currentChapter",
            //     duration: 300,
            //     success: (data) => {
            //         console.info("滚动成功", data)
            //     },
            //     fail: (data) => {
            //         console.info("滚动失败",data)
            //     }
            // })
        })
    },
    onCatalogVisibleChange(e) {
        this.setData({
            catalog_visible: e.detail.visible,
        });
    },
    onCatalogClose() {
        this.setData({
            catalog_visible: false,
        });
    },
    onTurnChapter(data) {
        let self = this
        let name = data.target.dataset.name
        let url = data.target.dataset.url

        // 清空所有缓存数据重新开始加载
        chapterDataCaches = [] // 章节数据缓存
        currentChapterIndex = 0 // 当前章节索引

        chapterDataCaches.push({
            url: url,
            title: name,
            content: null,
        })

        wx.showLoading({
            title: '加载中',
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
                console.info("章节数据", res)

                chapterDataCaches[currentChapterIndex].title = res.result.chapterTitle.trim()
                chapterDataCaches[currentChapterIndex].content = res.result.chapterContent

                // 缓存区添加下一个

                // 校验下一章链接
                let nextUrl = res.result.nextChapterUrl
                if (nextUrl === null) {
                    nextUrl = this.completeNextUrl(chapterDataCaches[currentChapterIndex].url)
                }

                chapterDataCaches.push({
                    content: null,
                    url: nextUrl,
                    title: null
                })

                // 缓存区添加上一个

                // 校验上一章链接
                let lastUrl = res.result.prevChapterUrl
                if (lastUrl === null) {
                    lastUrl = this.completeLastUrl(chapterDataCaches[currentChapterIndex].url)
                }

                chapterDataCaches.unshift({
                    content: null,
                    url: lastUrl,
                    title: null
                })

                // 前面加一, 当前index需要递增
                currentChapterIndex += 1


                console.info("设置内容", chapterDataCaches)
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
                // 同步云端进度
                // 更新云端阅读进度
                app.globalData.userData.novel_list[currentNovelIndex].progress.name = name
                app.globalData.userData.novel_list[currentNovelIndex].progress.url = url

                app.updateUserNovelList()

                // 隐藏目录面板
                this.setData({
                    catalog_visible: false
                })


            },
            fail: err => {
                console.error(err)
            }
        })
    },
    onCatalogReverseOrderChange(){
        let read_config_ = this.data.read_config
        let currentNovelChapterList_ = currentNovelChapterList.reverse()
        read_config_.catalog_reverse_order = ! read_config_.catalog_reverse_order
        
        wx.showLoading({
          title: '加载中',
        })
        this.setData({
            read_config: read_config_,
            currentNovelChapterList : currentNovelChapterList_
        },()=>{
            wx.hideLoading()
        })
    },
    computePageTotalNum() {
        // 计算章节内容总页数
        wx.createSelectorQuery().select('#content').boundingClientRect(rect => {
            console.info(rect.width, screenWidth)
            pageTotalNum = Math.ceil(rect.width / screenWidth);
            /* pageTotalNum最主要还是在js中使用最多, 在页面中仅有一处显示需要, 所以增加了全局变量pageTotalNum
               方便使用,不然每次更新值都是异步的很麻烦 */
            this.setData({
                pageTotalNum: pageTotalNum
            })
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
    cacheNextChapter(successFun) {
        /**
         * 缓存下一章节
         */
        let self = this
        let nextChapterData = chapterDataCaches[currentChapterIndex + 1]
        console.info("准备缓存下一章", nextChapterData)

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
                    console.info("下一章节数据缓存成功", res)

                    chapterDataCaches[currentChapterIndex + 1] = {
                        url: chapterDataCaches[currentChapterIndex + 1].url,
                        content: res.result.chapterContent,
                        title: res.result.chapterTitle,
                    }

                    // 缓存区添加下一个

                    // 校验下一章链接
                    let nextUrl = res.result.nextChapterUrl
                    if (nextUrl === null) {
                        nextUrl = self.completNextUrl(chapterDataCaches[currentChapterIndex].url)
                    }

                    chapterDataCaches.push({
                        url: nextUrl,
                        content: null,
                        title: null
                    })

                    // 不需要添加上一个

                    // 判断成功回调函数是否存在
                    if (successFun) {
                        successFun() // 执行回调
                    }

                },
                fail: err => {
                    console.error(err)
                }
            })
        }

    },
    cacheLastChapter(successFun, last_page) {
        /**
         * 缓存上一章节
         */

        let self = this
        let lastChapterData = chapterDataCaches[currentChapterIndex - 1]
        console.info("准备缓存上一章", lastChapterData)

        if (lastChapterData.url !== null) {
            // 进行缓冲下一个章节
            console.info("进行缓冲下一个章节")

            wx.cloud.callFunction({
                // 云函数名称
                name: 'reptile',
                // 传给云函数的参数
                data: {
                    "type": "get_chapter_content",
                    "arg": chapterDataCaches[currentChapterIndex - 1].url
                },
                success: res => {
                    console.info("上一章节数据缓存成功", res)

                    chapterDataCaches[currentChapterIndex - 1] = {
                        url: chapterDataCaches[currentChapterIndex - 1].url,
                        content: res.result.chapterContent,
                        title: res.result.chapterTitle,
                    }

                    // 缓存区添加上一个

                    // 校验上一章链接
                    let lastUrl = res.result.prevChapterUrl
                    if (lastUrl === null) {
                        lastUrl = self.completeLastUrl(chapterDataCaches[currentChapterIndex].url)
                    }

                    chapterDataCaches.unshift({
                        content: null,
                        url: lastUrl,
                        title: null
                    })

                    // 前面加一, 当前index需要递增
                    currentChapterIndex += 1

                    // 不需要添加下一个

                    if (successFun) {
                        successFun(last_page)
                    }

                },
                fail: err => {
                    console.error(err)
                }
            })
        }
    },
    loadNextChapter() {
        let self = this

        function update_page() {
            // 更新页面
            let chapterContent = chapterDataCaches[currentChapterIndex + 1].content
            let chapterTitle = chapterDataCaches[currentChapterIndex + 1].title
            let chapterUrl = chapterDataCaches[currentChapterIndex + 1].url

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
            self.setData({
                hasTransition: false,
            }, () => {
                self.setData({
                    pageIndex: 0,
                    chapterContent: chapterContent,
                    chapterTitle: chapterTitle
                }, () => {
                    // 恢复翻页动画
                    self.setData({
                        hasTransition: true,
                    }, () => {
                        self.setData({
                            pageIndex: 1,
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        })
                    })
                })
            })

            // 更新云端阅读进度
            app.globalData.userData.novel_list[currentNovelIndex].progress.name = chapterTitle
            app.globalData.userData.novel_list[currentNovelIndex].progress.url = chapterUrl

            app.updateUserNovelList()

            // 重新计算总页数
            self.computePageTotalNum()

            // 尝试缓存下一章
            self.cacheNextChapter()
        }

        // 判断下一章节的内容是否为空
        let nextChapterData = chapterDataCaches[currentChapterIndex + 1]

        if (nextChapterData.content !== null) {
            console.info("存在下一章缓存, 进行加载")
            update_page()
        } else if (nextChapterData.url !== null) {
            // 进行缓冲下一个章节
            console.info("缓冲下一个章节")
            this.cacheNextChapter(update_page)

        } else {
            console.info("啥也没有咋可能")
        }
    },
    loadLastChapter(last_page = true) {
        /**
         * last_page=true 默认翻到最后一页
         */

        let self = this

        function update_page(last_page) {
            let chapterContent = chapterDataCaches[currentChapterIndex - 1].content
            let chapterTitle = chapterDataCaches[currentChapterIndex - 1].title
            let chapterUrl = chapterDataCaches[currentChapterIndex - 1].url

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
            self.setData({
                hasTransition: false,
            }, () => {
                self.setData({
                    chapterContent: chapterContent,
                    chapterTitle: chapterTitle
                }, () => {

                    // 计算页面数
                    self.computePageTotalNum()

                    // 恢复翻页动画
                    self.setData({
                        pageIndex: pageTotalNum + 1, // 翻到章节中的最后一页的后一页
                    }, () => {
                        let target_num = pageTotalNum
                        if (!last_page) {
                            target_num = 1
                        }
                        self.setData({
                            hasTransition: true,
                            pageIndex: target_num,
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        })
                    })
                })
            })

            // 更新云端阅读进度
            app.globalData.userData.novel_list[currentNovelIndex].progress.name = chapterTitle
            app.globalData.userData.novel_list[currentNovelIndex].progress.url = chapterUrl

            app.updateUserNovelList()
        }

        let nextChapterData = chapterDataCaches[currentChapterIndex - 1]

        if (nextChapterData.content !== null) {
            console.info("存在上一章缓存, 进行加载")
            update_page(last_page)
        } else if (nextChapterData.url !== null) {
            // 进行缓冲上一个章节
            console.info("缓冲上一个章节")
            this.cacheLastChapter(update_page, last_page)
        } else {
            console.info("啥也没有咋可能")
        }
    },
    completeNextUrl(url) {
        /**
         * 从章节列表中尝试补全 给出章节的 下一章的链接
         */
        currentNovelChapterList.forEach((item, index) => {
            if (item.chapterUrl === url) {
                if (index + 1 < currentNovelChapterList.length) {
                    return currentNovelChapterList[index + 1].chapterUrl
                }
            }
        })

        return null
    },

    completeLastUrl(url) {
        /**
         * 从章节列表中尝试补全 给出章节的 上一章的链接
         */
        currentNovelChapterList.forEach((item, index) => {
            if (item.chapterUrl === url) {
                if (index > 0) {
                    return currentNovelChapterList[index - 1].chapterUrl
                }
            }
        })

        return null
    }
})