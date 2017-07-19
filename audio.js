var log = console.log.bind(console)
var e = sel => document.querySelector(sel)
var es = sel => document.querySelectorAll(sel)
var appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)

var player = e('#id-audio-player')
var displayedLrc = e('#id-div-lrc')
var timeBar = e('#id-input-slider')
var nowTime = e('#id-time-current')
var totalTime = e('#id-time-duration')


var songs = [
    'Are You OK.mp3',
    '逍遥叹.mp3',
    'Angelica.mp3',
    'The Pirate That Should Not Be.mp3',
    'Pull up a Chair.mp3',
    '勇往直前.mp3'
]
var numberOfSongs = songs.length

// 标记播放状态，true 表示暂停状态，false 表示正在播放
var onOff = true

// 切换标题
var changeTitle = function() {
    var playingId = parseInt(player.dataset.playing)
    var srcName = songs[playingId]
    var songName = srcName.split('.')[0]
    var h1 = e('h1')
    h1.innerHTML = songName
}

// 解析歌词并插入到页面中
var insertLrc = function(id) {
    log('insertLrc id', id)
    var data = e(id)
    var gc = data.innerHTML.split('[')
    var html = ''
    for (var i = 0; i < gc.length; i++) {
        var lrcArr = gc[i].split(']')
        var time = lrcArr[0].split('.')
        var times = time[0].split(':')
        var sec = times[0] * 60 + times[1] * 1
        if (lrcArr[1]) {
            html += `<p id=${sec}>${lrcArr[1]}</p>`
        }
    }
    displayedLrc.innerHTML = html
    displayedLrc.style.top = '0px'
}

// 歌词滚动
var rollLrc = function() {
    // 选出所有歌词
    var p = es('p')
    // 标记当前播放到的歌词所在行数
    var n = 0
    player.addEventListener('timeupdate', function() {
        var cur = parseInt(player.currentTime)
        var jumpedindex = displayedLrc.dataset.jumpedindex
        // 选出 id 匹配的歌词
        var ps = document.getElementById(cur)
        // log('ps', ps)
        if (ps) {
            // 根据 <p> 的 id 来判断是否为当前歌词，如果是就加上 css
            for (var i = 0; i < p.length; i++) {
                p[i].classList.remove('red')
            }
            ps.classList.add('red')
            if (jumpedindex == "") {
                log('情况1 jumpedindex[',jumpedindex,']')
                if (p[5+n].id == cur && p[5+n]) {
                    // 播放到某一行，把整个歌词显示区域向上提升一定的像素
                    displayedLrc.style.top = -33 * n + 'px'
                    n ++
                }
            } else if (jumpedindex != "" && jumpedindex != undefined) {
                log('情况2 jumpedindex[',jumpedindex,']')
            } else {
                log('情况3 jumpedindex[',jumpedindex,']')
            }
        }
    })
}

// 拖动滑块时歌词也会显示到中间
var rollLrcByDrag = function() {
    timeBar.addEventListener('change', function(e) {
        var value = e.target.value
        var time = player.duration * value / 100
        var s = parseInt(time)
        var ps = document.getElementById(s)
        var p = es('p')
        if (p.length > 10) {
            if (ps) {
                for (var i = 0; i < p.length; i++) {
                    if (p[i].id == ps.id) {
                        var index = i
                        log('p 存在的时候*******drag index', index, p[i].id, ps.id)
                        displayedLrc.style.top = -33 * index + 'px'
                    }
                }
            } else {
                log('p 不存在的时候*****value', value, typeof value)
                var h = displayedLrc.clientHeight * Number(value) / 100
                displayedLrc.style.top = - h + 'px'
            }
        }
        // 这个 index 有可能是 undefined，要注意一下
        log('拖动后跳转到的 index', index)
        displayedLrc.dataset.jumpedindex = index
    })
    // player.addEventListener('timeupdate', function(index) {
    //     // log('ouside index', index)
    //     var jump_cur = displayedLrc.dataset.jumpedindex
    //     var cur = parseInt(player.currentTime)
    //     var p = es('p')
    //     var n = 0
    //     log('jump_cur', jump_cur)
    //     if (jump_cur != undefined) {
    //         // var a = Number(jump_cur)
    //         var a = 3 + Number(jump_cur)
    //         log('当前下标的 p 后数3个的 p', a, p[a])
    //         // if (p[3+jump_cur].id == cur && p[3+jump_cur]) {
    //         //     // 播放到某一行，把整个歌词显示区域向上提升一定的像素
    //         //     displayedLrc.style.top = -33 * n + 'px'
    //         //     n ++
    //         // }
    //     } else {
    //         log('index undefined, jump_cur undefined, p undefined')
    //     }
    // })
}

// 时间显示成 00:00 的格式
var formatTime = function(t) {
    var min = t.split(':')[0]
    var sec = t.split(':')[1]
    if (min.length == 1) {
        var m = '0' + min
    } else {
        var m = min
    }
    if (sec.length == 1) {
        var s = '0' + sec
    } else {
        var s = sec
    }
    var c = `${m}:${s}`
    return c
}

// 把原始的毫秒时间转化格式
var labelFromTime = function(time) {
    var minutes = Math.floor(time / 60)
    var seconds = Math.floor(time % 60)
    var t = `${minutes}:${seconds}`
    var ft = formatTime(t)
    return ft
}

// 设置进度条颜色填充
var bindDrag = function() {
    timeBar.addEventListener('change', function(e){
        var value = e.target.value
        // log('value change', typeof value, value)
        var time = player.duration * value / 100
        player.currentTime = time
        timeBar.style.backgroundSize = `${value}% 100%`
    })
    player.addEventListener('timeupdate', function() {
        var v = player.currentTime / player.duration
        var played = v * 100
        timeBar.style.backgroundSize = `${played}% 100%`
    })
}

// 绑定时间显示
var bindTimeDisplay = function() {
    // 当前时间
    player.addEventListener('timeupdate', function() {
        var time = labelFromTime(player.currentTime)
        nowTime.innerHTML = time
    })

    // 总时间
    player.addEventListener('canplay', function() {
        var z = labelFromTime(player.duration)
        timeBar.value = 0
        nowTime.innerHTML = '00:00'
        totalTime.innerHTML = z
    })
}

// 设置进度条滑块随时间向右移动
var bindSetTime = function() {
    player.addEventListener('timeupdate', function() {
        var v = player.currentTime / player.duration
        var t = v * 100
        // log('滑块', v, t, typeof(t))
        // log(timeBar)
        timeBar.value = t
    })
}

// 给控制按钮绑定事件
var bindPlayEvents = function() {
    // 播放按钮
    var playButton = e('#id-button-play')
    playButton.addEventListener('click', function() {
        if (onOff) {
            player.play()
            playButton.innerHTML = '暂停'
            changeTitle()
            rollLrc()
            // log('now playing', player.paused)
        } else {
            player.pause()
            playButton.innerHTML = '播放'
            // log('now paused', player.paused)
        }
        onOff = !onOff
    })

    // 下一首按钮
    var nextButton = e('#id-button-next')
    nextButton.addEventListener('click', function() {
        var playingId = parseInt(player.dataset.playing)
        var i = (playingId + 1) % numberOfSongs
        player.dataset.playing = i
        var newSrc = songs[i]
        player.src = 'src/' + newSrc
        var lrcId = '#id-textarea-lrc-' + String(i)
        insertLrc(lrcId)
        if (onOff) {
            log('现在是暂停状态时候的下一首')
            changeTitle()
        } else {
            player.play()
            changeTitle()
            rollLrc()
        }
    })

    // 上一首按钮
    var prevButton = e('#id-button-prev')
    prevButton.addEventListener('click', function() {
        var playingId = parseInt(player.dataset.playing)
        var i = (playingId - 1 + numberOfSongs) % numberOfSongs
        player.dataset.playing = i
        var newSrc = songs[i]
        player.src = 'src/' + newSrc
        var lrcId = '#id-textarea-lrc-' + String(i)
        insertLrc(lrcId)
        if (onOff) {
            log('现在是暂停状态时候的上一首')
            changeTitle()
        } else {
            player.play()
            changeTitle()
            rollLrc()
        }
    })
}

var bindEvents = function() {
    insertLrc('#id-textarea-lrc-0')
    bindPlayEvents()
    bindTimeDisplay()
    bindSetTime()
    bindDrag()
    rollLrcByDrag()
    // log('没有拖动过的时候的 dataset.jumpedindex*',displayedLrc.dataset.jumpedindex,'*')
}

var __main = function() {
    bindEvents()
}

__main()
