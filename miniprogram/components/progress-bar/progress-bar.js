// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
let sameSec = 0
let duration = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let isMoving = false
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0,
    
  },
  lifetimes:{
    ready(){
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      if(event.detail.source == 'touch'){
        this.data.progress = event.detail.x / (movableAreaWidth -movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd(){
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress, 
        movableDis:this.data.movableDis,
        ['showTime.currentTime']:`${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis(){
      const query = this.createSelectorQuery()
      //获取当前设备信息
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
         movableAreaWidth = rect[0].width
         movableViewWidth = rect[1].width
        console.log(movableAreaWidth)
        console.log(movableViewWidth)
      })
    },
    _bindBGMEvent(){
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
      })
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
        
        
      })
      backgroundAudioManager.onPause(() => {
        console.log('onPause')
        this.triggerEvent('musicPause')
       
      })
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        if(typeof backgroundAudioManager.duration != 'undefined'){
          this._setTime()
        }else{
          setTimeout(() => {
            this._setTime()
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime
        const duration = backgroundAudioManager.duration       
        const sec = currentTime.toString().split('.')[0]
        if(sec != sameSec){
          const currentTimeFmt = this._dateFormat(sec)
          // console.log(currentTimeFmt.sec)
          
          this.setData({
            ['showTime.currentTime']:`${currentTimeFmt.min}:${currentTimeFmt.sec}`,
            movableDis:(movableAreaWidth - movableViewWidth)*currentTime / duration,
            progress:currentTime / duration * 100
          })
          sameSec = sec
          //联动歌词
          this.triggerEvent('timeUpdate',{
            currentTime
          })
        }
        }
        
        
      })
      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((res) => {
        console.log('res.errMsg')
        console.log('res.errCode')
        wx.showToast({
          title: '错误：' + res.errCode,
        })
      })
    },
    _setTime(){
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      console.log(duration)
      console.log(durationFmt)
      this.setData({
        ['showTime.totalTime']:`${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat(sec){
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min':this._parse0(min),
        'sec':this._parse0(sec)
      }
    },
    _parse0(sec){
      return sec < 10 ? '0'+sec : sec
    }
  }
})
