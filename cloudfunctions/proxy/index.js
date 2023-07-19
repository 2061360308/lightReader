// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios');
// const cheerio = require('cheerio');
const iconv = require('iconv-lite');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

function request(url) {
    // 这是一个异步事件, 所以我必须返回一个promise对象, 以便后续调用时可以正常获取到返回值
    // 返回 Promise 对象
    // 箭头函数的this指向调用者
    return new Promise((resolve, reject) => {
        console.info("进入request方法准备请求")
        axios
            .get(url, {
                responseType: 'arraybuffer',
                transformResponse: [
                    function (data) {
                        return iconv.decode(data, 'gbk')
                    },
                ],
            })
            .then((resp) => {
                // 返回结果
                resolve(resp.data)
            })
            .catch((err) => {
                reject({
                    status: "fail",
                    result: err
                })
            })
    })
}

// 云函数入口函数
exports.main = async (event) => {
    return await request(event.url)
}