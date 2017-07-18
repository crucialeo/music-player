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
    var p = es('p')
    // log('p', p, p.length, p[12], typeof(p[12]))
    var n = 0
    player.addEventListener('timeupdate', function() {
        var cur = parseInt(player.currentTime)
        var ps = document.getElementById(cur)
        // log('ps', ps)
        if (ps) {
            // 根据 <p> 的 id 来判断是否为当前歌词，如果是就加上 css
            for (var i = 0; i < p.length; i++) {
                p[i].classList.remove('red')
            }
            ps.classList.add('red')
            if (p[5+n].id == cur && p[5+n]) {
                // 播放到某一行，把整个歌词显示区域向上提升一定的像素
                displayedLrc.style.top = -33 * n + 'px'
                n ++
            }
        }
    })
}



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

var labelFromTime = function(time) {
    var minutes = Math.floor(time / 60)
    var seconds = Math.floor(time % 60)
    var t = `${minutes}:${seconds}`
    var ft = formatTime(t)
    return ft
}

// 给进度条
// var bindBarEvents = function() {
//     var value = player.currentTime / player.duration
//     setTime(value)
// }

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

// 设置进度条随时间变化
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
    // bindBarEvents()
    bindTimeDisplay()
    bindSetTime()
}

var __main = function() {
    bindEvents()
}

__main()
