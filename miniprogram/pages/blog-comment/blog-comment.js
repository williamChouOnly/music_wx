// pages/blog-comment/blog-comment.js
import formatTime from '../../utils/formatTime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog:{},
    commentList:[],
    blogId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      blogId:options.blogId
    })
    // console.log(options)
    this._getBlogDetail()
  },
  //获得博客详情页面数据
  _getBlogDetail(){
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        blogId:this.data.blogId,
        $url:'detail'
      }
    }).then((res) => {
      wx.hideLoading()
      // console.log(res)
      let commentList = res.result.commentList.data
      for(let i = 0;i < commentList.length;i++){
        commentList[i].createTime = formatTime(new Date(commentList[i].createTime))
      }
      this.setData({
        commentList,
        blog:res.result.detail[0],
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
    let blog = this.data.blog
    return{
      title:blog.content,
      path:`/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})