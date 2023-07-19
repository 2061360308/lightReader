const {requestUrl} = require('./adapter')


const app = getApp()

class Biquge5200 {
    siteInterface = {
        search: 'http://www.biquge5200.cc/modules/article/search.php?searchkey='
    }

    constructor(target_url = null) {
        // 没有给值, 使用默认值
        if (target_url === null) {
            target_url = 'http://www.b520.cc'
        }

        this.url_prefix = target_url;
        this.encoding = 'gbk'
        this.target_url = target_url
    }

    // 根据关键字查询
    get_novel_list(keyword) {
        const $ = requestUrl(this.siteInterface.search + keyword)

        console.log($.html())

        let book_name_list = [];  // 书名
        let book_url_list = [];  // 链接
        let author_name_list = [];  // 作者
        
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

    // 获取详细信息
    // get_novel_intro = new Pr
    async get_novel_intro(novelUrl) {

        return this.request(novelUrl, $ => {
            // author_name = soup.find_all('div', {'id': 'info'})[0].find("p").string.split('：')[1]  # 作者名
            let author_name = $($('div[id=info] p').eq(0)).text().slice(7) // 作者名
            // book_name = soup.find('div', {'id': 'info'}).h1.string  # 书名
            let book_name = $($('div[id=info] h1').eq(0)).text() // 书名
            // last_update_time = soup.find('div', {'id': 'info'}).find_all('p')[2].string.split('：')[1]  # 最后更新时间
            let last_update_time = $($('div[id=info] p').eq(2)).text().slice(5) // 最后更新时间
            // last_update_name = soup.find('dl').find_all('dd')[0].find_all('a')[0].string  # 最新的章节
            let last_update_name = $($('dl dd a').eq(0)).text() // 最新的章节
            // book_intro = soup.find('div', {'id': 'intro'}).find_all('p')[0].string  # 小说简介
            let book_intro = $($('div[id=intro] p').eq(0)).text() // 小说简介
            // book_cover_url = soup.find('div', {'id': 'fmimg'}).img.get('src')  # 小说封面地址
            let book_cover_url = $('div[id=fmimg] img').attr("src") // 小说封面地址
            // first_chapter_url = soup.find('div', {'id': 'list'}).find_all('dd')[0].a.get('href')  # 第一章地址
            let first_chapter_url = this.target_url + $($('div[id=list] dd').eq(9).html()).attr('href') // 第一章地址
            // classify_name = soup.find('div', {'class': 'con_top'}).find_all('a')[2].string  # 分类名称
            let classify_name = $($('div[class=con_top] a').eq(2)).text() // 分类名称

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
        })
    }

    // 获取章节列表
    async get_chapter_list(novelUrl) {
        return this.request(novelUrl, $ => {
            console.log("进入get_chapter_list回调方法")
            let chapter_list = []
            $('div[id=list] dl dd a').each((index, item) => {
                if (index >= 9) {
                    chapter_list.push({
                        'chapterName': $(item).text(),
                        'chapterUrl': this.target_url + $(item).attr('href')
                    })
                }
            })
            return chapter_list
        })
    }

    // 获取章节内容
    async get_chapter_content(chapter_url) {

        return this.request(chapter_url, $ => {

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
        })
    }

}

exports.Biquge5200 = Biquge5200
// module.exports({
//     Biquge5200: Biquge5200
// })