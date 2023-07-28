<div align="center">
  <h1>lightReader(暂停维护)</h1>

  <p>
    <img src="https://img.shields.io/github/languages/code-size/2061360308/lightReader" alt="code-size" />
    <img src="https://img.shields.io/github/languages/count/2061360308/lightReader" alt="languages-count" />
    <img src="https://img.shields.io/github/languages/top/2061360308/lightReader?color=yellow" alt="languages-top" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/Author-2061360308-orange" alt="Author" />
    <img src="https://img.shields.io/github/last-commit/2061360308/lightReader" alt="last-commit" />
  </p>

  <p>:heart: 微信小程序 - :+1:个人小说阅读器 </p>
  <p><i></i></p>
</div>

<img src="docs/images/poster.jpg" style="object-fit:scale-down; width: 100%;"/>

**相关文档** ==>
[微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/api.html) / [TDesign](https://tdesign.tencent.com/miniprogram/overview)

<br />

## 简单使用
1. 克隆项目到本地`git clone https://github.com/2061360308/lightReader.git`
2. 使用微信开发者工具打开项目
3. 上传并部署`cloudfunctions`目录下俩个云函数
4. 将`miniprogram目录下app.js文件`中`wx.cloud.init`函数下参数`env: 'cloud1-5gn2xxba0286dda1'`中的值更改为个人的云开发环境id
5. 准备完毕! 自选 编译预览,或上传打包等操作
## 项目完成度
- [x] 支持多用户使用
- [x] 线上自动同步阅读进度和配置项数据
- [x] 个人书架
- [x] 书籍搜索(支持书名,作者等等)
- [x] 书籍详情
- [x] 阅读器基本功能(翻页阅读, 查看目录(正倒序), 手动,自动切换章节, 夜间模式, 字号,间距调整, 多种阅读背景)
- [ ] 阅读器字体切换
- [ ] 阅读器滚动,仿真等多种翻页模式
- [ ] 阅读器亮度调节
- [ ] 添加删除书签
- [ ] 多书源支持
## 目录介绍
[详细说明见docs/directory_structure.md](docs/directory_structure.md)

- 目录`/miniprogram` : 小程序项目根目录
- 目录`/miniprogram/pages/index`  入口页面 (书架)
- 目录`/miniprogram/pages/search`  搜索页面
- 目录`/miniprogram/pages/detail`  搜索结果 书籍详情页面
- 目录`/miniprogram/pages/horizontal`  阅读页面(横版滑动翻页)
- 目录`/cloudfunctions/reptile` 云函数爬虫
- 目录`/cloudfunctions/user` 云函数用户管理
## 云开发
> 这是个人的学习项目, 鉴于js无法跨域直接制作爬虫,而是需要node这样类似的后端提供代理. 故使用微信小程序配套的云开发的云函数功能制作了爬虫,并且使用云开发的云数据库来储存用户云端数据实现了多用户,跨设备同步数据的功能. ( **注意** 本项目中云开发中许多方法都只适用于小程序端,如果需要另外打包app那么你需要根据官方文档进行相应的适配)
### 爬虫
> "reptile"云函数中提供了以下四个接口函数
- get_novel_list        根据关键词搜索小说
- get_novel_intro       根据书籍详情页url爬取对应详细信息
- get_chapter_list      根据书籍详情页url爬取对应章节列表
- get_chapter_content   根据章节url爬取对应章节内容

以上四个函数均是负责解析网页html内容并返回需要信息,其使用了`cheerio`库

而另外还有一个不对外的公共函数`request`它负责根据url请求html内容,具体使用了`axios`库

此外由于本示例爬虫对应目标编码格式为node无法处理的gbk形式, 故`request`还使用了`iconv`库来处理编码问题

如果需要重写爬虫或继续开发多书源的功能, [docs/reptile.md](docs/reptile.md)中介绍的有关"reptile"云函数的详细信息或许会对您有所帮助.

### 用户信息管理
> "user"云函数提供了对访问云数据库, 管理用户信息的功能,它并没有类似"登录","注册"等等管理用户的能力,只是通过微信云开发提供的"openid"来识别不同用户.
