// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })  // 使用当前云环境
const db = cloud.database()  // 初始化数据库

class User{

  openid = null

  constructor(){
    // this.init()
  }

  async init(){
    this.openid = cloud.getWXContext().OPENID  // 用户id
    this.USER = await db.collection('NOVEL_USER')  // USER字段集合
  }

  async addNew(new_data){

    /*
    {
            "name":"东方树叶",
            "url": ""
            "cover":"https://",
            "progress":{
              "name": [],
              "url": []
            },
            "last-update": ""
          }
    */

    return await this.USER.add({
      // data 字段表示需新增的 JSON 数据
      data:new_data
    })
  }

  async queryUser(){
    // 获取openid 和 集合对象
    await this.init()

    // 查询
    // collection 上的 get 方法会返回一个 Promise，因此云函数会在数据库异步取完数据后返回结果
    const res = await db
    .collection("NOVEL_USER")
    .where({
      openid: this.openid
    })
    .get()

    // 判断用户是否存在
    if (res.data.length){
      // console.log(res.data)
      // 返回用户信息
      console.log(res.data)
      return res.data[0]
    }else{
      // 新增用户
      let new_data = {
        openid: this.openid,  // 唯一标识id
        nickName: this.openid.slice(0,6),  // 昵称
        avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",  // 头像地址
        novel_list:[],  // 小说列表
        read_config: { // 阅读配置
            background_color: "#f4ecd1", // 背景颜色
            dark: false, // 日间, 夜间模式
            font_size: 20, // 字号
            font_family: "", // 字体
            flip_mode: "scroll", // 阅读翻页模式
            line_height_rate: "1.5", // 行间距比率
        }
      }
      await this.addNew(new_data)
      // 返回用户信息
      return new_data
    }
  }

  async update(value){
    await this.init()

    // console.log("开始",this.openid)

    return await db
    .collection("NOVEL_USER")
    .where({ openid: this.openid })
    .update({
      data:value
    })
  }

}
exports.main = async (event) => {

  const user =  new User();

  if(event.type === "queryUser"){
    return await user.queryUser();
  }else if(event.type === "update"){
    return await user.update(event.arg);
  }
}