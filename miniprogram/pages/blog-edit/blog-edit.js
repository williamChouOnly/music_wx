// miniprogram/pages/blog-edit/blog-edit.js
const Max_words_length = 140    //发布文字最大数量
const Max_picture_length = 9    //发布图片最大数量
       
const db = wx.cloud.database()
let userInfo = {}   //用户信息
let content = ''   //发布内容
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,
    footerBottom:0,
    images:[],
    selectPhoto:true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options
  },
  onInput(event){
    // console.log(event.detail.value)
    const value = event.detail.value
    this.setData({
      wordsNum:value.length
    })
    if(value.length >= Max_words_length){
      this.setData({
        wordsNum:`最多输入${Max_words_length}个字`
      })
    }
    content = value
  },
  onFocus(event){
    // console.log(event)
    this.setData({
      footerBottom:event.detail.height
    })
  },
  onBlur(){
    this.setData({
      footerBottom:0
    })
  },
  onChooseImage(){
    let max = Max_picture_length - this.data.images.length
    wx.chooseImage({
      count:max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:(res) => {
        console.log(res)
        this.setData({
          images:this.data.images.concat(res.tempFilePaths)
        })
        max = Max_picture_length - this.data.images.length
        this.setData({
            selectPhoto:max <= 0 ? false : true
        })
      } 
    })
  },
  onDelImage(event){
    this.data.images.splice(event.target.dataset.index,1)
    this.setData({
      images:this.data.images
    })
    if(this.data.images.length == Max_picture_length-1){
      this.setData({
        selectPhoto:true
      })
    }
  },
  onPreviewImage(event){
    wx.previewImage({
      urls: this.data.images,
      current:event.target.dataset.imgsrc
    })
  },
  send(){
    if(content.trim() == ''){
      wx.showModal({
        title: '发表内容不能为空',
      })
      return
    }
    wx.showLoading({
      title: '发布中',
      mask:true
    })
    let PromiseList = []
    let fileIds = []
    for(let i = 0;i < this.data.images.length; i++){
      let p = new Promise((resolve,reject) =>{
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0] //获得文件后缀
        wx.cloud.uploadFile({
          cloudPath:'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,  //设置云文件路径
          filePath:item,  //上传文件的路径
          success:(res) => {
            console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail:(err) => {
            console.log(err)
            reject()
          }
        })
      })
      PromiseList.push(p)  
    }
    Promise.all(PromiseList).then((res) => {
      db.collection('blog').add({ //添加到云数据库
        data:{
          ...userInfo,
          content,
          img:fileIds,
          createTime:db.serverDate()
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
          mask: true
        })
        // 返回blog页面，并且刷新
        wx.navigateBack()

        const pages = getCurrentPages()
        const prevPage = pages[pages.length-2]  // 取到上一个页面
        prevPage.onPullDownRefresh()
  
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})