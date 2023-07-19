// components/bookself_item/bookself_item.js
Component({
  /**
   * 组件的属性列表
   */
  // properties: [
  //   cover,
  //   url,
  //   progress_url,
  //   progress_name,
  //   last_update,
  // ],

  properties: {
    name: {type: String},
    cover: {type: String},
    url: {type: String},
    progress_url: {type: String},
    progress_name: {type: String},
    last_update: {type: String},
  },

  /**
   * 组件的初始数据
   */
  data: {
    del: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onMoreClick(){
      this.setData({
        del: ! this.data.del
      })
    },
    onOpenBook(){
      this.triggerEvent('open', {url: this.data.url}, { bubbles: true, composed: true })
    },
    onDel(){
      this.triggerEvent('del', {url: this.data.url}, { bubbles: true, composed: true })
    }
  }
})
