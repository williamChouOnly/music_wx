// pages/profile-bloghistory/profile-bloghistory.js
const db = wx.cloud.database()
const MAX_LIMIT = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bloglist:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBloglist()
  },
  _loadBloglist(){
    wx.showLoading({
      title: '努力加载中',
    })
    
    db.collection('blog').skip(this.data.bloglist.length).limit(MAX_LIMIT)
    .orderBy("createTime","desc").get().then((res) => {
      let _musiclist = res.data
      for(let i = 0;i < _musiclist.length; i++){
        _musiclist[i].createTime =  _musiclist[i].createTime.toString()
      }
      // console.log(res)
      wx.hideLoading()
      this.setData({
        bloglist:this.data.bloglist.concat(_musiclist)
      })
    })
  },
  goComment(event){
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
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
    this._loadBloglist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    const blog = event.target.dataset.blog
    return{
      title:blog.content,
      path:"/pages/blog-comment/blog-comment?blogId=${blog._id}"
    }
  }
})