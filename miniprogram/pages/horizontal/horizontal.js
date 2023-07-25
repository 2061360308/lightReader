// pages/horizontal/horizontal.js
const chapterContent = `兽皮书一尺见方，呈现银色光泽，在上面密密麻麻能有数百个字符，不是以笔墨书写，而是以刀刻上去的。

王煊用手抚过，纹络清晰，触感明显，刀功极为精湛，每个字符都有种意境，充满了美感。

然而，所有字符全他都不认识！

这是什么鬼画符？笔画繁多，复杂无比，他想向钟鼎文靠拢去联想，发现没有相似之处。

他左看右看，这也不是甲骨文，到底是什么时代的文字，他居然一个字都不认识。

王煊运用速记法，双目盯着这数百字符，当成照片般，努力烙印进脑海中。

现在不认识不要紧，回头去查，找人去破译，总能解决，最为关键的是要牢牢默记在心中。

这次行动为了保密，所有人都不允许带能与外界联系的手机等，不然的话王煊可以直接拍照。

虽然他身上有纽扣大的微型扫描器，但这是探险组织给予的，最后恐怕要上交。

王煊默记，觉得难度颇大，数百个复杂的字符都不认识，只能当天书般死记硬背。

还好，这些年来他已锻炼出来，他练旧术当中的根法时，就是需要存想各种复杂的景物，不能有半点疏漏。

他现在将整张银色兽皮书当成一幅复杂的画卷，摹刻在心底，不断存想。

王煊确信，没有问题了，全部记在脑中。

但最终他还是将微型扫描器开启，从不同方位扫描这些文字，他怕角度不同，另藏玄机。

“即便需要上交，也希望青木允许我备份。”

王煊没有想着独占，一是他觉得，这是所有人共同付出所得。

二是他认为，吃独食没好下场，他身上既然有扫描器，说不定早已自动开启，记录下这次行动的所有过程。

这世间妙法不少，好东西太多了，财阀挖遍旧土各地，连金色竹简那种奇物都曾得到，但也没听说谁能练成什么。

关键还是要看人，最后看谁能悟出，最后真正练成它记载的东西才是根本。

王煊严重怀疑，这篇经卷短时间估计没人能练成，甚至根本无人能解析出其精华奥义。

毕竟，连那个身穿羽衣、被认为是方士中绝顶强者的人物，至死都在看此兽皮卷，他那么强大，都还在研读，足以说明问题。

接着，他将玉函取出。

所谓玉函就是个玉石盒子，大部分洁白温润，是块美玉，只在其中一侧有斑斑点点的血沁，是件古物。

在当中竟是几片金箔，被钉在一起，像是几页金色纸张组成一本薄薄的金书。

王煊看了下，只有五页，每一页金箔上都有些人形图案，没有文字注释，那些图很连贯，记述的已经足够细致。

他确信，这是一门体术，看样子很深奥，涉及到了催动五脏六腑的繁复动作，应该很不简单。

他再次开始默记，总的来说，这些熟悉的人形图远比银色兽皮卷山的字符好记多了。

最后，他又用扫描器将金书整体扫描，全部记录。

他知道，兽皮卷不见得能悟出什么，最起码短时间不指望，那是顶尖方士才能研究的东西。

或许，这金书当下对他的价值更高过兽皮卷。

王煊找了个隐蔽的位置，背靠石壁，手持能量枪，然后再次仔细观看金书、银卷。

时间悄然流逝，青木、黑虎等人还没有回来，显然那地下通道地形复杂，被前人挖的如同蛛网般，他们追敌不顺。

不知道过了多久，王煊突然不寒而栗，他想都没有想，抬手就以能量枪横扫，刺目的光束打的乱石崩碎，四处飞溅。

一道身影像是虎豹般敏捷与凶猛，动作飞快，几个闪避，竟躲开能量枪交织的光束，又如苍鹰般一跃，到了一块岩石的后方，隐去形体。

王煊无比严肃，那绝对是一位大高手！
`

// let pageIndex = 1;  // 页面序号
// let turnPageWidth = 0;  // 翻页宽度
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
        hasTransition: true,  // 是否有翻页动画
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
        chapterTitle: "第一章 我好棒啊,真不错呢哈哈哈哈天噜啦", // 章节名称
        novelTitle: "测试小说标题" // 当前小说书名
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
                },() => {
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
        })
    },
    onDarkChange() {
        let read_config_ = this.data.read_config
        read_config_.dark = !read_config_.dark
        this.setData({
            read_config: read_config_
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
        console.info("你打了夜阑的狗一巴掌，完了你，现在就摇人")
        // 判断下一章节的内容是否为空
        let nextChapterData = chapterDataCaches[currentChapterIndex + 1]

        if (nextChapterData.content !== null) {
            console.info("存在下一章缓存, 进行加载")

            let chapterContent = chapterDataCaches[currentChapterIndex + 1].content
            let chapterTitle = chapterDataCaches[currentChapterIndex + 1].title

            // 更新页面
            currentChapterIndex += 1

            // 先取消翻页动画再进行加载
            this.setData({
                hasTransition: false,
            }, ()=>{
                console.log(this.data.hasTransition)
                this.setData({
                    pageIndex: 1,
                    chapterContent: chapterContent,
                    chapterTitle: chapterTitle
                },()=>{
                    // 恢复翻页动画
                    this.setData({
                        hasTransition: true,
                    })
                })
            })

            // 重新计算总页数
            this.computePageTotalNum()

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

                    let chapterContent = chapterDataCaches[currentChapterIndex + 1].content
                    let chapterTitle = chapterDataCaches[currentChapterIndex + 1].title

                    // 更新页面
                    currentChapterIndex += 1

                    // 先取消翻页动画再进行加载
                    this.setData({
                        hasTransition: false,
                    }, ()=>{
                        console.log(this.data.hasTransition)
                        this.setData({
                            pageIndex: 1,
                            chapterContent: chapterContent,
                            chapterTitle: chapterTitle
                        },()=>{
                            // 恢复翻页动画
                            this.setData({
                                hasTransition: true,
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
})