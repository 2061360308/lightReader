# reptile 云函数详细介绍

## 外部调用

### 参数
云函数需要给出统一的入口main

在调用时main函数接受`type`和`arg`, 前者指定需要使用的函数, 后者是给函数传递的参数

***请求示例***

1. 根据关键字进行搜索  (调用get_novel_list)
```js
{
  "type": "get_novel_list",
  "arg": "诡秘"
}
```

2. 请求书籍详细信息 (调用get_novel_intro)"
```js
{
  "type": "get_novel_intro",
  "arg": "http://www.b520.cc/8_8187/"
}
```
3. 请求章节列表 (调用get_chapter_list)
```js
{
  "type": "get_chapter_list",
  "arg": "http://www.b520.cc/8_8187/"
}
```
4. 请求章节内容
```js
{
  "type": "get_chapter_content",
  "arg": "http://www.b520.cc/8_8187/3899826.html"
}
```

## 返回数据结构

### get_novel_list
[
  // 查询结构一
  {
    authorName: "诡秘OL",  // 书名
    bookName: "能量进化",  // 作者
    bookUrl: "http://www.biquge5200.cc/64_64476/",  // 详情页url
  },
  {
  // 查询结构二
  }
]

**实际返回结构示例**
```js
[
   {authorName: "诡秘OL", bookName: "能量进化", bookUrl: "http://www.biquge5200.cc/64_64476/"},
   {authorName: "诡秘之空想家", bookName: "模拟修仙：开局具现克苏鲁", bookUrl: "http://www.biquge5200.cc/159_159123/"},
   {authorName: "反派驾到", bookName: "诡秘狂欢", bookUrl: "http://www.biquge5200.cc/110_110484/"},
   {authorName: "九三曰", bookName: "诡秘游戏", bookUrl: "http://www.biquge5200.cc/123_123188/"},
   {authorName: "边缘幻想", bookName: "逃离诡秘", bookUrl: "http://www.biquge5200.cc/131_131984/"},
]
```

### get_novel_intro
**返回示例**
```js
{
  authorName: "飞天鱼",  // 作者名
  bookCoverUrl: "http://r.m.b520.cc/files/article/image/8/8187/8187s.jpg",  // 书籍封面
  bookIntro: "八百年前，明帝之子张若尘，被他的未婚妻池瑶公主杀死，一代天骄，就此陨落。八百年后，张若尘重新活了过来，却发现曾经杀死他的未婚妻，已经统一昆仑界，开辟出第一中央帝国，号称“池瑶女皇”。池瑶女皇——统御天下，威临八方；青春永驻，不死不灭。张若尘站在诸皇祠堂外，望着池瑶女皇的神像，心中燃烧起熊熊的仇恨烈焰，“待我重修十三年，敢叫女皇下黄泉”。分享书籍《万古神帝》作者：飞天鱼",
  bookName: "万古神帝",  // 书名
  classifyName: "玄幻小说",  // 分类
  firstChapterUrl: "http://www.biquge5200.cc/8_8187/3899817.html",  // 第一章url
  lastUpdateName: "第四千零七十四章 新的痕迹",  // 最后章节名称
  lastUpdateTime: "2023-07-25",  // 最后更新时间
}
```

### get_chapter_list
**返回示例**
```js
[
   {chapterName: "1.第1章 八百年后", chapterUrl: "http://www.biquge5200.cc/8_8187/3899817.html"},
   {chapterName: "2.第2章 开启神武印记", chapterUrl: "http://www.biquge5200.cc/8_8187/3899818.html"},
   {chapterName: "3.第3章 黄极境", chapterUrl: "http://www.biquge5200.cc/8_8187/3899819.html"},
   {chapterName: "4.第4章 时空秘典", chapterUrl: "http://www.biquge5200.cc/8_8187/3899820.html"},
   {chapterName: "5.第5章 龙象般若", chapterUrl: "http://www.biquge5200.cc/8_8187/3899821.html"},
   {chapterName: "6.第6章 林泞姗", chapterUrl: "http://www.biquge5200.cc/8_8187/3899822.html"},
   {chapterName: "7.第7章 天心剑法", chapterUrl: "http://www.biquge5200.cc/8_8187/3899823.html"},
   {chapterName: "8.第8章 武市", chapterUrl: "http://www.biquge5200.cc/8_8187/3899824.html"},
   {chapterName: "9.第9章 三年前的真相", chapterUrl: "http://www.biquge5200.cc/8_8187/3899825.html"},
   {chapterName: "10.第10章 三十六条经脉", chapterUrl: "http://www.biquge5200.cc/8_8187/3899826.html"},
]
```

### get_chapter_content

**返回示例**
```js
{
  chapterContent: "　　张若尘思索了片刻，又问道：“林辰裕被处死了”↵↵　的少年， ....... ",  // 章节内容
  chapterTitle: " 10.第10章 三十六条经脉",  // 章节名
  nextChapterUrl: "http://www.biquge5200.cc/8_8187/3899827.html",  // 下一章url
  prevChapterUrl: "http://www.biquge5200.cc/8_8187/3899825.html",  // 上一章url
}
```
***注意:*** 由于微信小程序`<text>`标签不识别`<p>`或`<br/>`等标签,获取到的章节内容需要另外格式化
