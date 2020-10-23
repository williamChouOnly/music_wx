// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog: Object,
  },
  externalClasses:['iconfont','icon-pinglun','icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false, //登录组件是否显示
    modalShow:false,  //评论框组件是否显示
    content:'',   //评论内容
    // footerBottom:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      wx.getSetting({
        success: (res) => {
          // console.log(res)
          //  判断是否授权
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                this.setData({
                  modalShow:true
                })
                // console.log(res)
              },
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        },
      })
    },
    //授权成功
    onLoginsuccess(event){
      // console.log(event)
      userInfo = event.detail
      this.setData({
        loginShow:false
      },() => {
        this.setData({
          modalShow:true
        })
      })
    },
    //授权失败
    onLoginfail(){
      wx.showModal({
        title: '授权用户才可以评论',
      })
    },
    onInput(event){
      // console.log(event)
      this.setData({
        content:event.detail.value
      })
    },
    // onFocus(event){
    //   // console.log(event)
    //   this.setData({
    //     footerBottom:event.detail.height
    //   })
    // },
    onSend(){
      // console.log(event.detail.value)
      // let content = event.detail.value.content
      let content = this.properties.content
      if(content.trim() == ''){
        wx.showModal({
          title: '评论内容不能为空',
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask:true
      })
      db.collection('blog-comment').add({
        data:{
          createTime:db.serverDate(),
          content,
          blogId:this.properties.blogId,
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow:false,
          content:''
       })
      // 父元素刷新评论页面
      this.triggerEvent('refreshCommentList')
      //  wx.navigateTo({
      //    url: `../../pages/blog-comment/blog-comment?blogId=${this.properties.blogId}`,
      //  })
      })
    }
  }
})
