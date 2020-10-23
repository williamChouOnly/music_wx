// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(res){
      console.log(res)
      const userInfo = res.detail.userInfo
      if(userInfo){
        //已授权
        this.setData({
          modalShow:false
        })
        this.triggerEvent('loginsuccess',userInfo)
        
      }else{
        this.triggerEvent('loginfail')
      }
    }
  }
})
