var log = console.log.bind(console)
var e = sel => document.querySelector(sel)
var es = sel => document.querySelectorAll(sel)
var appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)

var player = e('#id-audio-player')
var displayedLrc = e('#id-div-lrc')
var timeBar = e('#id-input-slider')
var nowTime = e('#id-time-current')
var totalTime = e('#id-time-duration')
var listCtn = e('.list-container')
var h1 = e('h1')
var playButton = e('#id-img-play')
var pauseButton = e('#id-img-pause')
var play_pause = e('.play-pause')


// 歌曲
var songs = [
    'Are You OK.mp3',
    '逍遥叹.mp3',
    'Angelica.mp3',
    'The Pirate That Should Not Be.mp3',
    'Pull up a Chair.mp3',
    '勇往直前.mp3'
]
var numberOfSongs = songs.length

// 标记随机播放状态，默认是 false
var randomMode = false

// 标记播放状态，true 表示暂停状态，false 表示正在播放
var onOff = true

// 切换标题
var changeTitle = function() {
    var playingId = parseInt(player.dataset.playing)
    var srcName = songs[playingId]
    var songName = srcName.split('.')[0]
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
    var m = 0

    player.addEventListener('timeupdate', function() {
        var cur = parseInt(player.currentTime)
        // 选出 id 匹配的歌词
        var ps = document.getElementById(cur)
        // log('ps', ps)

        var jumpedindex = displayedLrc.getAttribute('data-jumpedindex')
        var j = Number(jumpedindex)

        var nowh = displayedLrc.dataset.curheight
        var nowHeight = Number(nowh.split('p')[0])
        // log('nowHeight', nowHeight)
        if (ps) {
            // 根据 <p> 的 id 来判断是否为当前歌词，如果是就加上 css
            for (var i = 0; i < p.length; i++) {
                p[i].classList.remove('red')
            }
            ps.classList.add('red')
            if (jumpedindex == "") {
                log('没有拖动滑块')
                if (p[5+n].id == cur && p[5+n]) {
                    // 播放到某一行，把整个歌词显示区域向上提升一定的像素
                    displayedLrc.style.top = -33 * n + 'px'
                    n ++
                }
            } else {
                log('存在对应那个id的index')
                var offset = - 2 * m
                var h = nowHeight + 30 + offset
                // log(h, h+'px', typeof(h+'px'))
                displayedLrc.style.top = h + 'px'
                m ++
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
        log('拖动后跳转到的 index', index, typeof index)
        log('拖动后当前高度', displayedLrc.style.top)
        displayedLrc.dataset.jumpedindex = index
        displayedLrc.dataset.curheight = displayedLrc.style.top
    })
}

// 初始化歌词位置
var initPos = function() {
    displayedLrc.style.top = '0px'
    displayedLrc.dataset.jumpedindex = ''
    displayedLrc.dataset.curheight = ''
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
        // 改变标题
        changeTitle()
        // 如果暂停就不放，如果在播放就播放
        if (onOff) {
            // log('现在是暂停状态时候的下一首')
            timeBar.style.backgroundSize = `0% 100%`
        } else {
            player.play()
            // initPos()
            // rollLrc()
        }
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
    play_pause.addEventListener('click', function() {
        if (onOff) {
            player.play()
            // playButton.innerHTML = '暂停'
            playButton.classList.add('hidden')
            pauseButton.classList.remove('hidden')
            changeTitle()
            rollLrc()
            // log('now playing', player.paused)
        } else {
            player.pause()
            // playButton.innerHTML = '播放'
            pauseButton.classList.add('hidden')
            playButton.classList.remove('hidden')
            // log('now paused', player.paused)
        }
        onOff = !onOff
    })

    // 下一首按钮
    var nextButton = e('#id-img-next')
    nextButton.addEventListener('click', function() {
        if (randomMode) {
            var n = Math.random() * numberOfSongs
            var r = Math.floor(n)
            player.src = 'src/' + songs[r]
            player.dataset.playing = r
            var lrcId = '#id-textarea-lrc-' + String(r)
            insertLrc(lrcId)
            changeTitle()
            timeBar.style.backgroundSize = `0% 100%`
            initPos()
            rollLrc()
            changeBkg(songs[r])
        } else {
            var playingId = parseInt(player.dataset.playing)
            var i = (playingId + 1) % numberOfSongs
            player.dataset.playing = i
            var newSrc = songs[i]
            player.src = 'src/' + newSrc
            var lrcId = '#id-textarea-lrc-' + String(i)
            insertLrc(lrcId)
            initPos()
            rollLrc()
            changeBkg(newSrc)
        }
    })

    // 上一首按钮
    var prevButton = e('#id-img-prev')
    prevButton.addEventListener('click', function() {
        if (randomMode) {
            var n = Math.random() * numberOfSongs
            var r = Math.floor(n)
            player.src = 'src/' + songs[r]
            player.dataset.playing = r
            var lrcId = '#id-textarea-lrc-' + String(r)
            insertLrc(lrcId)
            changeTitle()
            timeBar.style.backgroundSize = `0% 100%`
            initPos()
            rollLrc()
            changeBkg(songs[r])
        } else {
            var playingId = parseInt(player.dataset.playing)
            var i = (playingId - 1 + numberOfSongs) % numberOfSongs
            player.dataset.playing = i
            var newSrc = songs[i]
            player.src = 'src/' + newSrc
            var lrcId = '#id-textarea-lrc-' + String(i)
            insertLrc(lrcId)
            initPos()
            rollLrc()
            changeBkg(newSrc)
        }
    })
}

// 点击播放列表切换歌曲
var bindSwitch = function() {
    listCtn.addEventListener('click', function(e) {
        var name = e.target.innerText
        var folder = 'src/'
        player.src = folder + name + '.mp3'
        // 设置标题
        h1.innerHTML = name
        // 设置歌词
        var l = name + '.mp3'
        for (var i = 0; i < songs.length; i++) {
            if (songs[i] == l) {
                var index = i
                var lrcId = '#id-textarea-lrc-' + String(index)
                insertLrc(lrcId)
            }
        }
        initPos()
        rollLrc()

        var c = name + '.mp3'
        changeBkg(c)

        // 设置播放按钮
        playButton.classList.add('hidden')
        pauseButton.classList.remove('hidden')
        // 标记播放状态
        onOff = false
        // 标记当前正在播放的歌曲id
        player.dataset.playing = index
        // 设置进度条填充归零
        timeBar.style.backgroundSize = `0% 100%`
    })
}


// 顺序播放
var loopPlay = function() {
    log('loopPlay')
    player.addEventListener('ended', function() {
        var playingId = parseInt(player.dataset.playing)
        var i = (playingId + 1) % numberOfSongs
        player.dataset.playing = i
        var newSrc = songs[i]
        player.src = 'src/' + newSrc
        var lrcId = '#id-textarea-lrc-' + String(i)
        insertLrc(lrcId)
        changeTitle()
        timeBar.style.backgroundSize = `0% 100%`
        // player.play()
        initPos()
        rollLrc()
        changeBkg(newSrc)
    })
}
// 单曲循环
var singlePlay = function() {
    log('singlePlay')
    player.addEventListener('ended', function() {
        log('当前的 id', player.dataset.playing)
        var curSongId = Number(player.dataset.playing)
        player.src = 'src/' + songs[curSongId]
        initPos()
        rollLrc()
        changeBkg(songs[curSongId])
        // player.play()
    })
}
// 随机播放
var randomPlay = function() {
    log('randomPlay')
    randomMode = true
    player.addEventListener('ended', function() {
        var n = Math.random() * numberOfSongs
        var r = Math.floor(n)
        player.src = 'src/' + songs[r]
        log('random src', songs[r])
        player.dataset.playing = r
        var lrcId = '#id-textarea-lrc-' + String(r)
        insertLrc(lrcId)
        changeTitle()
        timeBar.style.backgroundSize = `0% 100%`
        // player.play()
        initPos()
        rollLrc()
        changeBkg(songs[r])
    })
}

// 显示循环按钮，隐藏其他两个
var class1 = function() {
    var s = e('#id-img-single')
    var l = e('#id-img-loop')
    var r = e('#id-img-random')
    s.classList.add('hidden')
    l.classList.remove('hidden')
}
// 显示随机按钮，隐藏其他两个
var class2 = function() {
    var s = e('#id-img-single')
    var l = e('#id-img-loop')
    var r = e('#id-img-random')
    l.classList.add('hidden')
    r.classList.remove('hidden')
}
// 显示单曲按钮，隐藏其他两个
var class3 = function() {
    var s = e('#id-img-single')
    var l = e('#id-img-loop')
    var r = e('#id-img-random')
    r.classList.add('hidden')
    s.classList.remove('hidden')
}
// 切换播放模式
var bindModeEvents = function() {
    var mode = {
        loop: loopPlay,
        single: singlePlay,
        random: randomPlay,
    }
    // 选出模式相关的按钮和标签
    var modeButtons = e('.mode-button')
    var s = e('#id-img-single')
    var l = e('#id-img-loop')
    var r = e('#id-img-random')
    // 模式按钮显示的对象
    var toggleClass = {
        loop: class1,
        random: class2,
        single: class3,
    }
    // 默认单曲循环
    singlePlay()
    // 给模式按钮绑定事件
    modeButtons.addEventListener('click', function(event) {
        var action = event.target.dataset.action
        log('action', action)
        var f = mode[action]
        log('当前的模式是', f)
        f()
        // 切换模式按钮显示
        var t = toggleClass[action]
        t()
    })
}
// 切换歌曲的同时切换背景
var changeBkg = function(name) {
    var body = document.querySelector('body')
    var bkgs = {
        'Are You OK.mp3': 'camera-vintage.jpg',
        '逍遥叹.mp3': 'titian.jpeg',
        'Angelica.mp3': 'roof.jpg',
        'The Pirate That Should Not Be.mp3': 'bread.jpeg',
        'Pull up a Chair.mp3': 'guazhe.jpg',
        '勇往直前.mp3': 'car.jpg',
    }
    var c = bkgs[name]
    body.style.background = `url(bkg/${c}) center`
}

var bindEvents = function() {
    insertLrc('#id-textarea-lrc-0')
    bindPlayEvents()
    bindTimeDisplay()
    bindSetTime()
    bindDrag()
    rollLrcByDrag()
    bindSwitch()
    bindModeEvents()
}

var __main = function() {
    bindEvents()
}

__main()
