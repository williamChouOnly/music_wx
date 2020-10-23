// pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying:false,// false表示不播放，true表示正在播放
    isLyricShow:false,//表示当前歌词是否显示
    lyric:'',
    isSame: false, // 表示是否为同一首歌
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    musiclist = wx.getStorageSync('musiclist')
    nowPlayingIndex = options.index
    this._loadMusicDetail(options.musicId)

  },
  
  
  //将currentTime传给lyric组件
  timeUpdate(event){
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onChangeLyricShow(){
    this.setData({
      isLyricShow:!this.data.isLyricShow
    })
  },
  _loadMusicDetail(musicId){
    
    if(musicId == app.getPlayMusicId()){
      this.setData({
        isSame: true
      })
    }else{
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame){
      backgroundAudioManager.stop()
    }
   
    
    let music = musiclist[nowPlayingIndex]
    // console.log(music)
    
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl:music.al.picUrl,
      isPlaying: false
    })
    app.setPlayMusicId(musicId)
    
    wx.showLoading({
      title: '歌曲加载中',
    })

    //获取音乐目录
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl',
        
      }
    }).then((res) => {
      
      let result = JSON.parse(res.result)
      // console.log(result)
      if(result.data[0].url == null){
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if(!this.data.isSame){
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.epname = music.al.name
        // 保存播放历史
        this.savePlayHistory()
      }
      

      this.setData({
        isPlaying:true
      })
      // this.data.isPlaying = !this.data.isPlaying
      
      wx.hideLoading()

      //获取歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url:'lyric'
        }
      }).then((res) => {
        // console.log(JSON.parse(res.result))
        const lrc = JSON.parse(res.result).lrc
        let lyric = '暂无歌词'
        if(lrc){    
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
    

  },
  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause()
    }else{
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying:!this.data.isPlaying
    })
  },
  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    nowPlayingIndex++
    if(nowPlayingIndex === musiclist.length){
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onPause(){
    this.setData({
      isPlaying:false
    })
  },
  onPlay(){
    this.setData({
      isPlaying:true
    })
  },
  //保存播放历史
  savePlayHistory(){
    //获得当前播放的音乐信息
    const music = musiclist[nowPlayingIndex]
    //获得appjs的全局openid
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let bHave = false
    for(let i = 0;i < history.length; i++){
      if(history[i].id === music.id){
        bHave = true
        break
      }
    }
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history
      })
    }
    
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