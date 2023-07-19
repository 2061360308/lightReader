// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
cloud.init({
    env: 'cloud1-5gn2xxba0286dda1'
}) // 使用当前云环境

const search_url = 'http://www.biquge5200.cc/modules/article/search.php?searchkey='
const webSiteUrl = 'http://www.biquge5200.cc'

async function request(url) {
    // 这是一个异步事件, 所以我必须返回一个promise对象, 以便后续调用时可以正常获取到返回值
    // 返回 Promise 对象
    // 箭头函数的this指向调用者
    let result = await axios
        .get(url, {
            responseType: 'arraybuffer',
            transformResponse: [
                function (data) {
                    return iconv.decode(data, 'gbk')
                },
            ],
        })

    return result.data
}

async function get_novel_list(keyword) {
    html = await request(search_url + encodeURI(keyword))

    console.log("得到网页内容", html)

    const $ = cheerio.load(html)

    console.log("cheerio load", $)

    let book_name_list = [];
    let book_url_list = [];
    let author_name_list = [];
    // 获取书名和url
    $('tr td[class=odd] a').each((index, item) => {
        book_name_list.push(item.children[0].data)
        book_url_list.push(this.target_url + item.attribs["href"])
    })
    // 获取作者名
    $('tr').each((index, item) => {
        // 排除第一个表头
        if (index !== 0) {
            author_name_list.push($($(item).find('td').eq(2)).text())
        }
    })

    //分装合并为对象
    let novel_list = []
    book_name_list.forEach((item, index) => {
        novel_list.push({
            authorName: author_name_list[index],
            bookName: item,
            bookUrl: book_url_list[index],
        })
    })
    return novel_list;
}

async function get_novel_intro(novelUrl) {
    html = await request(novelUrl)
    console.log("得到网页内容", html)
    const $ = cheerio.load(html)
    console.log("cheerio load", $)

    let author_name = $($('div[id=info] p').eq(0)).text().slice(7) // 作者名
    let book_name = $($('div[id=info] h1').eq(0)).text() // 书名
    let last_update_time = $($('div[id=info] p').eq(2)).text().slice(5) // 最后更新时间
    let last_update_name = $($('dl dd a').eq(0)).text() // 最新的章节
    let book_intro = $($('div[id=intro] p').eq(0)).text() // 小说简介
    let book_cover_url = $('div[id=fmimg] img').attr("src") // 小说封面地址
    let first_chapter_url = this.target_url + $($('div[id=list] dd').eq(9).html()).attr('href') // 第一章地址
    let classify_name = $($('div[class=con_top] a').eq(2)).text() // 分类名称

    // console.log("author_name",author_name)

    let novel_intro = {
        authorName: author_name,
        bookName: book_name,
        lastUpdateTime: last_update_time,
        lastUpdateName: last_update_name,
        bookIntro: book_intro,
        bookCoverUrl: book_cover_url,
        firstChapterUrl: first_chapter_url,
        classifyName: classify_name,
    }

    return novel_intro
}

async function get_chapter_list(novelUrl) {
    html = await request(novelUrl)
    console.log("得到网页内容", html)
    const $ = cheerio.load(html)
    console.log("cheerio load", $)

    let chapter_list = []
    $('div[id=list] dl dd a').each((index, item) => {
        if (index >= 9) {
            chapter_list.push({
                'chapterName': $(item).text(),
                'chapterUrl': webSiteUrl + $(item).attr('href')
            })
        }
    })
    return chapter_list
}

// 获取章节内容
async function get_chapter_content(chapter_url) {

    html = await request(chapter_url)
    console.log("得到网页内容", html)
    const $ = cheerio.load(html)
    console.log("cheerio load", $)


    let chapter_title = $('div[class=bookname] h1').text() //章节标题
    let chapter_content = $('div[id=content]').html() //章节内容
    let prev_chapter_url = this.target_url + $('a:contains(上一章)').attr('href') // 上一章节url地址
    let next_chapter_url = this.target_url + $('a:contains(下一章)').attr('href') // 上一章节url地址

    // 判断上一章和下一章是否存在
    if (!prev_chapter_url.endsWith(".html")) {
        prev_chapter_url = null
    }

    if (!next_chapter_url.endsWith(".html")) {
        next_chapter_url = null
    }

    //  针对小程序的text标签转换章节内容

    chapter_content = chapter_content.replaceAll('<p>', '')
    chapter_content = chapter_content.replaceAll('</p>', '\n\n')
    chapter_content = chapter_content.replaceAll(' ', '')
    chapter_content = chapter_content.replaceAll('&nbsp;', ' ')

    return {
        'chapterTitle': chapter_title,
        'chapterContent': chapter_content,
        'prevChapterUrl': prev_chapter_url,
        'nextChapterUrl': next_chapter_url
    }
}

// 返回输入参数
exports.main = async (event) => {
    /*
    接受参数
    data={
        "path": 查询路径 
        "arg": 查询参数
    }
    */

    if (event.type === "get_novel_list") {
        return get_novel_list(event.arg)
    } else if (event.type === "get_novel_intro") {
        return get_novel_intro(event.arg)
    } else if (event.type === "get_chapter_list") {
        return get_chapter_list(event.arg)
    } else if (event.type === "get_chapter_content") {
        return get_chapter_content(event.arg)
    }
}